"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Room } from "livekit-client";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

interface ChatMessage {
  role: string;             // "user" | "assistant"
  content: string;
  isVoiceMessage?: boolean;
}

interface ChatWindowProps {
  activeChatId: string | null; // comes from ChatHistory click
}

/* ------------------------ Dummy threads for history ------------------------ */
/* IDs match the items defined in ChatHistory (1..5). You can extend freely.  */
const DUMMY_THREADS: Record<string, ChatMessage[]> = {
  "1": [
    { role: "assistant", content: "Hi! I’m here with you. What’s on your mind today?" },
    { role: "user", content: "Mostly stress from studies and not sleeping well." },
    { role: "assistant", content: "Thanks for sharing. On a scale of 1–10, how intense is the stress right now?" },
  ],
  "2": [
    { role: "user", content: "I panic before presentations." },
    { role: "assistant", content: "Let’s try a 4–7–8 breathing cycle together. Ready?" },
    { role: "user", content: "Okay, let’s try it." },
    { role: "assistant", content: "Inhale for 4… hold for 7… exhale for 8… repeat 4 times." },
  ],
  "3": [
    { role: "assistant", content: "How did this week’s therapy homework go?" },
    { role: "user", content: "I completed the journaling twice, felt lighter." },
    { role: "assistant", content: "That’s great progress. Want to keep the same pace next week?" },
  ],
  "4": [
    { role: "user", content: "Any quick ways to reduce stress during commute?" },
    { role: "assistant", content: "Try box breathing and a short body scan. I can guide you now if you’d like." },
  ],
  "5": [
    { role: "assistant", content: "Tell me what’s felt heavy lately." },
    { role: "user", content: "Trouble focusing; everything feels scattered." },
    { role: "assistant", content: "Let’s make a tiny checklist for the next hour. Two small tasks. Deal?" },
  ],
};

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChatId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isConnectedToSTT, setIsConnectedToSTT] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [microphonePermission, setMicrophonePermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  // Session key (once)
  const sessionKeyRef = useRef<string>("");
  if (typeof window !== "undefined" && !sessionKeyRef.current) {
    sessionKeyRef.current =
      localStorage.getItem("session_key") ||
      localStorage.getItem("authToken") ||
      "guest";
  }
  const sessionKey = sessionKeyRef.current;

  // Per-thread storage key: default (no chat selected) vs. specific history thread
  const BASE_STORAGE = useMemo(() => `chat_msgs_${sessionKey}`, [sessionKey]);
  const STORAGE_KEY = useMemo(
    () => (activeChatId ? `${BASE_STORAGE}_thread_${activeChatId}` : BASE_STORAGE),
    [BASE_STORAGE, activeChatId]
  );

  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const sttInitializedRef = useRef(false);
  const historyLoadedRef = useRef(false);

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  const fallbackResponses = [
    "I apologize for the inconvenience. Our servers are currently experiencing some issues. Please try again later, and in the meantime, consider taking some deep breaths or practicing mindfulness.",
    "Sorry, I'm having trouble connecting to our servers right now. While we work on resolving this, remember that it's okay to take a moment for yourself.",
    "I'm experiencing some technical difficulties at the moment. Please bear with us. In the meantime, try some grounding exercises like focusing on your breathing.",
    "Our service is temporarily unavailable. I apologize for any inconvenience. Consider reaching out to a trusted friend or practicing some self-care while we resolve this issue.",
  ];

  const isBackendConnected =
    process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  /* ----------------- load on mount + whenever chat selection changes ----------------- */
  useEffect(() => {
    // 1) Try to restore the selected thread from localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          // Initialize STT after we set messages (once per mount)
          initializeSTTRoom();
          return;
        }
      }
    } catch {
      // ignore cache issues
    }

    // 2) If a previous chat is selected, show its dummy thread (no design changes)
    if (activeChatId && DUMMY_THREADS[activeChatId]) {
      setMessages(DUMMY_THREADS[activeChatId]);
      initializeSTTRoom();
      return;
    }

    // 3) No previous chat selected → original behavior: greeting or fetch history
    const boot = async () => {
      if (historyLoadedRef.current) return;
      historyLoadedRef.current = true;

      if (sessionKey && isBackendConnected) {
        try {
          const r = await fetch(`/api/history/${encodeURIComponent(sessionKey)}`);
          if (r.ok) {
            const data = await r.json();
            const fromServer: ChatMessage[] =
              data?.chat_history && Array.isArray(data.chat_history)
                ? data.chat_history
                : [];
            setMessages(
              fromServer.length
                ? fromServer
                : [{ role: "assistant", content: "Hi there!" }]
            );
          } else {
            setMessages([{ role: "assistant", content: "Hi there!" }]);
          }
        } catch {
          setMessages([{ role: "assistant", content: "Hi there!" }]);
        }
      } else {
        setMessages([{ role: "assistant", content: "Hi there!" }]);
      }

      initializeSTTRoom();
    };

    boot();

    return () => {
      roomInstance.disconnect();
    };
    // re-run when switching chats (STORAGE_KEY changes with activeChatId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY, activeChatId, isBackendConnected, sessionKey]);

  /* ------------------------ persist messages per-thread ------------------------ */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, STORAGE_KEY]);

  /* ------------------------------- autoscroll ------------------------------- */
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* ------------------------------- STT setup ------------------------------- */
  const initializeSTTRoom = async () => {
    if (sttInitializedRef.current) return;

    try {
      sttInitializedRef.current = true;
      if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
        setIsConnectedToSTT(false);
        return;
      }

      const permission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      setMicrophonePermission(permission.state);

      const transcriptionRoom = `transcription_${sessionKey}_${Date.now()}`;
      const resp = await fetch(
        `/api/token?room=${transcriptionRoom}&username=user_${sessionKey.slice(-8)}`
      );
      const data = await resp.json();

      if (data.token && process.env.NEXT_PUBLIC_LIVEKIT_URL) {
        await roomInstance.connect(
          process.env.NEXT_PUBLIC_LIVEKIT_URL,
          data.token
        );

        await roomInstance.localParticipant.setMicrophoneEnabled(true, undefined);
        setIsConnectedToSTT(true);

        roomInstance.on("dataReceived", (payload: any) => {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(payload));
            handleSTTResult(parsed);
          } catch (error) {
            console.error("Error parsing STT data:", error);
          }
        });

        const micTrack = (roomInstance as any).localParticipant
          ?.getTrackPublication("microphone")
          ?.track;
        if (micTrack) {
          startAudioLevelMonitoring(micTrack);
        }
      }
    } catch (error) {
      console.error("Error connecting to STT room:", error);
      setMicrophonePermission("denied");
      setIsConnectedToSTT(false);
      sttInitializedRef.current = false;
    }
  };

  const startAudioLevelMonitoring = (track: any) => {
    if (!track || !track.mediaStreamTrack) return;
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(
        new MediaStream([track.mediaStreamTrack])
      );
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!isRecording) return;
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        setAudioLevel(normalizedLevel);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (error) {
      console.error("Error setting up audio monitoring:", error);
    }
  };

  const handleSTTResult = (data: any) => {
    if (data.type === "voice_message_result" && data.success) {
      const userVoiceMessage: ChatMessage = {
        role: "user",
        content: data.transcription,
        isVoiceMessage: true,
      };
      setMessages((prev) => [...prev, userVoiceMessage]);
      processVoiceTranscription(data.transcription);
    } else if (data.type === "voice_message_cancelled") {
      // no-op
    } else if (!data.success) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not process your voice message. Please try again.",
        },
      ]);
    }
    setVoiceLoading(false);
    setIsRecording(false);
  };

  const processVoiceTranscription = async (transcription: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_key: sessionKey, message: transcription }),
      });

      if (!response.ok) throw new Error("Failed to process voice message");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error processing voice transcription:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your voice message.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------- send --------------------------------- */
  const handleSend = async (text: string) => {
    if (text.trim() === "") return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);

    if (!(process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true")) {
      // Offline/demo mode → random fallback
      setTimeout(() => {
        const options = fallbackResponses;
        const randomResponse = options[Math.floor(Math.random() * options.length)];
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: randomResponse },
        ]);
        setLoading(false);
        setIsTyping(false);
      }, 900);
      return;
    }

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_key: sessionKey, message: text }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const ct = response.headers.get("Content-Type") || "";
      if (ct.includes("application/json")) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        const txt = await response.text();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: txt || "…" },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm experiencing technical difficulties right now. Please try again in a few moments. If the problem persists, consider reaching out to our support team.",
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  /* ------------------------------ voice controls ------------------------------ */
  const startVoiceRecording = async () => {
    if (!isConnectedToSTT || isRecording) return;
    try {
      setIsRecording(true);
      await roomInstance.localParticipant.setMicrophoneEnabled(true);
      setTimeout(() => {
        const pub = (roomInstance as any)
          .localParticipant?.getTrackPublication("microphone");
        if (pub?.track) startAudioLevelMonitoring(pub.track);
      }, 500);

      await roomInstance.localParticipant.performRpc({
        method: "start_turn",
        destinationIdentity: "transcription-agent",
        payload: "",
      });
    } catch (error) {
      console.error("Error starting voice recording:", error);
      setIsRecording(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Voice recording failed to start. Please check your connection and try again.",
        },
      ]);
    }
  };

  const sendVoiceRecording = async () => {
    if (!isConnectedToSTT || !isRecording) return;
    try {
      setVoiceLoading(true);
      setAudioLevel(0);
      await roomInstance.localParticipant.performRpc({
        method: "end_turn",
        destinationIdentity: "transcription-agent",
        payload: "",
      });
    } catch (error) {
      console.error("Error sending voice recording:", error);
      setIsRecording(false);
      setVoiceLoading(false);
    }
  };

  const cancelVoiceRecording = async () => {
    if (!isConnectedToSTT) return;
    try {
      setAudioLevel(0);
      await roomInstance.localParticipant.performRpc({
        method: "cancel_turn",
        destinationIdentity: "transcription-agent",
        payload: "",
      });
      setIsRecording(false);
      setVoiceLoading(false);
    } catch (error) {
      console.error("Error cancelling voice recording:", error);
    }
  };

  return (
    <RoomContext.Provider value={roomInstance}>
      <div className="h-full w-full max-w-screen mx-auto flex flex-col bg-[#FFFFFF] rounded-xl font-quicksand min-h-0">
        <RoomAudioRenderer />

        {/* Messages */}
        <div
          ref={chatBoxRef}
          className="flex-1 min-h-0 p-4 overflow-y-auto space-y-2"
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={`${index}-${msg.role}-${msg.content.slice(0, 12)}`}
              text={msg.content}
              isUser={msg.role === "user"}
              isVoiceMessage={msg.isVoiceMessage}
            />
          ))}
          {isTyping && (
            <div className="text-sm text-gray-500 italic animate-pulse ml-2">
              RAISC is typing...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 shrink-0">
          <InputBar
            onSend={handleSend}
            onVoiceStart={startVoiceRecording}
            onVoiceSend={sendVoiceRecording}
            onVoiceCancel={cancelVoiceRecording}
            isRecording={isRecording}
            voiceLoading={voiceLoading}
            isConnectedToSTT={isConnectedToSTT}
            audioLevel={audioLevel}
          />
        </div>
      </div>
    </RoomContext.Provider>
  );
};

export default ChatWindow;

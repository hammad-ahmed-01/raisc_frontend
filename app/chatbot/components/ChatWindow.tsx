"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Room } from "livekit-client";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import ChatLimitPopup from "./ChatLimitPopup";

interface ChatMessage {
  role: string;
  content: string;
  isVoiceMessage?: boolean;
}
interface ChatWindowProps {
  activeChatId: string | null;
}

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
  const MAX_FREE_REPLIES = 20;

  const [assistantReplyCount, setAssistantReplyCount] = useState(0);
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isConnectedToSTT, setIsConnectedToSTT] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // const incrementAssistantCount = () => {
  //   setAssistantReplyCount((prev) => {
  //     const next = prev + 1;
  //     if (next >= MAX_FREE_REPLIES) {
  //       setShowLimitPopup(true);
  //     }
  //     return next;
  //   });
  // };

  const sessionKeyRef = useRef<string>("");
  if (typeof window !== "undefined" && !sessionKeyRef.current) {
    sessionKeyRef.current =
      localStorage.getItem("session_key") ||
      localStorage.getItem("authToken") ||
      "guest";
  }
  const sessionKey = sessionKeyRef.current;

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

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          initializeSTTRoom();
          return;
        }
      }
    } catch {}

    if (activeChatId && DUMMY_THREADS[activeChatId]) {
      setMessages(DUMMY_THREADS[activeChatId]);
      initializeSTTRoom();
      return;
    }

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
            setMessages(fromServer.length ? fromServer : [{ role: "assistant", content: "Hi there!" }]);
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
    return () => { roomInstance.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY, activeChatId, isBackendConnected, sessionKey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, STORAGE_KEY]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const assistantCount = messages.filter(
      (m) => m.role === "assistant"
    ).length;

    setAssistantReplyCount(assistantCount);

    if (assistantCount >= MAX_FREE_REPLIES) {
      // setShowLimitPopup(true);
    }
  }, [messages]);


  const initializeSTTRoom = async () => {
    if (sttInitializedRef.current) return;
    try {
      sttInitializedRef.current = true;
      if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) { setIsConnectedToSTT(false); return; }

      const transcriptionRoom = `transcription_${sessionKey}_${Date.now()}`;
      const resp = await fetch(`/api/token?room=${transcriptionRoom}&username=user_${sessionKey.slice(-8)}`);
      const data = await resp.json();

      if (data.token && process.env.NEXT_PUBLIC_LIVEKIT_URL) {
        await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, data.token);
        await roomInstance.localParticipant.setMicrophoneEnabled(true, undefined);
        setIsConnectedToSTT(true);

        roomInstance.on("dataReceived", (payload: any) => {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(payload));
            handleSTTResult(parsed);
          } catch (e) { console.error("Error parsing STT data:", e); }
        });

        const micTrack = (roomInstance as any).localParticipant?.getTrackPublication("microphone")?.track;
        if (micTrack) startAudioLevelMonitoring(micTrack);
      }
    } catch (e) {
      console.error("Error connecting to STT room:", e);
      setIsConnectedToSTT(false);
      sttInitializedRef.current = false;
    }
  };

  const startAudioLevelMonitoring = (track: any) => {
    if (!track || !track.mediaStreamTrack) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!isRecording) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
        setAudioLevel(Math.min(average / 128, 1));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.error("Error setting up audio monitoring:", e);
    }
  };

  const handleSTTResult = (data: any) => {
    if (data.type === "voice_message_result" && data.success) {
      const userVoiceMessage: ChatMessage = { role: "user", content: data.transcription, isVoiceMessage: true };
      setMessages((prev) => [...prev, userVoiceMessage]);
      processVoiceTranscription(data.transcription);

    } else if (!data.success) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I could not process your voice message. Please try again." }]);
      //incrementAssistantCount();
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      //incrementAssistantCount();
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error processing your voice message." }]);
      //incrementAssistantCount();
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text: string) => {
    if (showLimitPopup) return;
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setIsTyping(true);


    if (!isBackendConnected) {
      setTimeout(() => {
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
        //incrementAssistantCount();
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
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        //incrementAssistantCount();
      } else {
        const txt = await response.text();
        setMessages((prev) => [...prev, { role: "assistant", content: txt || "…" }]);
        //incrementAssistantCount();
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I’m having trouble right now. Please try again in a moment." }]);
      //incrementAssistantCount();
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const startVoiceRecording = async () => {
    if (!isConnectedToSTT || isRecording) return;
    try {
      setIsRecording(true);
      await roomInstance.localParticipant.setMicrophoneEnabled(true);
      setTimeout(() => {
        const pub = (roomInstance as any).localParticipant?.getTrackPublication("microphone");
        if (pub?.track) startAudioLevelMonitoring(pub.track);
      }, 500);
      await roomInstance.localParticipant.performRpc({ method: "start_turn", destinationIdentity: "transcription-agent", payload: "" });
    } catch {
      setIsRecording(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "Voice recording failed to start. Please check your connection and try again." }]);
    }
  };

  const sendVoiceRecording = async () => {
    if (!isConnectedToSTT || !isRecording) return;
    try {
      setVoiceLoading(true);
      setAudioLevel(0);
      await roomInstance.localParticipant.performRpc({ method: "end_turn", destinationIdentity: "transcription-agent", payload: "" });
    } catch {
      setIsRecording(false);
      setVoiceLoading(false);
    }
  };

  const cancelVoiceRecording = async () => {
    if (!isConnectedToSTT) return;
    try {
      setAudioLevel(0);
      await roomInstance.localParticipant.performRpc({ method: "cancel_turn", destinationIdentity: "transcription-agent", payload: "" });
      setIsRecording(false);
      setVoiceLoading(false);
    } catch {}
  };

  return (
    <RoomContext.Provider value={roomInstance}>
      {/* Mobile: fills available height from parent (which is min-h-screen); Desktop: unchanged */}
      <div className="h-full w-full mx-auto flex flex-col rounded-none md:rounded-xl font-quicksand min-h-0 bg-gradient-to-br from-[#EEF5FF] to-[#F6E9F9] md:bg-white md:bg-none overflow-hidden">
        <RoomAudioRenderer />

        {/* Scrollable messages area */}
        <div ref={chatBoxRef} className="flex-1 min-h-0 p-4 overflow-y-auto space-y-2">
          {messages.map((msg, index) => (
            <MessageBubble
              key={`${index}-${msg.role}-${msg.content.slice(0, 12)}`}
              text={msg.content}
              isUser={msg.role === "user"}
              isVoiceMessage={msg.isVoiceMessage}
            />
          ))}
          {isTyping && <div className="text-sm text-gray-500 italic animate-pulse ml-2">RAISC is typing...</div>}
        </div>

        {/* Input stays at bottom */}
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
      {showLimitPopup && (
        <ChatLimitPopup
          onBookTherapist={() => {
            window.location.href = "/Doctors"; 
          }}
        />
      )}
    </RoomContext.Provider>
  );
};

export default ChatWindow;

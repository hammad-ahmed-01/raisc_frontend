"use client";

import React, { useEffect, useState, useRef } from "react";
import { Room } from 'livekit-client';
import { RoomContext, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

interface ChatMessage {
  role: string;
  content: string;
  isVoiceMessage?: boolean;
}

interface ChatWindowProps {
  activeChatId: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChatId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isConnectedToSTT, setIsConnectedToSTT] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [testSessionKey, setTestSessionKey] = useState(process.env.TEST_SESSION_KEY || "97bb09258dcb1dffae5ac9c375809e473c65740b");

  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const sttInitializedRef = useRef(false);
  const [roomInstance] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }));

  const fallbackResponses = [
    "I apologize for the inconvenience. Our servers are currently experiencing some issues. Please try again later, and in the meantime, consider taking some deep breaths or practicing mindfulness.",
    "Sorry, I'm having trouble connecting to our servers right now. While we work on resolving this, remember that it's okay to take a moment for yourself.",
    "I'm experiencing some technical difficulties at the moment. Please bear with us. In the meantime, try some grounding exercises like focusing on your breathing.",
    "Our service is temporarily unavailable. I apologize for any inconvenience. Consider reaching out to a trusted friend or practicing some self-care while we resolve this issue."
  ];

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const session_key = testSessionKey;
    if (session_key && isBackendConnected) {
      fetchChatHistory(session_key);
    } else {
      setMessages([{ role: "assistant", content: "Hi there! How can I assist you today?" }]);
    }
    
    // Initialize STT room connection
    initializeSTTRoom();
    console.log("initializeSTTRoom()")
    return () => {
      roomInstance.disconnect();
    };
  }, [activeChatId, isBackendConnected]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const initializeSTTRoom = async () => {
    if (sttInitializedRef.current) {
    console.log('STT already initialized, skipping...');
    return;
  }
  
    try {
      sttInitializedRef.current = true; // Immediate update
      console.log('STT initializing...', sttInitializedRef.current); // Will show true
      // Check if LiveKit URL is configured
      if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
        console.log('LiveKit URL not configured, voice functionality disabled');
        setIsConnectedToSTT(false);
        return;
      }

      // Check microphone permission first
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicrophonePermission(permission.state);
      
      // Create a unique room name for transcription
      const session_key = testSessionKey;
      const transcriptionRoom = `transcription_${session_key}_${Date.now()}`;
      
      // Get token for transcription room
      const resp = await fetch(`/api/token?room=${transcriptionRoom}&username=user_${session_key.slice(-8)}`);
      const data = await resp.json();
      
      if (data.token && process.env.NEXT_PUBLIC_LIVEKIT_URL) {
        await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, data.token);
        
        // Enable microphone with explicit settings
        await roomInstance.localParticipant.setMicrophoneEnabled(true, undefined);
        
        setIsConnectedToSTT(true);
        
        // Listen for data from STT agent
        roomInstance.on('dataReceived', (payload: any, participant: any) => {
          try {
            const data = JSON.parse(new TextDecoder().decode(payload));
            handleSTTResult(data);
          } catch (error) {
            console.error('Error parsing STT data:', error);
          }
        });
        
        // Monitor audio levels
        const micTrack = roomInstance.localParticipant.getTrackPublication('microphone' as any)?.track;
        if (micTrack) {
          startAudioLevelMonitoring(micTrack);
        }
        
        console.log('Connected to STT transcription room');
      }
    } catch (error) {
      console.error('Error connecting to STT room:', error);
      setMicrophonePermission('denied');
      setIsConnectedToSTT(false);
      sttInitializedRef.current = false; // Reset on error
    }
  };

  const startAudioLevelMonitoring = (track: any) => {
    if (!track || !track.mediaStreamTrack) {
      console.log('No valid track for audio monitoring');
      return;
    }
    
    try {
      console.log('Starting audio level monitoring');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!isRecording) return; // Stop if not recording
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
        
        console.log('Audio level:', normalizedLevel); // Debug log
        setAudioLevel(normalizedLevel);
        
        requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };

  const handleSTTResult = (data: any) => {
    console.log('STT Result received:', data);
    
    if (data.type === 'voice_message_result' && data.success) {
      // Add user's voice message (transcription)
      const userVoiceMessage: ChatMessage = {
        role: 'user',
        content: data.transcription,
        isVoiceMessage: true
      };
      
      setMessages(prev => [...prev, userVoiceMessage]);
      
      // Process the transcription through your chat API
      processVoiceTranscription(data.transcription);
      
    } else if (data.type === 'voice_message_cancelled') {
      console.log('Voice message cancelled');
    } else if (!data.success) {
      console.error('STT Error:', data.response);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process your voice message. Please try again.'
      }]);
    }
    
    setVoiceLoading(false);
    setIsRecording(false);
  };

  const processVoiceTranscription = async (transcription: string) => {
    setLoading(true);
    
    try {
      const session_key = testSessionKey;
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_key, message: transcription }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice message');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error processing voice transcription:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your voice message." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (session_key: string) => {
    try {
      // Call local proxy instead of hitting backend directly
      const response = await fetch(`/api/history/${encodeURIComponent(session_key)}`);
      if (!response.ok) throw new Error("Failed to fetch chat history");

      const data = await response.json();
      setMessages(
        data.chat_history || [{ role: "assistant", content: "Hi there! How can I assist you today?" }]
      );
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setMessages([{ role: "assistant", content: "Hi there! How can I assist you today?" }]);
    }
  };

  const handleSend = async (text: string) => {
    if (text.trim() === "") return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);

    if (!isBackendConnected) {
      setTimeout(() => {
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
        setLoading(false);
        setIsTyping(false);
      }, 1200);
      return;
    }

    const session_key = testSessionKey;

    try {
      // Call local proxy; it forwards to NEXT_PUBLIC_FASTAPI_BASE_URL
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_key, message: text }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Accept both JSON and plain-text
      const ct = response.headers.get("Content-Type") || "";
      if (ct.includes("application/json")) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        const txt = await response.text();
        setMessages((prev) => [...prev, { role: "assistant", content: txt || "…" }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse =
        "I apologize, but I'm experiencing technical difficulties right now. Please try again in a few moments. If the problem persists, consider reaching out to our support team.";
      setMessages((prev) => [...prev, { role: "assistant", content: errorResponse }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const startVoiceRecording = async () => {
    if (!isConnectedToSTT || isRecording) return;
    
    try {
      console.log('Starting voice recording...');
      console.log('Room instance state:', (roomInstance as any).connectionState);
      console.log('Local participant state:', roomInstance.localParticipant.connectionQuality);
      
      setIsRecording(true);
      
      // Ensure microphone is enabled before starting
      await roomInstance.localParticipant.setMicrophoneEnabled(true);
      console.log('Microphone enabled successfully');
      
      // Wait a moment for the track to be available
      setTimeout(() => {
        // Get microphone track and start monitoring
        const micPublication = roomInstance.localParticipant.getTrackPublication('microphone' as any);
        console.log('Microphone publication:', micPublication);
        
        if (micPublication && micPublication.track) {
          console.log('Starting audio monitoring with track:', micPublication.track);
          startAudioLevelMonitoring(micPublication.track);
        } else {
          console.warn('No microphone track available for monitoring');
        }
      }, 500);
      
      // Call start_turn RPC method with timeout
      console.log('Calling start_turn RPC method...');
      const startTurnPromise = roomInstance.localParticipant.performRpc({
        method: "start_turn",
        destinationIdentity: "transcription-agent",
        payload: ""
      });
      
      // Add timeout to RPC call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('RPC timeout after 10 seconds')), 10000);
      });
      
      await Promise.race([startTurnPromise, timeoutPromise]);
      
      console.log('Started voice recording successfully');
    } catch (error) {
      console.error('Error starting voice recording:', error);
      console.error('Error details:', {
        connectionState: (roomInstance as any).connectionState,
        isConnected: (roomInstance as any).connectionState === 'connected',
        localParticipant: roomInstance.localParticipant.identity
      });
      setIsRecording(false);
      
      // Show user-friendly error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Voice recording failed to start. Please check your connection and try again.'
      }]);
    }
  };

  const sendVoiceRecording = async () => {
    if (!isConnectedToSTT || !isRecording) return;
    
    try {
      setVoiceLoading(true);
      setAudioLevel(0); // Reset audio level
      
      // Call end_turn RPC method
      await roomInstance.localParticipant.performRpc({
        method: "end_turn",
        destinationIdentity: "transcription-agent", 
        payload: ""
      });
      
      console.log('Sending voice recording for processing...');
    } catch (error) {
      console.error('Error sending voice recording:', error);
      setIsRecording(false);
      setVoiceLoading(false);
    }
  };

  const cancelVoiceRecording = async () => {
    if (!isConnectedToSTT) return;
    
    try {
      setAudioLevel(0); // Reset audio level
      
      await roomInstance.localParticipant.performRpc({
        method: "cancel_turn",
        destinationIdentity: "transcription-agent",
        payload: ""
      });
      
      setIsRecording(false);
      setVoiceLoading(false);
      console.log('Cancelled voice recording');
    } catch (error) {
      console.error('Error cancelling voice recording:', error);
    }
  };

  return (
    <RoomContext.Provider value={roomInstance}>
      <div className="h-full w-full max-w-screen mx-auto flex flex-col bg-blue-100 border rounded-xl shadow-md font-quicksand">
        <RoomAudioRenderer />
        
        {/* Messages */}
        <div ref={chatBoxRef} className="flex-grow p-4 overflow-y-auto space-y-2">
          {messages.map((msg, index) => (
            <MessageBubble 
              key={index} 
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
        <div className="border-t border-gray-200 p-3">
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

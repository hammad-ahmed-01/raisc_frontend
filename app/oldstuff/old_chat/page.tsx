"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Room } from 'livekit-client';
import { RoomContext, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
// import chatbotBg from "@/public/chatbot-background.jpg"; // Ensure correct path

interface ChatMessage {
    role: string;
    content: string;
    isVoiceMessage?: boolean;
    audioDuration?: number;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceLoading, setVoiceLoading] = useState(false);
    const [roomInstance] = useState(() => new Room({
        adaptiveStream: true,
        dynacast: true,
    }));
    const [isConnectedToSTT, setIsConnectedToSTT] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    const getSessionKey = () =>
        typeof window !== "undefined" ? localStorage.getItem("session_key") : null;

    useEffect(() => {
        const session_key = getSessionKey();
        if (session_key) fetchChatHistory(session_key);
        
        // Initialize STT room connection
        initializeSTTRoom();

        return () => {
            roomInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        // Scroll to the bottom whenever messages change
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const initializeSTTRoom = async () => {
        try {
            const session_key = getSessionKey();
            if (!session_key) return;

            // Check microphone permission first
            const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicrophonePermission(permission.state);
            
            // Create a unique room name for transcription
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
                roomInstance.on('dataReceived', (payload, participant) => {
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
        const session_key = getSessionKey();
        if (!session_key) return;

        setLoading(true);
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/chat`, {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/history/${session_key}`);
            if (!response.ok) {
                console.log("No response");
                return;
            }
            const data = await response.json();
            setMessages(data.chat_history || []);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const session_key = getSessionKey();
        if (!session_key) return;

        setMessages((prev) => [...prev, { role: "user", content: input }]);
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_key, message: input }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "INTERNAL SERVER ERROR: 500" },
            ]);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const startVoiceRecording = async () => {
        if (!isConnectedToSTT || isRecording) return;
        
        try {
            setIsRecording(true);
            
            // Ensure microphone is enabled before starting
            await roomInstance.localParticipant.setMicrophoneEnabled(true);
            
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
            
            // Call start_turn RPC method
            await roomInstance.localParticipant.performRpc({
                method: "start_turn",
                destinationIdentity: "transcription-agent",
                payload: ""
            });
            
            console.log('Started voice recording');
        } catch (error) {
            console.error('Error starting voice recording:', error);
            setIsRecording(false);
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
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-teal-100 px-4 mt-12">
                <RoomAudioRenderer />
                
                {/* Chat Container */}
                <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col overflow-hidden mt-16 mb-12">
                    {/* Header */}
                    <div className="bg-blue-600 text-white py-4 text-center shadow-md flex justify-center items-center">
                        <Image src="/raisc-chatbot.png" alt="Chatbot Icon" width={60} height={60} />
                        <div className="ml-4">
                            <div className={`text-sm ${isConnectedToSTT ? 'text-green-200' : 'text-yellow-200'}`}>
                                Voice: {isConnectedToSTT ? 'Connected' : 'Connecting...'}
                            </div>
                            {microphonePermission === 'denied' && (
                                <div className="text-red-200 text-xs">
                                    Microphone access denied
                                </div>
                            )}
                            {isRecording && (
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs">Audio Level: {(audioLevel * 100).toFixed(0)}%</span>
                                    <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-400 transition-all duration-100"
                                            style={{ width: `${audioLevel * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="relative flex flex-col flex-grow overflow-hidden">
                        <div ref={chatBoxRef} className="relative flex flex-col flex-grow overflow-y-auto p-6 space-y-4 bg-white bg-opacity-80 backdrop-blur-md">
                            {/* No Chat History Placeholder */}
                            {messages.length === 0 && !loading && (
                                <div className="text-center text-gray-500 text-lg">
                                    <p>Let&apos;s talk! Type a message or hold the mic button to record...</p>
                                </div>
                            )}

                            {/* Chat Messages */}
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`max-w-[80%] p-4 rounded-lg text-lg shadow-sm border ${
                                        msg.role === "user"
                                            ? "ml-auto bg-blue-500 text-white border-blue-300 rounded-br-none"
                                            : "mr-auto bg-gray-100 text-gray-800 border-gray-300 rounded-bl-none"
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>
                                        {msg.isVoiceMessage && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="mt-1">{msg.content}</div>
                                </div>
                            ))}

                            {/* Loading Indicators */}
                            {(loading || voiceLoading) && (
                                <div className="text-gray-500 italic text-center">
                                    {voiceLoading ? 'Processing voice message...' : 'Bot is typing...'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Input with Voice Button */}
                    <div className="p-4 border-t border-gray-300 flex items-center bg-white bg-opacity-90 backdrop-blur-md space-x-3">
                        {/* Voice Recording Button */}
                        {!isRecording ? (
                            <button
                                onClick={startVoiceRecording}
                                disabled={!isConnectedToSTT || voiceLoading}
                                className={`p-3 rounded-full transition-all duration-200 ${
                                    isConnectedToSTT && !voiceLoading
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg active:scale-95'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                title={isConnectedToSTT ? "Click to start recording voice message" : "Connecting to voice service..."}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                {/* Send Recording Button */}
                                <button
                                    onClick={sendVoiceRecording}
                                    disabled={voiceLoading}
                                    className={`p-3 rounded-full shadow-md transition-all duration-200 ${
                                        voiceLoading
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                    title="Click to send voice message"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                                    </svg>
                                </button>
                                
                                {/* Cancel Button */}
                                <button
                                    onClick={cancelVoiceRecording}
                                    disabled={voiceLoading}
                                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all duration-200 disabled:bg-gray-400"
                                    title="Cancel voice message"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {/* Recording Indicator with Audio Level */}
                                <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-full">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">
                                        {voiceLoading ? 'Sending...' : 'Recording...'}
                                    </span>
                                    {isRecording && !voiceLoading && (
                                        <div className="w-8 h-1 bg-red-300 rounded-full overflow-hidden ml-2">
                                            <div 
                                                className="h-full bg-red-600 transition-all duration-100"
                                                style={{ width: `${audioLevel * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Text Input */}
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !loading) {
                                    sendMessage();
                                }
                            }}
                            disabled={loading || isRecording}
                            className="flex-grow p-3 border border-gray-300 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                        />

                        {/* Send Button */}
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading || isRecording}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </RoomContext.Provider>
    );
}
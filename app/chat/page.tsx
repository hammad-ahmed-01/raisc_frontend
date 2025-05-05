"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import chatbotBg from "@/public/chatbot-background.jpg"; // Ensure correct path

interface ChatMessage {
    role: string;
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const session_key = localStorage.getItem("session_key");
        if (session_key) fetchChatHistory(session_key);
    }, []);

    useEffect(() => {
        // Scroll to the bottom whenever messages change
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const fetchChatHistory = async (session_key: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/history/${session_key}`);
            if (!response.ok) {
                console.log("No response");
            }
            const data = await response.json();

            console.log(data);
            setMessages(data.chat_history || []);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    const sendMessage = async () => {
        const session_key = localStorage.getItem("session_key");
        if (!input.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: input }]);
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_key, message: input }),
            });

            if (!response.ok) {
                console.log("No response");
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

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-teal-100 px-4">
            {/* Chat Container */}
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col overflow-hidden mt-12 mb-12">
                {/* Header */}
                <div className="bg-blue-600 text-white py-4 text-center shadow-md flex justify-center items-center">
                    <Image src="/raisc-chatbot.png" alt="Chatbot Icon" width={60} height={60} />
                    {/* <h1 className="text-2xl font-semibold ml-2">RAISC Chatbot</h1> */}
                </div>

                {/* Chat Messages with Background */}
                <div className="relative flex flex-col flex-grow overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-10"
                        style={{ backgroundImage: `url(${chatbotBg.src})` }} 
                    ></div>


                    <div ref={chatBoxRef} className="relative flex flex-col flex-grow overflow-y-auto p-6 space-y-4 bg-white bg-opacity-80 backdrop-blur-md">
                        {/* No Chat History Placeholder */}
                        {messages.length === 0 && !loading && (
                            <div className="text-center text-gray-500 text-lg">
                                <p>Let's talk! Start by saying something...</p>
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
                                <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
                            </div>
                        ))}

                        {/* Bot Typing Indicator */}
                        {loading && <div className="text-gray-500 italic text-center">Bot is typing...</div>}
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-300 flex items-center bg-white bg-opacity-90 backdrop-blur-md">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md transition transform hover:scale-105"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

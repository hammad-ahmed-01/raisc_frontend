"use client";
import { useState, useEffect, useRef } from "react";

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
            const response = await fetch(`/api/history/${session_key}`);

            if (!response.ok) {
                console.log('No response')
            }

            const data = await response.json();
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
            const response = await fetch(`/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_key, message: input }),
            });

            if (!response.ok) {
                console.log('No response')
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
        <div className="chat-container">
            <div className="chat-header">
                <h1>RAISC Chatbot</h1>
            </div>
            <div className="chat-box" ref={chatBoxRef}>
                {messages.length === 0 && !loading && (
                    <div className="no-chat-history">
                        <p>Let's talk! Start by saying something...</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`chat-message ${msg.role === "user" ? "chat-user" : "chat-bot"
                            }`}
                    >
                        <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
                    </div>
                ))}
                {loading && <div className="chat-loading">Bot is typing...</div>}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

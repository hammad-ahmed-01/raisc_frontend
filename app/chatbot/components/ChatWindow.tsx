"use client";

import React, { useEffect, useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatWindowProps {
  activeChatId: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChatId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const fallbackResponses = [
    "I apologize for the inconvenience. Our servers are currently experiencing some issues. Please try again later, and in the meantime, consider taking some deep breaths or practicing mindfulness.",
    "Sorry, I'm having trouble connecting to our servers right now. While we work on resolving this, remember that it's okay to take a moment for yourself.",
    "I'm experiencing some technical difficulties at the moment. Please bear with us. In the meantime, try some grounding exercises like focusing on your breathing.",
    "Our service is temporarily unavailable. I apologize for any inconvenience. Consider reaching out to a trusted friend or practicing some self-care while we resolve this issue."
  ];

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const session_key = "1635407bd7c0b8a9495506b1792a56a7c1b0f0e7";
    if (session_key && isBackendConnected) {
      fetchChatHistory(session_key);
    } else {
      setMessages([{ role: "assistant", content: "Hi there! How can I assist you today?" }]);
    }
  }, [activeChatId, isBackendConnected]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

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

    const session_key = "1635407bd7c0b8a9495506b1792a56a7c1b0f0e7";

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

  return (
    <div className="h-full w-full max-w-screen mx-auto flex flex-col bg-blue-100 border rounded-xl shadow-md font-quicksand">
      {/* Messages */}
      <div ref={chatBoxRef} className="flex-grow p-4 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <MessageBubble key={index} text={msg.content} isUser={msg.role === "user"} />
        ))}
        {isTyping && (
          <div className="text-sm text-gray-500 italic animate-pulse ml-2">
            RAISC is typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <InputBar onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;

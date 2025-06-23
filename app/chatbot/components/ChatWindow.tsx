"use client";

import React, { useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

interface ChatWindowProps {
  activeChatId: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChatId }) => {
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I assist you today?", isUser: false },
    { text: "I am having trouble managing my stress lately.", isUser: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activeChatId) {
      setMessages([
        { text: `This is chat ID: ${activeChatId}`, isUser: false },
        { text: "How can I help you today?", isUser: false }
      ]);
    } else {
      // New chat
      setMessages([
        { text: "Hi there! How can I assist you today?", isUser: false }
      ]);
    }
  }, [activeChatId]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isUser) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text:
              "I'm here to help you manage that. Let's try some calming techniques.",
            isUser: false
          }
        ]);
        setIsTyping(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (text.trim() === "") return;
    setMessages((prev) => [...prev, { text, isUser: true }]);
  };

  return (
    <div className="h-full w-full max-w-screen mx-auto flex flex-col bg-blue-100 border rounded-xl shadow-md">
      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <MessageBubble key={index} text={msg.text} isUser={msg.isUser} />
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

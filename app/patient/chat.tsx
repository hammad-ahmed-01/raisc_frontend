'use client';
import { useState } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { fetchChatResponse } from '@/utils/api';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const sessionKey = 'user_12345'; // Replace with dynamic key fetched from the backend

    const sendMessage = async (message: string) => {
        const userMessage: Message = { role: 'user', content: message };
        setMessages((prev) => [...prev, userMessage]);

        const response = await fetchChatResponse(sessionKey, message);
        const botMessage: Message = { role: 'assistant', content: response };

        setMessages((prev) => [...prev, botMessage]);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} role={msg.role} content={msg.content} />
                ))}
            </div>
            <ChatInput onSend={sendMessage} />
        </div>
    );
}

"use client";

import React from "react";
import {
  ArrowLeft,
  PencilLine
} from "lucide-react"; 
import Image from "next/image";

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onBackToDashboard: () => void;
}

const chatHistory = {
  today: [{ id: "1", title: "Intro and Initial Discussion" }],
  last7Days: [
    { id: "2", title: "Recommend breathing..." },
    { id: "3", title: "Help in Therapy........" }
  ],
  last30Days: [
    { id: "4", title: "How to reduce Stress...." },
    { id: "5", title: "Assist me in feeling....." }
  ]
};

const ChatHistory: React.FC<ChatHistoryProps> = ({
  onSelectChat,
  onNewChat,
  onBackToDashboard
}) => {
  return (
    <div className="w-full md:w-[280px] min-h-full bg-[#B2D5F1] text-heading rounded-tr-3xl rounded-br-3xl p-6 flex flex-col justify-between shadow-lg font-quicksand">
      <div>
        {/* Back Button */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-heading2 font-semibold px-4 py-2 rounded-full secondaryButton mb-6"
          style={{ 
            boxShadow: '0px 4px 4px 0px #00000040',
            border: '1px solid #1E3CA7'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Chat History Header */}
        <h3 className="font-bold text-lg mb-4 text-center">Chat History</h3>

        {/* Today */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-heading mb-1">Today</div>
          {chatHistory.today.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="cursor-pointer pl-2 py-1 hover:bg-heading2 hover:text-white rounded text-sm transition"
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="pt-6 flex justify-center">
        <Image
          src="/chatbot.png"
          alt="Chatbot"
          width={200}
          height={350}
          className="w-38 h-70 cursor-pointer"
          onClick={onNewChat}
        />
      </div>
    </div>
  );
};

export default ChatHistory;

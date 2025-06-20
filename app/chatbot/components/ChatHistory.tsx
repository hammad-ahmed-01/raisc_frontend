"use client";

import React from "react";
import {
  ArrowLeft,
  PencilLine
} from "lucide-react"; 

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onBackToDashboard: () => void;
}

const chatHistory = {
  today: [{ id: "1", title: "Help with anxiety..." }],
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
    <div className="w-full md:w-[280px] min-h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white rounded-tr-3xl rounded-br-3xl p-6 flex flex-col justify-between shadow-lg">
      <div>
        {/* Back Button */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 bg-white text-blue-900 font-semibold px-4 py-2 rounded-full hover:bg-blue-100 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Chat History Header */}
        <h3 className="font-bold text-lg mb-4 text-center">Chat History</h3>

        {/* Today */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-white mb-1">Today</div>
          {chatHistory.today.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="cursor-pointer pl-2 py-1 hover:bg-blue-700 rounded text-sm transition"
            >
              {chat.title}
            </div>
          ))}
        </div>

        {/* Last 7 Days */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-white mb-1">
            Previous 7 days
          </div>
          {chatHistory.last7Days.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="cursor-pointer pl-2 py-1 hover:bg-blue-700 rounded text-sm transition"
            >
              {chat.title}
            </div>
          ))}
        </div>

        {/* Last 30 Days */}
        <div>
          <div className="text-sm font-semibold text-white mb-1">
            Previous 30 days
          </div>
          {chatHistory.last30Days.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="cursor-pointer pl-2 py-1 hover:bg-blue-700 rounded text-sm transition"
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="pt-6">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 bg-white text-blue-900 font-semibold w-full py-2 rounded-full hover:bg-blue-100 transition"
        >
          <PencilLine className="w-4 h-4" />
          New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatHistory;

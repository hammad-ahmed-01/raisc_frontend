'use client';

import React, { useState } from 'react';
import Header from './components/header';
import ChatHistory from './components/ChatHistory';
import ChatWindow from './components/ChatWindow';

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleBackToDashboard = () => {
    // handle dashboard navigation
  };

  return (
    <div className="h-screen w-screen bg-blue-100 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <ChatHistory
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b shadow-sm">
          <Header />
        </div>

        {/* Chat Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <ChatWindow activeChatId={activeChatId} />
        </div>
      </div>
    </div>
  );
}

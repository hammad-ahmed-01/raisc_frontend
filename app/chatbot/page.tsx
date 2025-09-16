'use client';

import React, { useState, useEffect } from 'react';
import { checkAuth, redirectToLogin } from "@/lib/auth";
import Header from './components/header';
import ChatHistory from './components/ChatHistory';
import ChatWindow from './components/ChatWindow';

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }
      
      // Check if user is a doctor (not allowed to access chatbot)
      if (authResult.user?.user_type === 'doctor') {
        setAuthError("Doctors cannot access the chatbot");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
        return;
      }
      
      setIsLoading(false);
    };

    performAuthCheck();
  }, []);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="h-screen w-screen bg-blue-100 font-quicksand flex overflow-hidden">
      {/* Sidebar */}
      <ChatHistory
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4">
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

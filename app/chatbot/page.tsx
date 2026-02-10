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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();

      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => { redirectToLogin(); }, 2000);
        return;
      }

      // Doctors cannot access chatbot
      if (authResult.user?.user_type === 'doctor') {
        setAuthError("Doctors cannot access the chatbot");
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
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

  if (isLoading) return <p className="text-center text-gray-600 mt-10">Loading...</p>;

  const handleSelectChat = (chatId: string) => setActiveChatId(chatId);
  const handleNewChat = () => setActiveChatId(null);
  const handleBackToDashboard = () => { window.location.href = "/dashboard"; };

  return (
    <div className="h-screen md:h-screen w-screen bg-[#EEF5FF] font-quicksand flex flex-col md:flex-row overflow-hidden">
      {/* Mobile header (clicking hamburger opens overlay) */}
      <div className="md:hidden sticky top-0 z-20">
        <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
      </div>

      {/* Desktop sidebar (unchanged) */}
      <aside className="hidden md:block md:w-[300px] md:h-full md:overflow-y-auto md:shrink-0">
        <ChatHistory
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onBackToDashboard={handleBackToDashboard}
        />
      </aside>

      {/* Main column */}
      <main className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        {/* Desktop header (unchanged) */}
        <div className="hidden md:block p-4 shrink-0">
          <Header />
        </div>

        {/* Chat area (fills the screen under the 56px mobile header) */}
        <div className="flex-1 min-h-0 p-0 md:p-4 overflow-hidden">
          <div className="h-[calc(100dvh-56px)] md:h-full">
            <ChatWindow activeChatId={activeChatId} />
          </div>
        </div>
      </main>

      {/* Mobile overlay for Chat History */}
      {mobileSidebarOpen && (
        <ChatHistory
          overlay
          onCloseOverlay={() => setMobileSidebarOpen(false)}
          onSelectChat={(id) => {
            handleSelectChat(id);
            setMobileSidebarOpen(false);
          }}
          onNewChat={() => {
            handleNewChat();
            setMobileSidebarOpen(false);
          }}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

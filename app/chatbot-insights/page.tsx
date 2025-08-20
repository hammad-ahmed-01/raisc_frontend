'use client';

import React, { useEffect, useState } from 'react';
import { checkAuth, redirectToLogin } from "@/lib/auth";
import FiltersSidebar from './components/FiltersSidebar';
import ChatEntriesSection from './components/ChatEntriesSection';
import { chatEntries } from './components/ChatEntires';

const ChatbotInsightsPage = () => {
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
      
      // Check if user is a patient (not allowed to access chatbot insights)
      if (authResult.user?.user_type === 'patient') {
        setAuthError("Patients cannot access chatbot insights");
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

  return (
    <div className="flex min-h-screen bg-[url('/bg/patientbg.png')] bg-cover">
      <div className="p-2">
        <FiltersSidebar />
      </div>
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl text-center text-heading font-bold mt-8 mb-1">Chatbot Insights for Ayesha Khan</h1>
        <p className="text-lg foreground mb-6 text-heading2 text-center">
          Reviewing AI-chatbot interactions to track emotional and behavioral progress.
        </p>
        <ChatEntriesSection entries={chatEntries} />
      </main>
    </div>
  );
};

export default ChatbotInsightsPage;

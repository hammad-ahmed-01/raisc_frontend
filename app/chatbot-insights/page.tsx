'use client';

import React from 'react';
import FiltersSidebar from './components/FiltersSidebar';
import ChatEntriesSection from './components/ChatEntriesSection';
import { chatEntries } from './components/ChatEntires';

const ChatbotInsightsPage = () => {
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

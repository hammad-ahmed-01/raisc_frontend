'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { checkAuth, redirectToLogin } from "@/lib/auth";
import FiltersSidebar from './components/FiltersSidebar';
import ChatEntriesSection from './components/ChatEntriesSection';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface ChatbotProfile {
  id: number;
  collected_data: any;
  session_summary: string;
  important_messages?: string;
  date: string;
  session_key: string;
  session_start_msg: number;
  session_end_msg: number;
  topic?: string;
  important_check?: boolean;
}

const ChatbotInsightsContent = () => {
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatbotProfiles, setChatbotProfiles] = useState<ChatbotProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ChatbotProfile[]>([]);
  const [patientName, setPatientName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [testSessionKey, setTestSessionKey] = useState(
    process.env.TEST_SESSION_KEY || "97bb09258dcb1dffae5ac9c375809e473c65740b"
  );

  const [filters, setFilters] = useState({ topic: '', date: '', message: '' });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => redirectToLogin(), 2000);
        return;
      }
      if (authResult.user?.user_type === 'patient') {
        setAuthError("Patients cannot access chatbot insights");
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
        return;
      }
      setIsLoading(false);
    };
    performAuthCheck();
  }, []);

  useEffect(() => {
    const name = searchParams.get("name") || "Patient";
    const id = process.env.TEST_PATIENT_ID || "24";
    setPatientName(name);
    setPatientId(id);
    if (id && !isLoading) fetchChatbotProfiles(id);
  }, [searchParams, isLoading]);

  useEffect(() => {
    applyFilters();
  }, [filters, chatbotProfiles]);

  const availableTopics = useMemo(
    () => Array.from(new Set(chatbotProfiles.map(p => p.topic).filter(Boolean))) as string[],
    [chatbotProfiles]
  );

  const fetchChatbotProfiles = async (pid: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/chatbot-data/${pid}/`,
        { headers: { Authorization: `Token ${testSessionKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const transformed = data.map((profile: ChatbotProfile) => ({
          ...profile,
          topic: profile.topic || "General",
          important_check: !!profile.important_messages,
        }));
        setChatbotProfiles(transformed);
      } else {
        setChatbotProfiles(getFallbackData());
      }
    } catch {
      setChatbotProfiles(getFallbackData());
    }
  };

  const getFallbackData = (): ChatbotProfile[] => ([
    {
      id: 1,
      collected_data: "Anxiety, stress management, 5 user messages, Average compound sentiment score was 0.2, min: -0.1, max: 0.5",
      session_summary: "Patient expressed feeling isolated and mentioned family conflict.",
      important_messages: "Patient mentioned suicidal thoughts",
      date: new Date().toISOString(),
      session_key: testSessionKey,
      session_start_msg: 1,
      session_end_msg: 10,
      topic: "Anxiety, Family Conflict",
      important_check: true
    },
    {
      id: 2,
      collected_data: "Sleep issues, 3 user messages, sentiment trending negative",
      session_summary: "Patient reported severe sleep disturbances and work-related stress.",
      important_messages: "",
      date: new Date(Date.now() - 86400000).toISOString(),
      session_key: testSessionKey,
      session_start_msg: 11,
      session_end_msg: 20,
      topic: "Sleep Issues, Stress Management",
      important_check: false
    }
  ]);

  const applyFilters = () => {
    let filtered = [...chatbotProfiles];

    if (filters.topic) {
      filtered = filtered.filter(p => (p.topic || "").toLowerCase().includes(filters.topic.toLowerCase()));
    }

    if (filters.date) {
      const now = new Date();
      if (filters.date === 'Last 7 Days') {
        const seven = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(p => new Date(p.date) >= seven);
      } else if (filters.date === 'This Month') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(p => new Date(p.date) >= first);
      }
    }

    if (filters.message) {
      if (filters.message === 'Important') filtered = filtered.filter(p => p.important_check);
      if (filters.message === 'Detailed') filtered = filtered.filter(p => p.collected_data);
      // 'Summary Only' leaves as-is (assumes all have summaries)
    }

    setFilteredProfiles(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => setFilters(newFilters);

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
      {/* Desktop fixed sidebar (unchanged) */}
      <div className="hidden md:block p-2 fixed">
        <FiltersSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          availableTopics={availableTopics}
        />
      </div>

      {/* Mobile sticky top bar with Back + Show Filters (new) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white/85 backdrop-blur border-b border-[#2196F3]/30">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 font-bold text-[#1A237E]"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setShowFiltersMobile(s => !s)}
            className="px-3 py-2 rounded-full font-semibold text-[#1A237E] border border-[#2196F3] bg-[#D0E3FFC7]"
            aria-expanded={showFiltersMobile}
            aria-controls="mobile-filters-panel"
          >
            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Collapsible filters panel */}
        {showFiltersMobile && (
          <div id="mobile-filters-panel" className="px-2 pb-2">
            {/* Sidebar reused; its own back button is hidden on mobile */}
            <FiltersSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              availableTopics={availableTopics}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto ml-0 md:ml-80 w-full">
        {/* Spacer to avoid content being hidden under the fixed mobile top bar */}
        <div className="h-[70px] md:h-0" />

        <h1 className="text-2xl text-center text-heading font-bold mt-2 mb-1">
          Chatbot Insights for {patientName}
        </h1>
        <p className="text-lg foreground mb-6 text-heading2 text-center">
          Reviewing AI-chatbot interactions to track emotional and behavioral progress.
        </p>

        <ChatEntriesSection
          entries={filteredProfiles}
          patientId={patientId}
          sessionKey={testSessionKey}
        />
      </main>
    </div>
  );
};

const ChatbotInsightsPage = () => (
  <Suspense fallback={<div className="text-center text-gray-600 mt-10">Loading...</div>}>
    <ChatbotInsightsContent />
  </Suspense>
);

export default ChatbotInsightsPage;

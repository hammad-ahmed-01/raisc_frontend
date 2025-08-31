'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { checkAuth, redirectToLogin } from "@/lib/auth";
import FiltersSidebar from './components/FiltersSidebar';
import ChatEntriesSection from './components/ChatEntriesSection';
import { useSearchParams } from 'next/navigation';

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

interface ChatMessage {
    role: string;
    content: string;
}

const ChatbotInsightsContent = () => {
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [chatbotProfiles, setChatbotProfiles] = useState<ChatbotProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ChatbotProfile[]>([]);
  const [patientName, setPatientName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [testSessionKey, setTestSessionKey] = useState(process.env.TEST_SESSION_KEY || "97bb09258dcb1dffae5ac9c375809e473c65740b");

  const [filters, setFilters] = useState({
    topic: '',
    date: '',
    message: ''
  });

  const searchParams = useSearchParams();

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

  useEffect(() => {
    // Get patient info from URL params
    const name = searchParams.get("name") || "Patient";
    // const id = searchParams.get("id") || process.env.TEST_PATIENT_ID;
    const id = process.env.TEST_PATIENT_ID || "24";
    setPatientName(name);
    setPatientId(id);

    if (id && !isLoading) {
      fetchChatbotProfiles(id);
    }
  }, [searchParams, isLoading]);

  useEffect(() => {
    // Apply filters whenever filters or chatbotProfiles change
    applyFilters();
  }, [filters, chatbotProfiles]);

  const fetchChatbotProfiles = async (patientId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/chatbot-data/${patientId}/`, {
        headers: { Authorization: `Token ${testSessionKey}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform the data to include topics and important_check
        const transformedData = data.map((profile: ChatbotProfile) => ({
          ...profile,
          topic: profile.topic || "General",
          important_check: profile.important_messages ? true : false
        }));
        setChatbotProfiles(transformedData);
      } else {
        console.error("Failed to fetch chatbot profiles");
        // Set fallback data for testing
        setChatbotProfiles(getFallbackData());
      }
    } catch (error) {
      console.error("Error fetching chatbot profiles:", error);
      // Set fallback data on error
      setChatbotProfiles(getFallbackData());
    }
  };

  const extractTopicsFromData = (data: any): string => {
    if (!data) return "General";
    
    // Try to extract topics from the collected data
    const dataString = String(data);
    const topicMatches = dataString.match(/(?:topics?|themes?|subjects?)[:\s]+([^,\n]+)/i);
    
    if (topicMatches) {
      return topicMatches[1].trim();
    }
    
    // Fallback to common topics based on content
    if (dataString.toLowerCase().includes('anxiety')) return 'Anxiety';
    if (dataString.toLowerCase().includes('depression')) return 'Depression';
    if (dataString.toLowerCase().includes('family')) return 'Family Conflict';
    if (dataString.toLowerCase().includes('sleep')) return 'Sleep Issues';
    if (dataString.toLowerCase().includes('stress')) return 'Stress Management';
    
    return "General";
  };

  const getFallbackData = (): ChatbotProfile[] => {
    return [
      {
        id: 1,
        collected_data: "Anxiety, stress management, 5 user messages, Average compound sentiment score was 0.2, min: -0.1, max: 0.5, indicating an overall neutral tone",
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
        collected_data: "Sleep issues, insomnia, 3 user messages, Average compound sentiment score was -0.3, min: -0.5, max: 0.1, indicating an overall negative tone",
        session_summary: "Patient reported severe sleep disturbances and work-related stress.",
        important_messages: "",
        date: new Date(Date.now() - 86400000).toISOString(),
        session_key: testSessionKey,
        session_start_msg: 11,
        session_end_msg: 20,
        topic: "Sleep Issues, Stress Management",
        important_check: false
      }
    ];
  };

  const applyFilters = () => {
    let filtered = [...chatbotProfiles];

    // Apply topic filter
    if (filters.topic) {
      filtered = filtered.filter(profile => 
        profile.topic?.toLowerCase().includes(filters.topic.toLowerCase())
      );
    }

    // Apply date filter
    if (filters.date) {
      const now = new Date();
      switch (filters.date) {
        case 'Last 7 Days':
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(profile => new Date(profile.date) >= sevenDaysAgo);
          break;
        case 'This Month':
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(profile => new Date(profile.date) >= thisMonth);
          break;
        case 'Custom':
          // Custom date filtering can be implemented later
          break;
      }
    }

    // Apply message type filter
    if (filters.message) {
      switch (filters.message) {
        case 'Important':
          filtered = filtered.filter(profile => profile.important_check);
          break;
        case 'Summary Only':
          // Show all profiles (summary is always available)
          break;
        case 'Detailed':
          // Show profiles with detailed data
          filtered = filtered.filter(profile => profile.collected_data);
          break;
      }
    }

    setFilteredProfiles(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

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
      <div className="p-2 fixed">
        <FiltersSidebar 
          filters={filters}
          onFilterChange={handleFilterChange}
          availableTopics={Array.from(new Set(chatbotProfiles.map(p => p.topic).filter((topic): topic is string => Boolean(topic))))}
        />
      </div>
      <main className="flex-1 p-6 overflow-y-auto ml-80">
        <h1 className="text-2xl text-center text-heading font-bold mt-8 mb-1">
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

const ChatbotInsightsPage = () => {
  return (
    <Suspense fallback={<div className="text-center text-gray-600 mt-10">Loading...</div>}>
      <ChatbotInsightsContent />
    </Suspense>
  );
};

export default ChatbotInsightsPage;

import React from 'react';
import ChatEntryCard from './ChatEntryCard';

interface ChatbotProfile {
  id: number;
  collected_data: any;
  session_summary: string;
  important_messages?: string;
  date: string;
  session_key: string;
  session_start_msg: number;
  session_end_msg: number;
  topics?: string;
  important_check?: boolean;
}

interface ChatEntriesSectionProps {
  entries: ChatbotProfile[];
  patientId: string;
  sessionKey: string;
}

const ChatEntriesSection = ({ entries, patientId, sessionKey }: ChatEntriesSectionProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No chatbot data available for this patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#D0E3FFC7] p-4 sm:p-6 md:p-8 rounded-lg border border-[#2196F3]">
      {entries.map((entry) => (
        <ChatEntryCard
          key={entry.id}
          entry={entry}
          patientId={patientId}
          sessionKey={sessionKey}
        />
      ))}
    </div>
  );
};

export default ChatEntriesSection;

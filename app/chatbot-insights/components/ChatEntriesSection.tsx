import React from 'react';
import ChatEntryCard from './ChatEntryCard';

type ChatEntry = {
  id: number;
  date: string;
  topics: string[];
  summary: string;
  important: boolean;
};

const ChatEntriesSection = ({ entries }: { entries: ChatEntry[] }) => {
  return (
    <div className="space-y-8 bg-[#D0E3FFC7] p-8 rounded-lg border border-[#2196F3]">
      {entries.map((entry) => (
        <ChatEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export default ChatEntriesSection;

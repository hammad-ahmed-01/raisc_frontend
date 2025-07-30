import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import ChatPopup from './ChatThread/ChatPopup';

interface ChatEntry {
  id: number;
  date: string;
  topics: string[];
  summary: string;
  important: boolean;
}

const ChatEntryCard = ({ entry }: { entry: ChatEntry }) => {
  const [isImportant, setIsImportant] = useState(entry.important);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="relative">
      <div className="absolute -top-7 bg-[#D0E3FFC7] py-1 text-sm font-semibold text-heading2 flex items-center">
        {isImportant ? (
          <Star fill="currentColor" className="mr-2 h-4 w-4 text-yellow-500" />
        ) : (
          <Star className="mr-2 h-4 w-4 text-yellow-500" />
        )}
        {entry.date}
      </div>

      <Card key={entry.id} className="border border-[#2196F3] pt-4">
        <CardContent className="p-4 relative">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              onClick={() => setIsImportant(!isImportant)}
              className="secondaryButton text-heading2 hover:text-heading px-3 py-1 font-semibold text-md rounded-3xl"
            >
              {isImportant ? (
                <>
                  <Star fill="currentColor" className="mr-1 h-4 w-4 text-yellow-500" />
                  Unmark Important
                </>
              ) : (
                <>
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  Mark Important
                </>
              )}
            </Button>
          </div>

          <div className="mt-2 text-lg">
            <p className="font-bold text-heading2">
              Topics:{' '}
              <span className="font-normal text-black">
                {entry.topics.join(' | ')}
              </span>
            </p>
            <p className="font-bold text-heading2 mt-1">
              Summary:{' '}
              <span className="font-normal text-black">{entry.summary}</span>
            </p>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowPopup(true)}
                className="primaryButton bg-heading2 hover:bg-heading text-md rounded-3xl font-semibold"
              >
                Open Chat Thread
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPopup && <ChatPopup date={entry.date} onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default ChatEntryCard;

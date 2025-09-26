import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import ChatPopup from './ChatThread/ChatPopup';
import moment from 'moment';

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

const ChatEntryCard = ({
  entry,
  patientId,
  sessionKey
}: {
  entry: ChatbotProfile;
  patientId: string;
  sessionKey: string;
}) => {
  const [isImportant, setIsImportant] = useState(entry.important_check || false);
  const [showPopup, setShowPopup] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const handleImportantToggle = async () => {
    // TODO: Implement API call to update important status
    setIsImportant(!isImportant);
  };

  const fetchChatThread = async () => {
    setIsLoadingChat(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/history/${sessionKey}/${entry.session_start_msg}/${entry.session_end_msg}`
      );
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.chat_history || []);
      } else {
        setChatMessages(getFallbackChatMessages());
      }
    } catch (error) {
      console.error("Error fetching chat thread:", error);
      setChatMessages(getFallbackChatMessages());
    } finally {
      setIsLoadingChat(false);
      setShowPopup(true);
    }
  };

  const getFallbackChatMessages = (): ChatMessage[] => ([
    { role: "user", content: "I am having trouble managing my stress lately." },
    { role: "assistant", content: "It's okay to feel overwhelmed. Want to talk about what's causing it?" },
    { role: "user", content: "Mostly schoolwork and deadlines." },
    { role: "assistant", content: "Let's try breaking it down. How about we list tasks together?" },
    { role: "user", content: "That might help. I feel like everything is piling up." },
    { role: "assistant", content: "I understand that feeling. Let's start with just one thing. What's the most urgent task right now?" }
  ]);

  const formatDate = (dateString: string) => moment(dateString).format("MMM DD, YYYY");
  const formatTopics = (topics: string | undefined) => {
    if (!topics) return "General";
    return topics.split(',').map(topic => topic.trim()).join(' | ');
  };

  return (
    <div className="relative">
      {/* Desktop: floating date badge (unchanged) */}
      <div className="hidden md:flex absolute -top-7 bg-[#D0E3FFC7] py-1 px-2 text-sm font-semibold text-heading2 items-center">
        {isImportant ? (
          <Star fill="currentColor" className="mr-2 h-4 w-4 text-yellow-500" />
        ) : (
          <Star className="mr-2 h-4 w-4 text-yellow-500" />
        )}
        {formatDate(entry.date)}
      </div>

      <Card className="border border-[#2196F3]">
        <CardContent className="p-4 relative">
          {/* Mobile: date badge INSIDE the card so it doesn’t bleed out */}
          <div className="md:hidden mb-2 inline-flex items-center bg-[#D0E3FFC7] py-1 px-2 rounded">
            {isImportant ? (
              <Star fill="currentColor" className="mr-2 h-4 w-4 text-yellow-500" />
            ) : (
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm font-semibold text-heading2">
              {formatDate(entry.date)}
            </span>
          </div>

          {/* Desktop: absolute action button (unchanged). Mobile: inline row above content. */}
          <div className="md:absolute md:top-4 md:right-4 md:mb-0 mb-2 flex justify-end">
            <Button
              variant="ghost"
              onClick={handleImportantToggle}
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

          {/* Content */}
          <div className="mt-1 md:mt-2 text-base sm:text-lg">
            <p className="font-bold text-heading2">
              Topics:{' '}
              <span className="font-normal text-black">
                {formatTopics(entry.topic)}
              </span>
            </p>
            <p className="font-bold text-heading2 mt-2">
              Summary:{' '}
              <span className="font-normal text-black">{entry.session_summary}</span>
            </p>

            {entry.important_messages && (
              <p className="font-bold text-red-600 mt-2">
                ⚠ Important: {entry.important_messages}
              </p>
            )}

            <div className="flex justify-end mt-6">
              <Button
                onClick={fetchChatThread}
                disabled={isLoadingChat}
                className="primaryButton bg-heading2 hover:bg-heading text-md rounded-3xl font-semibold"
              >
                {isLoadingChat ? 'Loading...' : 'Open Chat Thread'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPopup && (
        <ChatPopup
          date={formatDate(entry.date)}
          onClose={() => setShowPopup(false)}
          chatMessages={chatMessages}
          isLoading={isLoadingChat}
        />
      )}
    </div>
  );
};

export default ChatEntryCard;

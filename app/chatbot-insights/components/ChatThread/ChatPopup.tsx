import React from 'react';
import Modal from './Modal';
import { Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: string;
  content: string;
}

const ChatPopup = ({
  onClose,
  date,
  chatMessages,
  isLoading
}: {
  onClose: () => void;
  date: string;
  chatMessages: ChatMessage[];
  isLoading: boolean;
}) => {
  // Fallback messages if no chat messages are provided
  const fallbackMessages: ChatMessage[] = [
    {
      role: "user",
      content: "I am having trouble managing my stress lately."
    },
    {
      role: "assistant",
      content: "It's okay to feel overwhelmed. Want to talk about what's causing it?"
    },
    {
      role: "user",
      content: "Mostly schoolwork and deadlines."
    },
    {
      role: "assistant",
      content: "Let's try breaking it down. How about we list tasks together?"
    }
  ];

  const messagesToDisplay = chatMessages.length > 0 ? chatMessages : fallbackMessages;

  return (
    <Modal onClose={onClose}>
      <div className="w-[90vw] max-w-3xl bg-[#D0E3FFC7] rounded-2xl overflow-hidden">
        <div className="text-heading2 font-extrabold text-xl px-6 py-4">
          Chat Thread - {date}
        </div>
        <div className="m-6 p-6 space-y-4 max-h-[70vh] overflow-y-auto rounded-2xl bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-heading2" />
              <span className="ml-2 text-heading2">Loading chat thread...</span>
            </div>
          ) : (
            messagesToDisplay.map((message, index) => (
              <div key={index} className={`flex items-start gap-2 ${message.role === 'assistant' ? 'justify-end' : ''}`}>
                {message.role === 'user' && (
                  <User className="w-5 h-5 mt-1 rounded-full border-heading2 border-2 text-heading2 flex-shrink-0" />
                )}
                <div className={`px-4 py-2 rounded-2xl shadow max-w-[70%] ${
                  message.role === 'user' 
                    ? 'bg-[#D0E3FFC7] text-gray-800' 
                    : 'bg-[#D6F5F2] text-gray-800'
                }`}>
                  {message.content}
                </div>
                {message.role === 'assistant' && (
                  <Bot className="w-5 h-5 mt-1 rounded-full text-heading2 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ChatPopup;

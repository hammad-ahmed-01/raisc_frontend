import React from 'react';
import Modal from './Modal';
import { Bot, User } from 'lucide-react';

const ChatPopup = ({
  onClose,
  date,
}: {
  onClose: () => void;
  date: string;
}) => {
  return (
    <Modal onClose={onClose}>
      <div className="w-[90vw] max-w-3xl bg-[#D0E3FFC7] rounded-2xl overflow-hidden">
        <div className="text-heading2 font-extrabold text-xl px-6 py-4">
          Chat Thread - {date}
        </div>
        <div className="m-6 p-6 space-y-12 max-h-[70vh] overflow-y-auto rounded-2xl bg-white">
          <div className="flex items-start gap-2">
            <User className="w-5 h-5 mt-1 rounded-full border-heading2 border-2 text-heading2" />
            <div className="bg-[#D0E3FFC7] text-gray-800 px-4 py-2 rounded-2xl shadow">
              I am having trouble managing my stress lately.
            </div>
          </div>
          <div className="flex items-start gap-2 justify-end">
            <div className="bg-[#D6F5F2] text-gray-800 px-4 py-2 rounded-2xl shadow">
              It's okay to feel overwhelmed. Want to talk about what's causing it?
            </div>
            <Bot className="w-5 h-5 mt-1 rounded-full text-heading2" />
          </div>
          <div className="flex items-start gap-2">
            <User className="w-5 h-5 mt-1 rounded-full border-heading2 border-2 text-heading2" />
            <div className="bg-[#D0E3FFC7] text-gray-800 px-4 py-2 rounded-2xl shadow">
              Mostly schoolwork and deadlines.
            </div>
          </div>
          <div className="flex items-start gap-2 justify-end">
            <div className="bg-[#D6F5F2] text-gray-800 px-4 py-2 rounded-2xl shadow">
              Let’s try breaking it down. How about we list tasks together?
            </div>
            <Bot className="w-5 h-5 mt-1 rounded-full text-heading2" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChatPopup;

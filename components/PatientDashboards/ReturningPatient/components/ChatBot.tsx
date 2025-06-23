import React from 'react';

export const ChatBot: React.FC = () => (
  <div className="bg-[#F0F7FF] shadow-md p-6 rounded-2xl items-end text-center w-fit max-w-xs">
    <img
      src="/raisc-chatbot.png"
      alt="Chatbot"
      className="w-24 h-24 mx-auto rounded-full mb-3"
    />
    <p className="text-heading2 bg-[#FAFDFF] rounded-3xl p-6 font-semibold text-base">
      How are you feeling today?
      <br />
      Need to talk?
      <br />
      I’m here anytime.
    </p>
    <div className="flex justify-center">
      <button className="w-fit flex items-center justify-center bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 rounded-full shadow-sm hover:opacity-90 transition">
        Start Chat
      </button>
    </div>
  </div>
);
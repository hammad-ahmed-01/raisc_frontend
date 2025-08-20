import React from 'react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import Image from 'next/image';

export const ChatBot: React.FC = () => (
  <div className="bg-[#F0F7FF] shadow-md p-6 rounded-2xl items-end text-center w-fit max-w-xs">
    <Image
      src="/raisc-chatbot.png"
      alt="Chatbot"
      className="w-24 h-24 mx-auto rounded-full mb-3"
      width={96}
      height={96}
    />
    <p className="text-heading2 bg-[#FAFDFF] rounded-3xl p-6 font-semibold text-base">
      How are you feeling today?
      <br />
      Need to talk?
      <br />
      I’m here anytime.
    </p>
    <div className="flex justify-center">
      <PrimaryButton
        text="Start Chat"
        onClick={() => {window.location.href = '/chatbot';}}
        className="w-fit flex items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
        />
    </div>
  </div>
);
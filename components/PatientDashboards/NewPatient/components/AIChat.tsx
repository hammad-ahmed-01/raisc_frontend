"use client"

import ChatBotImage from "@/public/bg/chatbotbg.png";
import { useEffect, useState } from 'react';
import PrimaryButton from "@/components/Buttons/PrimaryButton";

interface ChatBotData {
  greeting: string;
  description: string;
}

export default function AIChat() {
  const [chatBot, setChatBot] = useState<ChatBotData>({
    greeting: "Hi! \nNeed help today?",
    description: "I'm here to help you anytime. Let's chat!"
  });

  useEffect(() => {
    const fetchChatBotData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/chatbot/info`);
          if (response.ok) {
            const data = await response.json();
            setChatBot(data);
          }
        } catch (error) {
          console.error("Failed to fetch chatbot data:", error);
        }
      }
    };
    
    fetchChatBotData();
  }, []);

  return (
    <div
      className="relative mx-auto mt-8 lg:mt-20 rounded-3xl overflow-hidden shadow-2xl max-w-[95vw] lg:max-w-none"
      style={{
        backgroundImage: `url(${ChatBotImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        maxWidth: "700px",
        height: "auto", // Changed to auto height for better responsiveness
        minHeight: "400px", // Minimum height to maintain appearance
      }}
    >
      <div className="absolute inset-0 bg-transparent px-2 sm:px-4 lg:px-12 py-4 sm:py-6 lg:py-12 flex flex-col items-center lg:flex-row lg:items-start justify-between gap-2 sm:gap-4 lg:gap-12">
        {/* Left Column */}
        <div className="flex flex-col w-full lg:w-1/2 relative mb-4 lg:mb-0 items-center lg:items-start">
          {/* Bot and bubble at the top */}
          <div className="relative bg-[#1E3CA7] text-white text-xs sm:text-sm lg:text-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl shadow-xl w-fit max-w-full">
            {chatBot.greeting.split('\n').map((line, i) => (
              <span key={i} className="block text-center lg:text-left">
                {line}
              </span>
            ))}

            {/* Triangle tail */}
            <div
              className="absolute bottom-[-6px] sm:bottom-[-10px] right-4 w-0 h-0 
              border-l-[6px] sm:border-l-[10px] border-l-transparent 
              border-t-[6px] sm:border-t-[10px] border-t-[#1E3CA7] 
              border-r-[6px] sm:border-r-[10px] border-r-transparent"
            />
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 mt-2 sm:mt-4 lg:mt-12">
          <h3 className="text-base sm:text-lg lg:text-3xl font-bold mb-1 sm:mb-2 lg:mb-4 text-center text-heading px-1 sm:px-2">
            Meet Your Friendly AI Helper
          </h3>
          <p className="text-xs sm:text-sm lg:text-base mb-2 sm:mb-4 lg:mb-6 text-center text-heading2 px-1 sm:px-2">
            {chatBot.description}
          </p>
          <PrimaryButton
            text="Try Chat Now"
            className="text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-1.5 sm:py-4 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

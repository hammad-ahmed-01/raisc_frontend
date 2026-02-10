"use client";

import React from "react";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import Image from "next/image";

export const ChatBot: React.FC = () => (
  <div className="bg-[#F0F7FF] shadow-md p-6 rounded-2xl text-center w-fit max-w-xs flex flex-col items-center gap-4">
    {/* Image with circular ring */}
    <div className="relative flex items-center justify-center">
      <div className="absolute w-32 h-32 rounded-full border-2 border-[#1E3CA7] z-20" />
      <Image
        src="/support-chatbot.png"
        alt="RAISC Chatbot"
        width={120}
        height={120}
        className="relative z-10"
      />
    </div>

    {/* Heading */}
    <h3 className="text-heading2 text-xl font-bold mt-2">
      Need immediate support?
    </h3>

    {/* Description */}
    <p className="text-[#1E3CA7] text-md leading-relaxed">
      Start a private chat with RAISC AI anytime.
    </p>

    {/* CTA Button */}
    <SecondaryButton
      text="Talk Now"
      onClick={() => {
        window.location.href = "/chatbot";
      }}
      className="mt-2 px-8 py-2 rounded-full text-sm font-semibold"
    />
  </div>
);

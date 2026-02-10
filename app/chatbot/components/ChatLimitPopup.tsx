"use client";

import React from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

interface ChatLimitPopupProps {
  onBookTherapist: () => void;
}

const ChatLimitPopup: React.FC<ChatLimitPopupProps> = ({ onBookTherapist }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="
          w-[90%] max-w-[520px]
          bg-[#EDF6FF]
          border border-[#4C6EF5]
          rounded-2xl
          px-6 py-8
          text-center
          shadow-xl
        "
      >
        <h2 className="text-lg sm:text-xl font-semibold text-[#1E3CA7] mb-3">
          I’m really glad you reached out
        </h2>

        <p className="text-sm sm:text-base text-[#1E3CA7] leading-relaxed mb-6">
          You’ve used all your free responses for now.
          <br />
          To continue this conversation and get personal guidance, you’ll need
          to book a therapist.
        </p>

        <PrimaryButton
          text="Book a Therapist"
          onClick={onBookTherapist}
          className="px-8 py-3 rounded-full text-sm sm:text-base mx-auto"
        />
      </div>
    </div>
  );
};

export default ChatLimitPopup;

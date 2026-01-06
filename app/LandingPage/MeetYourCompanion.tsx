"use client";

import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

const MeetYourCompanion = () => {
  return (
    <section className="w-full bg-blue-50 py-16 px-4 flex justify-center border-b-4 border-blue-200">
      <div className="max-w-3xl w-full text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-3xl font-bold text-heading mb-2">
          Meet Your Companion
        </h2>
        <p className="text-xl font-semibold text-heading2 mb-10">
          Your 24/7 Support
        </p>

        {/* Card */}
        <div className="bg-[#F8F9FB] rounded-2xl border border-[#2196F3] shadow-sm px-6 md:px-12 py-10 flex flex-col md:flex-row items-center gap-10">
          {/* Robot Image */}
          <div className="flex-shrink-0">
            <Image
              src="/chatbot.png"
              alt="RAISC AI Companion"
              width={230}
              height={230}
              priority
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-center max-w-xl">
            <h3 className="text-2xl font-bold text-heading2 mb-4">
              Hi, I’m Lune
            </h3>

            <p className="text-base md:text-lg font-medium text-[#374151] leading-relaxed mb-6">
              Is something on your mind, or do you just feel like sharing? I’m
              your personal AI companion, always here to listen and support you.
            </p>

            <div className="flex justify-center">
              <PrimaryButton
                text="Say Hi to Lune"
                onClick={() => (window.location.href = "/chatbot")}
                className="px-8 py-3 rounded-full shadow-[0_4px_0_#00000030]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetYourCompanion;

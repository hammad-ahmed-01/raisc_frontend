"use client";

import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default function MeetCompanionSection() {
  return (
    <section className="w-full py-20 px-4 sm:px-8 md:px-16 bg-blue-50 flex flex-col items-center text-center font-['Exo_2'] text-heading2">
      {/* Heading */}
      <div className="mb-10">
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-heading2 mb-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)]">
          Meet Your Companion
        </h2>
        <p className="text-[clamp(0.95rem,1.5vw,1.1rem)] text-heading2/80">
          Your 24/7 Support
        </p>
      </div>

      {/* Card */}
      <div className="max-w-3xl w-full bg-white border border-[#2196F3] rounded-3xl shadow-[0_6px_15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 p-8 sm:p-10">
        {/* Left — Bot Image */}
        <div className="flex justify-center md:justify-start w-full md:w-1/2">
          <Image
            src="/chatbot-dash.png"
            alt="AI Companion Lune"
            width={250}
            height={250}
            className="object-contain"
          />
        </div>

        {/* Right — Text + CTA */}
        <div className="flex flex-col items-center text-center w-full md:w-1/2">
          <h3 className="text-[1.3rem] font-bold text-heading2 mb-3">
            Hi, I’m Lune
          </h3>
          <p className="text-[clamp(0.9rem,1.5vw,1.05rem)] text-heading2/80 leading-relaxed mb-6 max-w-md">
            Is something on your mind, or do you just feel like sharing?
            <br />
            I’m your personal AI companion, always here to listen and support you.
          </p>

          {/* CTA */}
          <PrimaryButton
            text="Say Hi to Lune"
            className="px-8 py-3 rounded-full"
          />
        </div>
      </div>
    </section>
  );
}

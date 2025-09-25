"use client";

import { useRouter } from "next/navigation";

type CardProps = {
  title: string;
  subtitle: string;
  onClick: () => void;
  gradient: string; // tailwind background or gradient classes
};

function CTAButtonCard({ title, subtitle, onClick, gradient }: CardProps) {
  return (
    <button
      onClick={onClick}
      className={`group text-center rounded-2xl w-full max-w-[420px] sm:max-w-[342px] h-[110px] sm:h-[150px] p-5 sm:p-6 border border-[#2196F3]
                  hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${gradient}`}
    >
      <div className="flex flex-col h-full justify-center">
        {/* Title on top */}
        <div className="font-bold text-heading text-lg sm:text-[28px] lg:text-[24px]">
          {title}
        </div>

        {/* Subtitle */}
        <div className="mt-1 sm:mt-2 text-heading2 text-sm sm:text-[24px] lg:text-[24px] leading-snug">
          {subtitle}
        </div>
      </div>
    </button>
  );
}

export default function CTAButtons() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center">
      <CTAButtonCard
        title="Start Therapy"
        subtitle="Connect with a therapist."
        gradient="bg-[#D9D9F9]"
        onClick={() => router.push("/Doctors")}
      />
      <CTAButtonCard
        title="Share"
        subtitle="Tell me how you feel."
        gradient="bg-[#D0E9FF]"
        onClick={() => router.push("/chatbot")}
      />
      <CTAButtonCard
        title="Get Matched"
        subtitle="I’ll guide you to support."
        gradient="bg-[#D6F5F2]"
        onClick={() => router.push("#")}
      />
    </div>
  );
}

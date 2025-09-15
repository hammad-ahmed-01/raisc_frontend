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
      className={`group text-center rounded-2xl w-full max-w-[360px] h-[180px] sm:h-[200px] p-6 border border-[#2196F3] 
                  hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${gradient}`}
    >
      <div className="flex flex-col h-full">
        {/* Title on top */}
        <div className="font-bold text-heading text-xl sm:text-[36px] lg:text-[36px]">
          {title}
        </div>

        {/* Subtitle right under title */}
        <div className="mt-2 text-heading2 text-base sm:text-[32px] lg:text-[32px] leading-snug">
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
        onClick={() => router.push("/get-matched")}
      />
    </div>
  );
}

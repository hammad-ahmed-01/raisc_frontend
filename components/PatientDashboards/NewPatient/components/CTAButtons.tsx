"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Angry,
  Frown,
  Meh,
  Smile,
  Laugh,
} from "lucide-react";

type CardProps = {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  gradient: string;
  children?: React.ReactNode;
};

function CTAButtonCard({
  title,
  subtitle,
  onClick,
  gradient,
  children,
}: CardProps) {
  return (
    <button
      onClick={onClick}
      className={`group text-center rounded-2xl w-full max-w-[420px] sm:max-w-[342px]
        h-[110px] sm:h-[150px] p-5 sm:p-6 border border-[#2196F3]
        hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200 ${gradient}`}
    >
      <div className="flex flex-col h-full justify-center items-center">
        <div className="font-bold text-heading text-lg sm:text-[28px] lg:text-[24px]">
          {title}
        </div>

        {subtitle && (
          <div className="mt-1 sm:mt-2 text-heading2 text-sm sm:text-[24px] lg:text-[24px] leading-snug">
            {subtitle}
          </div>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </button>
  );
}

export default function CTAButtons() {
  const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const moods = [
    { label: "Angry", value: "Angry", Icon: Angry, color: "text-red-500" },
    { label: "Sad", value: "Sad", Icon: Frown, color: "text-orange-500" },
    { label: "Neutral", value: "Neutral", Icon: Meh, color: "text-yellow-500" },
    { label: "Happy", value: "Happy", Icon: Smile, color: "text-green-500" },
    { label: "Excited", value: "Happy", Icon: Laugh, color: "text-blue-500" },
  ];

  async function setMood(label: string) {
    if (submitting) return;

    setSelectedMood(label);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (typeof window !== "undefined") {
        const tok = (localStorage.getItem("session_key") || "").trim();
        if (tok) headers.Authorization = `Token ${tok}`;
      }

      await fetch(`${BASE}/patients/set-mood/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ mood: label }),
      });
    } catch (e) {
      console.error("Failed to set mood", e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center">
      {/* Start Therapy */}
      <CTAButtonCard
        title="Start Therapy"
        subtitle="Connect with a therapist."
        gradient="bg-[#D9D9F9]"
        onClick={() => router.push("/Doctors")}
      />

      {/* Share */}
      <CTAButtonCard
        title="Share"
        subtitle="Tell me how you feel."
        gradient="bg-[#D0E9FF]"
        onClick={() => router.push("/chatbot")}
      />

      {/* Mood Selector */}
      <CTAButtonCard
        title="How are you feeling?"
        gradient="bg-[#D6F5F2]"
      >
        <div className="flex items-center justify-center gap-2">
          {moods.map(({ label, Icon, color }) => (
            <button
              key={label}
              onClick={(e) => {
                e.stopPropagation();
                setMood(label);
              }}
              className={`rounded-full p-2 transition transform hover:scale-110
                ${
                  selectedMood === label
                    ? "bg-white shadow-md"
                    : "opacity-80"
                }`}
              title={label}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
            </button>
          ))}
        </div>
      </CTAButtonCard>
    </div>
  );
}

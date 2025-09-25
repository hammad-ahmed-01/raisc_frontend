"use client";

import Image from "next/image";
import ChatBotImage from "@/public/chatbot.png";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { useRouter } from "next/navigation";

interface ChatBotData {
  greeting: string;
  description: string;
}

export default function AIChat() {
  const router = useRouter();

  // Local defaults; can be overridden by backend
  const [chatBot, setChatBot] = useState<ChatBotData>({
    greeting: "Meet Lune\nYour AI Companion!",
    description: "Share with me what you are feeling",
  });

  useEffect(() => {
    const fetchChatBotData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/chatbot/info`,
            { cache: "no-store" }
          );
          if (res.ok) {
            const data = (await res.json()) as Partial<ChatBotData>;
            setChatBot((prev) => ({
              greeting: data.greeting ?? prev.greeting,
              description: data.description ?? prev.description,
            }));
          }
        } catch {
          // keep defaults if fetch fails
        }
      }
    };
    fetchChatBotData();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[790px] lg:max-h-[466px] overflow-hidden">
      <div className="relative bg-[#EEEEEE] rounded-[32px] sm:rounded-[50px] border border-[#2196F3]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 sm:p-6 lg:p-10 items-center">
          {/* Left: Greeting + Description + Button */}
          <div className="flex flex-col items-center text-center order-2 lg:order-1">
            <div className="text-heading2 text-2xl sm:text-2xl lg:text-[32px] font-bold leading-snug">
              {chatBot.greeting.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </div>

            <p className="mt-4 text-heading2 text-base sm:text-lg lg:text-[25px]">
              {chatBot.description}
            </p>

            <div className="mt-6">
              <PrimaryButton
                text="Try Chat Now"
                className="px-6 py-3 rounded-full text-lg sm:text-xl lg:text-2xl font-bold"
                onClick={() => router.push("/chatbot")}
              />
            </div>
          </div>

          {/* Right: Robot illustration */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-[220px] sm:w-[300px] lg:w-[360px] aspect-[4/3]">
              <Image
                src={ChatBotImage}
                alt="Lune the AI Companion"
                fill
                priority
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 360px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client"

// components/TipAndSupportCard.tsx
import { Lightbulb, HelpCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from 'react';

interface TipData {
  title: string;
  content: string;
}

export default function TipAndSupportCard() {
  const [tip, setTip] = useState<TipData>({
    title: "Tip of the Day",
    content: "Relax. Breathe. \nLet go a little."
  });
  
  useEffect(() => {
    const fetchTipData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/tips/daily`);
          if (response.ok) {
            const data = await response.json();
            setTip(data);
          }
        } catch (error) {
          console.error("Failed to fetch tip data:", error);
        }
      }
    };
    
    fetchTipData();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 my-8">
      <div className="space-y-6 w-full max-w-md">
        {/* Tip of the Day */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-4">
          <div className="text-yellow-500">
            <Lightbulb size={40} />
          </div>
          <div>
            <h3 className="font-bold text-heading2 mb-1">{tip.title}</h3>
            <p className="text-heading2 text-sm leading-snug">
              {tip.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < tip.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Support Box */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4">
          <div className="text-blue-700">
            <HelpCircle size={40} />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-heading2 text-base">
              Need support <br />
              right now?
            </h3>
          </div>
          <div className="text-pink-500">
            <Sparkles size={36} />
          </div>
        </div>
      </div>
    </div>
  );
}

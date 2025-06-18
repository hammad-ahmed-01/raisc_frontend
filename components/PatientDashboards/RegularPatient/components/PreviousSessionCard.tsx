"use client"

// components/PreviousSessionCard.tsx
import { Brain, NotebookText, Target } from "lucide-react";
import { useEffect, useState } from 'react';

interface SessionData {
  sessionNumber: number;
  topic: string;
  date: string;
  keyPoints: {
    icon: string;
    text: string;
  }[];
  feedback: string;
}

export default function PreviousSessionCard() {
  const [session, setSession] = useState<SessionData>({
    sessionNumber: 4,
    topic: "Managing Daily Anxiety",
    date: "May 24, 2025 – 4:00 PM",
    keyPoints: [
      {
        icon: "brain",
        text: "Breathing Exercises"
      },
      {
        icon: "notebook",
        text: "Journaling habit"
      },
      {
        icon: "target",
        text: "Setting small daily goals"
      }
    ],
    feedback: "You felt calmer after the session 😊✨"
  });
  
  useEffect(() => {
    const fetchSessionData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/sessions/latest`);
          if (response.ok) {
            const data = await response.json();
            setSession(data);
          }
        } catch (error) {
          console.error("Failed to fetch session data:", error);
        }
      }
    };
    
    fetchSessionData();
  }, []);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'brain': return <Brain size={18} className="text-heading2" />;
      case 'notebook': return <NotebookText size={18} className="text-heading2" />;
      case 'target': return <Target size={18} className="text-heading2" />;
      default: return <Brain size={18} className="text-heading2" />;
    }
  };

  return (
    <div className="max-w-sm opacity-80 p-6 bg-gradient-to-br border-2 border-[#bfaaff] from-purple-100 to-blue-50 rounded-3xl shadow-md">
      <h2 className="text-xl font-semibold text-heading2 text-center mb-4">
        Previous Session
      </h2>
      <hr className="border-blue-200 mb-4" />

      <div className="text-heading2 space-y-4 text-left">
        <div>
          <p className="font-semibold">Session #{session.sessionNumber}:</p>
          <p className="ml-2">{session.topic}</p>
        </div>

        <div>
          <p className="font-semibold">Held on:</p>
          <p className="ml-2">{session.date}</p>
        </div>

        <div>
          <p className="font-semibold">Key Points Covered:</p>
          <div className="ml-4 space-y-2">
            {session.keyPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                {getIcon(point.icon)}
                <span>{point.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p>{session.feedback}</p>
      </div>

      <div className="mt-6 text-center">
        <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
          View Notes
        </button>
      </div>
    </div>
  );
}

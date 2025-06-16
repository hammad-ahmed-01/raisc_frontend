"use client"

// components/PsychologistCard.tsx
import { UserCircle2, Dot, Calendar } from "lucide-react";
import { useEffect, useState } from 'react';

interface PsychologistData {
  name: string;
  role: string;
  isAvailable: boolean;
  imageUrl: string;
  upcomingSession: string;
}

export default function PsychologistCard() {
  const [psychologist, setPsychologist] = useState<PsychologistData>({
    name: "Dr. Sara Khan",
    role: "Clinical Psychologist",
    isAvailable: true,
    imageUrl: "",
    upcomingSession: "Monday, 29 May – 3:00 PM"
  });
  
  useEffect(() => {
    const fetchPsychologistData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/psychologist/current`);
          if (response.ok) {
            const data = await response.json();
            setPsychologist(data);
          }
        } catch (error) {
          console.error("Failed to fetch psychologist data:", error);
        }
      }
    };
    
    fetchPsychologistData();
  }, []);

  return (
    <div className="max-w-sm opacity-80 p-6 bg-gradient-to-br border-2 border-[#bfaaff] from-purple-100 to-blue-50 rounded-3xl shadow-md">
      <h2 className="text-2xl font-bold text-heading mb-3">Psychologist Connection</h2>

      <div className="flex items-center gap-4">
        {psychologist.imageUrl ? (
          <img 
            src={psychologist.imageUrl} 
            alt={psychologist.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <UserCircle2 size={36} className="text-gray-600" />
          </div>
        )}
        <div>
          <p className="font-bold text-lg">{psychologist.name}</p>
          <p className="text-sm">{psychologist.role}</p>
          <p className={`${psychologist.isAvailable ? 'text-green-600' : 'text-red-600'} text-sm flex items-center gap-1`}>
            <Dot className={psychologist.isAvailable ? 'text-green-600' : 'text-red-600'} /> 
            {psychologist.isAvailable ? 'Available Now' : 'Not Available'}
          </p>
          <a href="#" className="text-blue-600 underline text-sm">view more</a>
        </div>
      </div>

      <button className="mt-4 w-full bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
        Send Message
      </button>

      <div className="mt-6">
        <p className="font-semibold flex items-center text-centre gap-2">
          <Calendar size={18} /> Upcoming session
        </p>
        <p className="text-sm text-left ml-7">{psychologist.upcomingSession}</p>

        <button className="mt-3 w-full bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
          Reschedule
        </button>
      </div>
    </div>
  );
}

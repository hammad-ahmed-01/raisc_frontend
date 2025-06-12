// components/PsychologistCard.tsx

import { UserCircle2, Dot, Calendar } from "lucide-react";

export default function PsychologistCard() {
  return (
    <div className="max-w-sm opacity-80 p-6 bg-gradient-to-br border-2 border-[#bfaaff] from-purple-100 to-blue-50 rounded-3xl shadow-md">
      <h2 className="text-2xl font-bold text-heading mb-3">Psychologist Connection</h2>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <UserCircle2 size={36} className="text-gray-600" />
        </div>
        <div>
          <p className="font-bold text-lg">Dr. Sara Khan</p>
          <p className="text-sm">Clinical Psychologist</p>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <Dot className="text-green-600" /> Available Now
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
        <p className="text-sm text-left ml-7">Monday, 29 May – 3:00 PM</p>

        <button className="mt-3 w-full bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
          Reschedule
        </button>
      </div>
    </div>
  );
}

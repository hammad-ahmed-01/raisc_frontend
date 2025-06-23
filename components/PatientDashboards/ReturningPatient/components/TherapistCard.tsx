import React from 'react';
import { Hourglass } from 'lucide-react';

export const TherapistCard: React.FC = () => (
  <div className="bg-[#F6FDFE] shadow-md p-6 rounded-2xl w-full max-w-sm text-heading2">
    <h2 className="text-heading2 bg-[#D7E2FE] text-xl font-semibold p-4 mb-6 rounded-full text-center">
      Choose Your Therapist
    </h2>

    <div className="flex items-center gap-4 mb-4">
      <img
        src="/doctor-avatar.png"
        alt="Therapist"
        className="w-20 h-20 rounded-full border-heading border-2"
      />
      <div className="flex flex-col">
        <p className="text-blue-800 font-semibold text-lg">Dr. Ailah Ahmed</p>
        <p className="text-blue-500 text-sm">Cognitive Therapy</p>
        <p className="text-yellow-500 text-sm">⭐ 4.7 Rating</p>
      </div>
    </div>

    <div className="mt-2 mb-4 text-sm font-semibold flex items-center justify-center gap-2 text-heading2">
      <span>Status:</span>
      <Hourglass size={16} />
      <span>Pending Request</span>
    </div>

    <button className="w-full bg-gray-200 text-blue-800 px-4 py-2 rounded-full shadow hover:bg-gray-300 transition">
      Remove Request
    </button>

    <hr className="my-5 text-[#D0E3FFC7]" />

    <div className="flex justify-center">
      <button className="w-fit flex items-center justify-center bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 rounded-full shadow-sm hover:opacity-90 transition">
        View more
      </button>
    </div>
  </div>
);

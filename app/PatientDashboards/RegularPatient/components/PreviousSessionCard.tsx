// components/PreviousSessionCard.tsx
import { Brain, NotebookText, Target } from "lucide-react";

export default function PreviousSessionCard() {
  return (
    <div className="max-w-sm opacity-80 p-6 bg-gradient-to-br border-2 border-[#bfaaff] from-purple-100 to-blue-50 rounded-3xl shadow-md">
      <h2 className="text-xl font-semibold text-heading2 text-center mb-4">
        Previous Session
      </h2>
      <hr className="border-blue-200 mb-4" />

      <div className="text-heading2 space-y-4 text-left">
        <div>
          <p className="font-semibold">Session #4:</p>
          <p className="ml-2">Managing Daily Anxiety</p>
        </div>

        <div>
          <p className="font-semibold">Held on:</p>
          <p className="ml-2">May 24, 2025 – 4:00 PM</p>
        </div>

        <div>
          <p className="font-semibold">Key Points Covered:</p>
          <div className="ml-4 space-y-2">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-heading2" />
              <span>Breathing Exercises</span>
            </div>
            <div className="flex items-center gap-2">
              <NotebookText size={18} className="text-heading2" />
              <span>Journaling habit</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-heading2" />
              <span>Setting small daily goals</span>
            </div>
          </div>
        </div>

        <p>You felt calmer after the session <span className="inline-block">😊✨</span></p>
      </div>

      <div className="mt-6 text-center">
        <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
          View Notes
        </button>
      </div>
    </div>
  );
}

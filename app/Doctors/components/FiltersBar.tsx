// app/DoctorsPage/components/FiltersBar.tsx
"use client";

import { Compass, Sparkles, Star } from "lucide-react";

type FilterType = "experience" | "rating" | "specialty";

interface Props {
  filterType: FilterType;
  onChange: (t: FilterType) => void;
}

export default function FiltersBar({ filterType, onChange }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
      <button
        className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[#1E3CA7] flex items-center gap-1.5 sm:gap-2 border text-xs sm:text-sm ${
          filterType === "experience" ? "bg-white border-blue-300 font-medium" : "bg-white border-gray-200 shadow-sm"
        }`}
        onClick={() => onChange("experience")}
      >
        <Compass className={filterType === "experience" ? "w-4 h-4 text-green-600" : "w-4 h-4 text-blue-600"} />
        Sort by Experience
      </button>

      <button
        className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[#1E3CA7] rounded-full flex items-center gap-1.5 sm:gap-2 border text-xs sm:text-sm ${
          filterType === "rating" ? "bg-white border-yellow-300 font-medium" : "bg-white border-gray-200 shadow-sm"
        }`}
        onClick={() => onChange("rating")}
      >
        <Star className="w-4 h-4 text-yellow-500" /> Highest Rated
      </button>

      <button
        className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[#1E3CA7] rounded-full flex items-center gap-1.5 sm:gap-2 border text-xs sm:text-sm ${
          filterType === "specialty" ? "bg-white border-purple-300 font-medium" : "bg-white border-gray-200 shadow-sm"
        }`}
        onClick={() => onChange("specialty")}
      >
        <Sparkles className="w-4 h-4 text-blue-500" /> Specialties
      </button>
    </div>
  );
}

// app/DoctorsPage/components/SearchInputs.tsx
"use client";

import { Search } from "lucide-react";

interface Props {
  searchCity: string;
  setSearchCity: (v: string) => void;
  searchSpecialty: string;
  setSearchSpecialty: (v: string) => void;
}

export default function SearchInputs({
  searchCity,
  setSearchCity,
  searchSpecialty,
  setSearchSpecialty,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-7">
      <div className="relative w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search by city e.g, Lahore"
          className="pl-9 sm:pl-10 pr-3 sm:pr-4 font-weight-400 py-2 rounded-full bg-[#FFD2DC] border-0 w-full sm:w-64 shadow-sm text-[#444444] text-xs sm:text-sm"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <Search className="text-[#444444] absolute left-2 sm:left-3 top-2.5 w-4 h-4" />
      </div>

      <div className="relative w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search by specialties e.g, CBT"
          className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 font-weight-400 rounded-full bg-[#FFD2DC] border-0 w-full sm:w-64 shadow-sm text-[#444444] text-xs sm:text-sm"
          value={searchSpecialty}
          onChange={(e) => setSearchSpecialty(e.target.value)}
        />
        <Search className="text-[#444444] absolute left-2 sm:left-3 top-2.5 w-4 h-4" />
      </div>
    </div>
  );
}

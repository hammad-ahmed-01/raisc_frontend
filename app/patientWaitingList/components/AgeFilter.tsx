import { ChevronDown } from "lucide-react";
import React from "react";

interface AgeFilterProps {
  onAgeChange: (val: string) => void;
}

export const AgeFilter: React.FC<AgeFilterProps> = ({ onAgeChange }) => {
  return (
    <div className="relative w-full md:w-48">
      <select
        onChange={(e) => onAgeChange(e.target.value)}
        className="appearance-none w-full p-3 pr-10 rounded-xl shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
      >
        <option value="">Age</option>
        <option value="18-22">18-22</option>
        <option value="23-26">23-26</option>
        <option value="27-30">27-30</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
    </div>
  );
};


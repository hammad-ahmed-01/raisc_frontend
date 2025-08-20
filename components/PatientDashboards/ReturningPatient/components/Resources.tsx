import React from 'react';
import { FileText, Heart, Headphones } from 'lucide-react';

export const Resources: React.FC = () => (
  <div className="bg-[#FFF8EC] p-3 sm:p-4 rounded-2xl shadow-md w-full max-w-[280px] sm:max-w-xs">
    <h2 className="text-heading font-bold text-base sm:text-xl text-center mb-3 sm:mb-4">Resources</h2>
    <ul className="space-y-2 sm:space-y-3">
      <li className="bg-white rounded-full shadow px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
        <FileText className="text-blue-800" size={16} /> 
        <span className="text-xs sm:text-sm">Articles.......</span>
      </li>
      <li className="bg-white rounded-full shadow px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
        <Heart className="text-blue-800" size={16} /> 
        <span className="text-xs sm:text-sm">Exercises.....</span>
      </li>
      <li className="bg-white rounded-full shadow px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
        <Headphones className="text-blue-800" size={16} /> 
        <span className="text-xs sm:text-sm">Audio.....</span>
      </li>
    </ul>
    <p className="text-blue-600 text-xs sm:text-sm mt-2 sm:mt-3 text-center underline cursor-pointer">See all resources</p>
  </div>
);
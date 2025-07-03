import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const QuoteCarousel: React.FC = () => (
  <div className="flex justify-center items-center mt-2 sm:mt-4">
    <div className="flex items-center bg-[#F6FDFE] shadow-md px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-heading font-medium gap-1 sm:gap-3 max-w-[280px] sm:max-w-none">
      <button className="text-heading bg-[#F6FDFE] transition-transform duration-200 hover:scale-110 p-1">
        <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
      </button>
      <span className="text-xs sm:text-sm lg:text-base text-center">One day at a time.</span>
      <button className="text-heading bg-[#F6FDFE] transition-transform duration-200 hover:scale-110 p-1">
        <ChevronRight size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  </div>
);

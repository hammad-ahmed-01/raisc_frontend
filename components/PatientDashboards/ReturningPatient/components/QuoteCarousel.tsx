import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const QuoteCarousel: React.FC = () => (
  <div className="flex justify-center items-center mt-4">
    <div className="flex items-center bg-[#F6FDFE] shadow-md px-4 py-2 rounded-full text-heading font-medium gap-3">
      <button className="text-heading bg-[#F6FDFE] transition-transform duration-200 hover:scale-110">
        <ChevronLeft size={20} />
      </button>
      <span>One day at a time.</span>
      <button className="text-heading bg-[#F6FDFE]  transition-transform duration-200 hover:scale-110">
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

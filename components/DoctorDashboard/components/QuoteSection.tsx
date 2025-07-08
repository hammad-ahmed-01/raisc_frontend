import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const quotes = [
  "The good physician treats the disease; the great physician treats the patient who has the disease.",
  "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
  "The art of medicine consists of amusing the patient while nature cures the disease."
];

const authors = [
  "William Osler",
  "Hippocrates",
  "Voltaire"
];

export const QuoteSection: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  return (
    <div 
      className="bg-[#EBF5FF] rounded-[40px] p-6 shadow-md max-w-3xl mx-auto"
      style={{ 
        boxShadow: '0px 4px 4px 0px #00000040',
        border: '1px solid #65B6F9'
      }}
    >
      <div className="flex items-center">
        <button 
          onClick={prevQuote}
          className="text-[#1E3CA7] bg-transparent hover:bg-transparent hover:opacity-50 text-3xl font-bold"
          aria-label="Previous quote"
        >
          &lt;
        </button>
        
        <div className="flex-1 flex items-center mx-4">
          <div className="mr-4">
            <img 
              src="/doctordashboard/sthsc.svg" 
              alt="Stethoscope" 
              width="100" 
              height="100"
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-2xl text-[#0A369D] leading-tight" style={{ fontWeight: 500 }}>
              "{quotes[currentQuote]}"
            </p>
            <p className="text-lg text-[#0A369D] text-right mt-2" style={{ fontWeight: 600 }}>
              _{authors[currentQuote]}
            </p>
          </div>
        </div>
        <button 
          onClick={nextQuote}
          className="text-[#1E3CA7] bg-transparent hover:bg-transparent hover:opacity-50 text-3xl font-bold"
          aria-label="Next quote"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
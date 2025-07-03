"use client"

import { FaFeatherAlt } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useEffect, useState } from 'react';

interface QuoteData {
  text: string;
  author: string;
}

export default function Quote() {
  const [quotes, setQuotes] = useState<QuoteData[]>([
    {
      text: "Your mind will answer most questions if you learn to relax and wait for the answer.",
      author: "William S. Burroughs"
    },
    {
      text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
      author: "Albus Dumbledore"
    },
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela"
    }
  ]);
  
  const [currentQuote, setCurrentQuote] = useState<number>(0);
  
  useEffect(() => {
    const fetchQuotes = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/quotes/daily`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              setQuotes(data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch quotes data:", error);
        }
      }
    };
    
    fetchQuotes();
  }, []);
  
  const handlePrevious = () => {
    setCurrentQuote((prev) => (prev === 0 ? quotes.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentQuote((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg px-4 lg:px-12 py-6 lg:py-10 flex flex-col lg:flex-row items-center justify-between max-w-4xl mx-auto mt-8 lg:mt-12 text-[#1E3CA7]">
      {/* Back Arrow */}
      <button
        className="text-2xl lg:text-3xl text-[#1E3CA7] hover:opacity-80 transition bg-transparent border-none p-0 order-2 lg:order-1 mt-4 lg:mt-0"
        style={{ background: "none", border: "none" }}
        aria-label="Previous quote"
        onClick={handlePrevious}
      >
        <IoIosArrowBack />
      </button>

      {/* Quote Content */}
      <div className="flex flex-col text-center flex-1 px-2 lg:px-6 order-1 lg:order-2">
        <div className="flex flex-col lg:flex-row items-center justify-center text-center gap-3 text-base lg:text-lg xl:text-xl font-medium">
          <FaFeatherAlt className="text-pink-400 text-3xl lg:text-5xl mb-2 lg:mb-0" />
          <span className="text-sm lg:text-base xl:text-lg">
            "{quotes[currentQuote].text}"
          </span>
        </div>
        <span className="text-xs lg:text-sm xl:text-base text-center text-gray-600 mt-2 lg:mt-4 font-normal">
          — {quotes[currentQuote].author}
        </span>
      </div>

      {/* Forward Arrow */}
      <button
        className="text-2xl lg:text-3xl text-[#1E3CA7] hover:opacity-80 transition bg-transparent border-none p-0 order-3 mt-4 lg:mt-0"
        style={{ background: "none", border: "none" }}
        aria-label="Next quote"
        onClick={handleNext}
      >
        <IoIosArrowForward />
      </button>
    </div>
  );
}

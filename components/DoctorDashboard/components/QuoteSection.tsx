import React, { useState } from "react";
import Image from "next/image";

const quotes = [
  "The good physician treats the disease; the great physician treats the patient who has the disease.",
  "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
  "The art of medicine consists of amusing the patient while nature cures the disease.",
];

const authors = ["William Osler", "Hippocrates", "Voltaire"];

export const QuoteSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((i) => (i + 1) % quotes.length);
  const prev = () => setCurrent((i) => (i - 1 + quotes.length) % quotes.length);

  return (
    <div
      className="bg-[#EBF5FF] rounded-[24px] sm:rounded-[40px] p-4 sm:p-6 shadow-md max-w-3xl mx-auto border border-[#65B6F9]"
      style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Decorative image hidden on small for space */}
        <div className="mr-2 hidden sm:block">
          <Image
            src="/doctordashboard/sthsc.svg"
            alt="Stethoscope"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        <div className="flex-1">
          {/* Quote */}
          <p className="text-[18px] sm:text-2xl leading-snug text-[#0A369D] text-center sm:text-left">
            “{quotes[current]}”
          </p>

          {/* Controls: arrows wrapped around the author name */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="text-[#1E3CA7] bg-transparent hover:opacity-70 text-2xl sm:text-3xl font-bold px-2"
              aria-label="Previous quote"
              type="button"
            >
              ‹
            </button>

            <p className="text-[#0A369D] text-base sm:text-lg font-semibold whitespace-nowrap text-center">
              _{authors[current]}
            </p>

            <button
              onClick={next}
              className="text-[#1E3CA7] bg-transparent hover:opacity-70 text-2xl sm:text-3xl font-bold px-2"
              aria-label="Next quote"
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

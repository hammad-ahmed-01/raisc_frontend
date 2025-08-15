"use client";

import React from 'react';
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/register');
  }
  
  return (
    <section 
      id="home" 
      className="relative min-h-screen px-4 pt-20 md:pt-24 lg:pt-28 pb-32 bg-blue-50 overflow-hidden" style={{borderBottom: "5px solid #D0E3FFC7",}}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/landingpagebg.png"
          alt="Background"
          className="w-full h-full object-cover hidden sm:block"
        />
        <img
          src="/landingpagebg_mobile.png"
          alt="Background Mobile"
          className="w-full h-full object-cover block sm:hidden"
        />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-6 text-white">
        {/* Left column - centered content */}
        <div className="flex flex-col justify-center items-center space-y-6 px-4 mt-36">
          <h1 className="text-heading text-6xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
            Welcome to RAISC
          </h1>
          <h2 className="text-heading2 text-xl max-w-md">
            Your mental wellness companion.
          </h2>
          <p className="text-normal text-center max-w-md">
            Connect with licensed psychologists and psychiatrists in a safe, confidential environment. Begin your journey to better mental health today.
          </p>
          <div className="flex gap-4">
            <button onClick={handleGetStarted} className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90">
              Get Started
            </button>
            <a href="#about">
              <button className="bg-white border-2 border-black text-black py-2 px-6 rounded-full shadow-sm hover:bg-blue-100 transition duration-200">
                Learn More
              </button>
            </a>
          </div>
        </div>

        {/* Right column left empty or for future use */}
        <div className="hidden md:block"></div>
      </div>
    </section>
  );
}

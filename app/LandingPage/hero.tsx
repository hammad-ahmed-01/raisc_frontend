import React from 'react';

export default function HeroSection() {
  return (
    <section id="home" className="text-center px-4 py-16 bg-blue-50">
      <h1 className="text-heading md:text-4xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">Welcome to RAISC</h1>
      <h2 className="text-heading2 mb-2 max-w-xl mx-auto">
        Your mental wellness companion.
      </h2>
      <p className="text-normal mb-6 max-w-xl mx-auto">
        Connect with licensed psychologists and psychiatrists in a safe, confidential environment. Begin your journey to better mental health today.
      </p>
      <div className="flex justify-center gap-4">
        <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90">
            Get Started
        </button>
        <button className="bg-white border-2 border-black text-black py-2 px-6 rounded-full shadow-sm hover:bg-blue-100">Learn More</button>
      </div>
    </section>
  );
}
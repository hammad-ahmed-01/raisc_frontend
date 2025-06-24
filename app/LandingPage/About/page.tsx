'use client';

import React from 'react';
import AboutRAISC from './components/AboutRAISC';

export default function AboutPage() {
  return (
    <section 
      id="about" 
      className="relative min-h-screen px-4 pt-20 md:pt-24 lg:pt-28 pb-32 bg-blue-50 overflow-hidden text-center"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/servicesbg.png"
          alt="About Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto">
        <AboutRAISC />
      </main>
    </section>
  );
}

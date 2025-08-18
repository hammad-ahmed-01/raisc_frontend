'use client';

import React from 'react';
import AboutRAISC from './components/AboutRAISC';

export default function AboutPage() {
  return (
    <section 
      id="about" 
      className="relative px-4 py-20 bg-blue-50 h-screen overflow-hidden"
      style={{ 
        borderBottom: '5px solid #D0E3FFC7'
      }}
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
      <div className="relative z-10 max-w-6xl mx-auto">
        <AboutRAISC />
      </div>
    </section>
  );
}

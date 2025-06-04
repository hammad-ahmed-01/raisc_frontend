import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="text-center px-4 py-16">
      <h2 className="inline-block px-8 py-3 text-heading font-bold text-2xl rounded-full border border-heading bg-[#F1F4FB] shadow-md mb-[6px]">
        About RAISC
      </h2>
      <p className="text-normal max-w-3xl mx-auto">
        At RAISC, we are dedicated to making mental healthcare accessible, effective, and stigma-free.
        Our network of qualified professionals ensures tailored support to help you thrive.
      </p>
      <p className="text-normal mt-4 max-w-3xl mx-auto">
        We believe in a future where anyone can receive mental health support, making it more accessible and convenient.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90">
            Get Started Today
        </button>
        <button className="bg-white border-2 border-black text-black py-2 px-6 rounded-full shadow-sm hover:bg-blue-100">Learn More About Us</button>
      </div>
    </section>
  );
}

//#F1F4FB
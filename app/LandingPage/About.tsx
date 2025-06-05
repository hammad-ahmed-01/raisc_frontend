import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="text-center px-4 py-16 min-h-screen bg-[#FAFDFF]">
      <div className="flex flex-col items-center space-y-12 max-w-3xl mx-auto">
        {/* Heading */}
        <h2 className="px-8 py-3 mt-32 text-heading font-bold text-2xl rounded-full border border-heading bg-[#F1F4FB] shadow-md">
          About RAISC
        </h2>

        {/* Paragraph 1 */}
        <p className="text-normal">
          At RAISC, we are dedicated to making mental healthcare accessible, effective, and personalized for everyone. Our platform connects patients with qualified mental health professionals, providing a safe and supportive environment for healing and growth.
        </p>

        {/* Paragraph 2 */}
        <p className="text-normal">
           We believe in the power of technology to transform mental healthcare delivery, making it more accessible and effective while maintaining the human touch that is essential for healing.
        </p>

        {/* Call to Action Button */}
        <div>
          <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
}

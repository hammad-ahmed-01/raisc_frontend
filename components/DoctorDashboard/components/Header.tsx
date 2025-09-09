import React from 'react';

export const Header: React.FC<{ name: string }> = ({ name }) => (
  <div className="text-left pt-32 sm:pt-36 mt-4 sm:mt-6">
    <h1 className="text-3xl text-left font-bold text-[#1E3CA7]" style={{ fontWeight: 700 }}>
      Welcome back, Dr. Yusuf Haroon
    </h1>
    <p className="text-xl text-[#1E3CA7] inline-block" style={{ fontWeight: 400 }}>
      {"You're helping build a world where mental health is a priority."}
    </p>
  </div>
);

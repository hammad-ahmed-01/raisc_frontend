import React from 'react';

export const Header: React.FC<{ name: string }> = ({ name }) => (
  <div className="text-left pt-20 sm:pt-36 mt-2 sm:mt-6">
    <h1 className="text-2xl sm:text-3xl text-left font-bold text-[#1E3CA7]">
      Welcome back, {name}
    </h1>
    <p className="text-base sm:text-xl text-[#1E3CA7] inline-block">
      {"You're helping build a world where mental health is a priority."}
    </p>
  </div>
);

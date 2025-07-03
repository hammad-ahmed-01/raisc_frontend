import React from 'react';

export const Header: React.FC<{ name: string }> = ({ name }) => (
  <div className="text-left pt-4 sm:pt-6 mt-4 sm:mt-6 lg:mt-12 ml-2 sm:ml-4 lg:ml-16">
    <p className="text-lg sm:text-2xl lg:text-4xl font-extrabold text-heading leading-tight">
      Welcome back, {name}
    </p>
    <p className="text-sm sm:text-base lg:text-lg font-semibold text-heading2 mt-1 sm:mt-2 max-w-xl">
      "Healing takes time, and asking for help is a courageous step."
    </p>
  </div>
);

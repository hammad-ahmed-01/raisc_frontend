import React from 'react';

export const Header: React.FC<{ name: string }> = ({ name }) => (
  <div className="text-left pt-6 mt-12 ml-16">
    <p className="text-4xl font-extrabold text-heading leading-tight">
      Welcome back, {name}
    </p>
    <p className="text-lg font-semibold text-heading2 mt-2 max-w-xl">
      “Healing takes time, and asking for help is a courageous step.”
    </p>
  </div>
);

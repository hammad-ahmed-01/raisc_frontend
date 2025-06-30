import React from 'react';

const Header = () => (
  <div className="bg-[#EEE7FD] border border-[#D1D5DB] p-6 rounded-[28px] flex flex-col md:flex-row justify-between items-center md:items-stretch min-h-28">
    {/* Left Column */}
    <div className="flex flex-col justify-center text-center md:text-left">
      <h2 className="text-2xl font-bold text-heading">Welcome, Hira</h2>
      <p className="text-md text-heading">Your AI Assistant is here to support you.</p>
    </div>

    {/* Right Column */}
    <div className="flex items-end justify-center md:justify-end mt-4 md:mt-0">
      <div className="text-heading font-semibold flex items-center space-x-2">
        <span className="text-lg">🟢</span>
        <span>Status: AI Buddy – Online</span>
      </div>
    </div>
  </div>
);

export default Header;

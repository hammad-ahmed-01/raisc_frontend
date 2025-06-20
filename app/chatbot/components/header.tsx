import React from 'react';

const Header = () => (
  <div className="bg-[#F4DFDF] p-4 rounded-xl flex flex-col justify-center items-center text-center min-h-40">
    <h2 className="text-2xl font-bold text-heading py-2">Welcome, Hira</h2>
    <p className="text-md text-normal">Your AI Assistant is here to support you.</p>
    <div className="text-heading2 font-semibold py-2">🟢 Status: AI Buddy - Online</div>
  </div>
);

export default Header;

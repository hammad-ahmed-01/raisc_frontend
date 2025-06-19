"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaHome, FaHistory, FaQuoteRight, FaRobot, FaUserMd, FaBook, FaUser } from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname(); // Get current path

  const menuItems = [
    { id: 1, title: 'Dashboard', icon: <FaHome size={20} />, path: '/dashboard' },
    { id: 2, title: 'Session History', icon: <FaHistory size={20} />, path: '/history' },
    { id: 3, title: 'Motivational Quotes', icon: <FaQuoteRight size={20} />, path: '/quotes' },
    { id: 4, title: 'Chat with AI Bot', icon: <FaRobot size={20} />, path: '/chat' },
    { id: 5, title: 'Psychologist', icon: <FaUserMd size={20} />, path: ['/AssociatedPsychologist', '/Doctors'] },
    { id: 6, title: 'Resources', icon: <FaBook size={20} />, path: '/resources' },
    { id: 7, title: 'Profile', icon: <FaUser size={20} />, path: '/profile' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-r from-[#2f51c7] to-[#071c69] text-white transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64 rounded-r-[24px]' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-start px-4 relative">
        <div className="w-12 h-12 flex items-center justify-center rounded-full">
          <Image
            src="/raisc-logo.png"
            alt="RAISC Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        {isExpanded && (
          <span className="absolute left-20 font-bold text-xl">
            RAISC
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const isActive = Array.isArray(item.path) ? item.path.includes(pathname) : pathname === item.path;
          return (
            <Link href={Array.isArray(item.path) ? item.path[0] : item.path} key={item.id}>
              <div
                className={`flex items-center h-14 px-6 cursor-pointer transition-colors ${
                  isActive ? 'bg-white/10 text-white font-semibold' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 flex justify-center">
                  {item.icon}
                </div>
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ml-4 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  }`}
                >
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

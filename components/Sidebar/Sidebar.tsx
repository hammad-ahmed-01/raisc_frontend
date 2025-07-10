"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaHome, FaHistory, FaQuoteRight, FaRobot, FaUserMd, FaBook, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-[#2f51c7] to-[#071c69] text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-r from-[#2f51c7] to-[#071c69] text-white transition-all duration-300 ease-in-out z-40 ${
          // Desktop behavior
          'lg:block lg:w-20 lg:hover:w-64 lg:rounded-r-[20px]'
        } ${
          // Mobile behavior
          isMobileMenuOpen ? 'block w-64' : 'hidden lg:block'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-start px-2 relative">
          <div className="w-16 h-16 flex items-center justify-center rounded-full">
            <Image
              src="/logo_white.svg"
              alt="RAISC Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          {(isExpanded || isMobileMenuOpen) && (
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
              <Link 
                href={Array.isArray(item.path) ? item.path[0] : item.path} 
                key={item.id}
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
                      (isExpanded || isMobileMenuOpen) ? 'opacity-100 w-auto' : 'opacity-0 w-0'
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
    </>
  );
};

export default Sidebar;

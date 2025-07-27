"use client"

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaGithub, FaTelegram, FaInstagram, FaDribbble } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const LatestFooter: React.FC = () => {
  const pathname = usePathname();
  
  // Check if we're on a dashboard page (where sidebar exists)
  const hasSidebar = pathname?.startsWith('/dashboard') || 
                    pathname?.startsWith('/history') || 
                    pathname?.startsWith('/quotes') || 
                    pathname?.startsWith('/chat') || 
                    pathname?.startsWith('/AssociatedPsychologist') || 
                    pathname?.startsWith('/Doctors') || 
                    pathname?.startsWith('/resources') || 
                    pathname?.startsWith('/profile');

  return (
    <footer className="w-full relative">
      {/* Main Footer with gradient background */}
      <div className="bg-gradient-to-b from-[#1E3CA7] to-[#0C1741] text-white pt-16 lg:pt-24 pb-8">
        <div className={`mx-auto px-2 sm:px-4 ${hasSidebar ? 'max-w-6xl lg:ml-auto lg:mr-auto lg:pl-20' : 'max-w-7xl'}`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${hasSidebar ? 'gap-6 sm:gap-8 lg:gap-12' : 'gap-8 sm:gap-12 lg:gap-20'} justify-items-center lg:justify-items-start place-content-center`}>
            {/* Quick Links */}
            <div className="text-center lg:text-left w-full max-w-[280px] sm:max-w-full">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link href="/" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Home</Link></li>
                <li><Link href="/about" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">About</Link></li>
                <li><Link href="/testimonial" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Testimonial</Link></li>
                <li><Link href="/contact" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Contact</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="text-center lg:text-left w-full max-w-[280px] sm:max-w-full">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">Services</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link href="/services/individual" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Individual Therapy</Link></li>
                <li><Link href="/services/psychological" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Psychological Therapy</Link></li>
                <li><Link href="/services/group" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Group Therapy</Link></li>
                <li><Link href="/services/psychiatric" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Psychiatric Services</Link></li>
                <li><Link href="/services/online" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Online Therapy</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="text-center lg:text-left w-full max-w-[280px] sm:max-w-full">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link href="/blog" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Blog Posts</Link></li>
                <li><Link href="/faqs" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">FAQs</Link></li>
                <li><Link href="/guide" className="hover:underline font-normal text-xs sm:text-sm lg:text-base">Mental Health Guide</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="text-center lg:text-left w-full max-w-[280px] sm:max-w-full overflow-hidden">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li className="font-normal text-xs sm:text-sm lg:text-base break-words">Email: info@raisc.org</li>
                <li className="font-normal text-xs sm:text-sm lg:text-base break-words">Phone: +92 302 2222363</li>
                <li className="font-normal text-xs sm:text-sm lg:text-base break-words">Location: Islamabad, PK</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#0C1741] text-white mt-[1px] py-3 sm:py-[20px]">
        <div className={`mx-auto px-2 sm:px-4 ${hasSidebar ? 'max-w-6xl lg:ml-auto lg:mr-auto lg:pl-20' : 'max-w-7xl'}`}>
          <div className={`flex flex-col items-center gap-3 sm:gap-4 lg:gap-0 ${hasSidebar ? 'sm:flex-row sm:justify-center lg:justify-between' : 'sm:flex-row sm:justify-between'}`}>
            <div className={`flex flex-wrap justify-center lg:justify-start space-x-1 sm:space-x-2 lg:space-x-4 mb-2 sm:mb-3 md:mb-0 ${!hasSidebar ? 'lg:ml-8' : ''}`}>
              <Link href="/privacy" className="font-normal text-[10px] sm:text-xs lg:text-sm hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="font-normal text-[10px] sm:text-xs lg:text-sm hover:underline">Terms of Use</Link>
              <Link href="/cookies" className="font-normal text-[10px] sm:text-xs lg:text-sm hover:underline">Cookie Policy</Link>
            </div>
            <div className="text-[10px] sm:text-xs lg:text-sm font-normal text-white text-center mx-auto md:mx-0 order-last md:order-none">© 2025 RAISC. All rights reserved.</div>
            <div className={`flex flex-col sm:flex-row items-center mt-2 sm:mt-3 md:mt-0 gap-2 lg:gap-0 ${!hasSidebar ? 'lg:mr-8' : ''}`}>
              <span className="text-[10px] sm:text-xs lg:text-sm font-normal mr-0 lg:mr-2">Follow us:</span>
              <div className="flex space-x-2 lg:space-x-3 font-normal items-center">
                <Link href="#" aria-label="Facebook" className="font-normal hover:text-gray-300">
                  <FaFacebook size={14} className="sm:w-4 sm:h-4" />
                </Link>
                <Link href="#" aria-label="Twitter" className="font-normal hover:text-gray-300">
                  <FaTwitter size={14} className="sm:w-4 sm:h-4" />
                </Link>
                <Link href="#" aria-label="GitHub" className="font-normal hover:text-gray-300">
                  <FaGithub size={14} className="sm:w-4 sm:h-4" />
                </Link>
                <Link href="#" aria-label="Telegram" className="font-normal hover:text-gray-300">
                  <FaTelegram size={14} className="sm:w-4 sm:h-4" />
                </Link>
                <Link href="#" aria-label="Instagram" className="font-normal hover:text-gray-300">
                  <FaInstagram size={14} className="sm:w-4 sm:h-4" />
                </Link>
                <Link href="#" aria-label="Dribbble" className="font-normal hover:text-gray-300">
                  <FaDribbble size={14} className="sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Banner - positioned to overlap with footer */}
      <div className={`absolute left-0 right-0 top-0 transform -translate-y-1/2 px-1 sm:px-2 lg:px-4 ${hasSidebar ? 'lg:left-20' : ''}`}>
        <div className="bg-[#D7E2FE] rounded-[15px] sm:rounded-[25px] lg:rounded-[50px] mx-auto max-w-6xl px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 flex flex-col md:flex-row items-center justify-between shadow-md gap-2 sm:gap-3 lg:gap-0">
          <div className="flex items-center text-center md:text-left">
            <span className="text-[#1E3CA7] text-lg sm:text-xl lg:text-2xl mr-1 sm:mr-2">💙</span>
            <h3 className="text-[#1E3CA7] font-bold text-sm sm:text-lg lg:text-xl xl:text-2xl">RAISC — Your mental wellness companion</h3>
          </div>
          <div className="flex mt-2 md:mt-3 lg:mt-0 gap-1 sm:gap-2 lg:gap-3">
            <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 shadow-sm rounded-full hover:opacity-90 text-xs sm:text-sm lg:text-base">
              Get Started
            </button>
            <button className="bg-white text-[#1E3CA7] border border-[#1E3CA7] customShadow font-bold py-1.5 sm:py-2 px-3 sm:px-4 lg:px-6 rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LatestFooter;

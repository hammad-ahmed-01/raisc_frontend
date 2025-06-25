import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaGithub, FaTelegram, FaInstagram, FaDribbble } from 'react-icons/fa';

const LatestFooter: React.FC = () => {
  return (
    <footer className="w-full relative">
      {/* Main Footer with gradient background */}
      <div className="bg-gradient-to-b from-[#1E3CA7] to-[#0C1741] text-white pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 justify-center">
            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:underline font-normal">Home</Link></li>
                <li><Link href="/about" className="hover:underline font-normal">About</Link></li>
                <li><Link href="/testimonial" className="hover:underline font-normal">Testimonial</Link></li>
                <li><Link href="/contact" className="hover:underline font-normal">Contact</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xl font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link href="/services/individual" className="hover:underline font-normal">Individual Therapy</Link></li>
                <li><Link href="/services/psychological" className="hover:underline font-normal">Psychological Therapy</Link></li>
                <li><Link href="/services/group" className="hover:underline font-normal">Group Therapy</Link></li>
                <li><Link href="/services/psychiatric" className="hover:underline font-normal">Psychiatric Services</Link></li>
                <li><Link href="/services/online" className="hover:underline font-normal">Online Therapy</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xl font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="hover:underline font-normal">Blog Posts</Link></li>
                <li><Link href="/faqs" className="hover:underline font-normal">FAQs</Link></li>
                <li><Link href="/guide" className="hover:underline font-normal">Mental Health Guide</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="font-normal">Email: help@raisc.com</li>
                <li className="font-normal">Phone: +92-XXX-XXXXXX</li>
                <li className="font-normal">Location: Islamabad, PK</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#0C1741] text-white mt-[1px] py-[20px]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-3 md:mb-0">
              <Link href="/privacy" className="font-normal text-sm hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="font-normal text-sm hover:underline">Terms of Use</Link>
              <Link href="/cookies" className="font-normal text-sm hover:underline">Cookie Policy</Link>
            </div>
            <div className="text-sm font-normal text-white text-center mx-auto md:mx-0">© 2025 RAISC. All rights reserved.</div>
            <div className="flex items-center mt-3 md:mt-0">
              <span className="text-sm font-normal mr-2">Follow us:</span>
              <div className="flex space-x-3 font-normal items-center">
                <Link href="#" aria-label="Facebook" className="font-normal hover:text-gray-300">
                  <FaFacebook />
                </Link>
                <Link href="#" aria-label="Twitter" className="font-normal hover:text-gray-300">
                  <FaTwitter />
                </Link>
                <Link href="#" aria-label="GitHub" className="font-normal hover:text-gray-300">
                  <FaGithub />
                </Link>
                <Link href="#" aria-label="Telegram" className="font-normal hover:text-gray-300">
                  <FaTelegram />
                </Link>
                <Link href="#" aria-label="Instagram" className="font-normal hover:text-gray-300">
                  <FaInstagram />
                </Link>
                <Link href="#" aria-label="Dribbble" className="font-normal hover:text-gray-300">
                  <FaDribbble />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Banner - positioned to overlap with footer */}
      <div className="absolute left-0 right-0 top-0 transform -translate-y-1/2 px-4">
        <div className="bg-[#D7E2FE] rounded-[50px] mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center justify-between shadow-md">
          <div className="flex items-center">
            <span className="text-[#1E3CA7] text-2xl mr-2">💙</span>
            <h3 className="text-[#1E3CA7] font-bold text-xl md:text-2xl">RAISC — Your mental wellness companion</h3>
          </div>
          <div className="flex mt-3 md:mt-0 gap-3">
            <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90">
              Get Started
            </button>
            <button className="bg-white text-[#1E3CA7] border border-[#1E3CA7] customShadow font-bold py-2 px-6 rounded-full hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LatestFooter;

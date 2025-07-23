"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logoDark from "@/public/raisc-logo.png";
import logoWhite from "@/public/logo_white.svg"; 
import { useRouter } from "next/navigation";

const sections = ["home", "about", "services", "testimonials", "contact"];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Always update isScrolled for navbar style
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Only update activeSection on landing page
      const isLandingPage = window.location.pathname === "/" || window.location.pathname === "/LandingPage";
      if (isLandingPage) {
        let closestSection = "home";
        let minOffset = Number.POSITIVE_INFINITY;
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top >= -100 && rect.top < minOffset) {
              minOffset = rect.top;
              closestSection = id;
            }
          }
        }
        setActiveSection(closestSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set activeSection based on pathname if not on landing page
  useEffect(() => {
    const isLandingPage = window.location.pathname === "/" || window.location.pathname === "/LandingPage";
    if (!isLandingPage) {
      // Use the last part of the path as the section name if it matches
      const path = window.location.pathname.replace("/", "");
      if (sections.includes(path)) {
        setActiveSection(path);
      } else {
        setActiveSection(""); // No highlight if not a known section
      }
    }
  }, []);

  const scrollToSection = (id: string) => {
    const isLandingPage = window.location.pathname === "/" || window.location.pathname === "/LandingPage";
    if (isLandingPage) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to landing page, then scroll to section after navigation
      window.location.href = id === "home" ? "/" : `/#${id}`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#1E3CA7] shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div
          className={`flex items-center space-x-2 text-xl font-bold cursor-pointer ${
            isScrolled ? "text-white" : "text-heading"
          }`}
        >
          <Image
            src={isScrolled ? logoWhite : logoDark}
            alt="RAISC Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span>RAISC</span>
        </div>

        {/* Navigation Links and Login Button */}
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            {sections.map((section) => (
              <li
                key={section}
                className={`capitalize cursor-pointer relative transition-all duration-200 ${
                  activeSection === section
                    ? `font-semibold after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] ${
                        isScrolled
                          ? "text-white after:bg-white"
                          : "text-black after:bg-black"
                      }`
                    : `${
                        isScrolled ? "text-white" : "text-heading"
                      } opacity-80 hover:opacity-100`
                }`}
                onClick={() => scrollToSection(section)}
              >
                {section}
              </li>
            ))}
          </ul>
          {/* Login Button */}
          <div>
            <a
              href="/login"
              className={`px-6 py-2 shadow-sm rounded-full font-semibold transition
                ${
                  isScrolled
                    ? "bg-white text-[#1E3CA7] border-none hover:bg-blue-50"
                    : "bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white hover:opacity-90"
                }
              `}
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}


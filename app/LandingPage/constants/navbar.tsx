"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logoDark from "@/public/raisc-logo.png";
import logoWhite from "@/public/logo_white.svg"; 

const sections = ["home", "about", "services", "testimonials", "contact"];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let closestSection = "home";
      let minOffset = Number.POSITIVE_INFINITY;

      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

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
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
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

        {/* Navigation Links */}
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
      </div>
    </nav>
  );
}

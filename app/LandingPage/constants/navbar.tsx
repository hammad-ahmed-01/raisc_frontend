"use client";

import React, { useEffect, useState } from "react";

const sections = ["home", "about", "services", "testimonials", "contact"];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
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
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial trigger

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="bg-[#1E3CA7] text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold cursor-pointer">RAISC</div>
        <ul className="flex space-x-6">
          {sections.map((section) => (
            <li
              key={section}
              className={`capitalize cursor-pointer relative transition-all duration-200 ${
                activeSection === section
                  ? "font-semibold after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-white"
                  : "opacity-80 hover:opacity-100"
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

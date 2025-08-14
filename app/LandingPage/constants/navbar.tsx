"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logoDark from "@/public/raisc-logo.png";
import logoWhite from "@/public/logo_white.svg"; 
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/Buttons/PrimaryButton";

const sections = ["home", "about", "services", "testimonials", "contact"];

export default function   Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

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

  useEffect(() => {
    const isLandingPage = window.location.pathname === "/" || window.location.pathname === "/LandingPage";
    if (!isLandingPage) {
      const path = window.location.pathname.replace("/", "");
      if (sections.includes(path)) {
        setActiveSection(path);
      } else {
        setActiveSection("");
      }
    }
  }, []);

  useEffect(() => {
    // Check for session_key in localStorage
    if (typeof window !== "undefined") {
      const key = localStorage.getItem("session_key");
      setIsLoggedIn(!!key && key !== "null" && key !== "");
    }
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const isLandingPage = window.location.pathname === "/" || window.location.pathname === "/LandingPage";
    if (isLandingPage) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = id === "home" ? "/" : `/#${id}`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#1E3CA7] shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
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

        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-md focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-all ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center space-x-6">
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
          {/* Login/Logout Button */}
          <div>
            {isLoggedIn ? (
              <a
                href="/logout"
                className={`px-6 py-2 shadow-sm rounded-full font-semibold transition bg-red-50 text-red-600 border border-red-200 hover:bg-red-50`}
              >
                Logout
              </a>
            ) : (
              <PrimaryButton
                text="Login"
                onClick={() => router.push("/login")}
                className={`px-6 py-2 rounded-full font-semibold ${
                  isScrolled
                    ? "!bg-none !bg-white !text-[#1E3CA7] !border-none hover:!bg-blue-50 active:!bg-blue-100"
                    : ""
                }`}  />
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-40">
            <div className="absolute top-0 left-0 w-full bg-[#1E3CA7] shadow-md rounded-b-3xl pb-8">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center space-x-2 text-xl font-bold text-white">
                  <Image
                    src={logoWhite}
                    alt="RAISC Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <span>RAISC</span>
                </div>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#12225f] text-white text-2xl"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  ×
                </button>
              </div>
              <ul className="flex flex-col items-center mt-2 space-y-1">
                {sections.map((section) => (
                  <li
                    key={section}
                    className={`capitalize cursor-pointer w-full text-center py-3 text-base font-semibold rounded transition-all duration-200 ${
                      activeSection === section
                        ? "bg-[#12225f] text-white"
                        : "text-white hover:bg-[#243b7a] hover:text-white"
                    }`}
                    onClick={() => scrollToSection(section)}
                  >
                    {section}
                  </li>
                ))}
                <li className="w-full flex justify-center mt-4">
                  {isLoggedIn ? (
                    <a
                      href="/logout"
                      className="w-11/12 max-w-xs text-center px-6 py-3 rounded-full font-semibold bg-white text-red-600 shadow hover:bg-red-50 transition text-base"
                    >
                      Logout
                    </a>
                  ) : (
                    <a
                      href="/login"
                      className="w-11/12 max-w-xs text-center px-6 py-3 rounded-full font-semibold bg-white text-[#1E3CA7] shadow hover:bg-blue-50 transition text-base"
                    >
                      Login
                    </a>
                  )}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


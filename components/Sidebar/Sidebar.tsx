"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaRobot,
  FaUserMd,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHistory,
  FaQuoteRight,
  FaBook,
  FaUser,
  FaChartBar,
  FaCalendarAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const rawPathname = usePathname();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const pathname = rawPathname ?? "";

  let userType: "patient" | "doctor" | "organization" | "unknown" = "patient";
  let hasAssociatedPsychologist = false;

  if (typeof window !== "undefined") {
    const rawUserData = localStorage.getItem("user_data");
    if (rawUserData) {
      try {
        const parsed = JSON.parse(rawUserData);
        userType = parsed?.user_type ?? "patient";
        hasAssociatedPsychologist = Boolean(
          parsed?.patient_profile?.associated_psychologist
        );
      } catch {
        userType = "patient";
        hasAssociatedPsychologist = false;
      }
    }
  }

  interface MenuItem {
    id: number;
    title: string;
    icon: React.ReactNode;
    path: string | string[];
  }

  let menuItems: MenuItem[] = [];

  if (userType === "patient") {
    menuItems = [
      { id: 1, title: "Dashboard", icon: <FaHome size={20} />, path: "/dashboard" },
      //{ id: 2, title: "Session History", icon: <FaHistory size={20} />, path: "/history" },
      //{ id: 3, title: "Motivational Quotes", icon: <FaQuoteRight size={20} />, path: "/quotes" },
      { id: 4, title: "Chat with AI Bot", icon: <FaRobot size={20} />, path: "/chatbot" },
      // Doctors is always visible
      { id: 5, title: "Psychologists", icon: <FaUserMd size={20} />, path: "/Doctors" },
      // Associated Psychologist only if exists
      ...(hasAssociatedPsychologist
        ? [
            {
              id: 6,
              title: "Associated Doctor",
              icon: <FaUserMd size={20} />,
              path: "/AssociatedPsychologist",
            } as MenuItem,
          ]
        : []),
      //{ id: 7, title: "Resources", icon: <FaBook size={20} />, path: "/resources" },
      //{ id: 8, title: "Profile", icon: <FaUser size={20} />, path: "/profile" },
    ];
  } else if (userType === "doctor") {
    menuItems = [
      { id: 1, title: "Dashboard", icon: <FaHome size={20} />, path: "/dashboard" },
      //{ id: 2, title: "Calendar", icon: <FaHistory size={20} />, path: "/calendar" },
      { id: 3, title: "Patients", icon: <FaUserMd size={20} />, path: "/Patient" },
      //{ id: 4, title: "Messages", icon: <FaQuoteRight size={20} />, path: "/messages" },
      { id: 5, title: "Requests", icon: <FaBook size={20} />, path: "/requests" },
      //{ id: 6, title: "Profile", icon: <FaUser size={20} />, path: "/profile" },
      //{ id: 7, title: "Settings", icon: <FaRobot size={20} />, path: "/settings" },
    ];
  } else if (userType === "organization") {
    menuItems = [
      { id: 1, title: "Dashboard", icon: <FaHome size={20} />, path: "/dashboard" },
      { id: 2, title: "Doctors", icon: <FaUserMd size={20} />, path: "/Doctors" },
      { id: 3, title: "Calendar", icon: <FaCalendarAlt size={20} />, path: "/calendar" },
      { id: 4, title: "Pending Requests", icon: <FaHistory size={20} />, path: "/pending-requests" },
      { id: 5, title: "Analytics / Reports", icon: <FaChartBar size={20} />, path: "/analytics" },
    ];
  }

  return (
    <>
      {/* Mobile Menu Button (Hamburger only) */}
      {!isMobileMenuOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-[#2f51c7] to-[#071c69] text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 min-h-screen bg-gradient-to-r from-[#2f51c7] to-[#071c69] text-white transition-all duration-300 ease-in-out z-40 ${
          "lg:block lg:w-20 lg:hover:w-64 lg:rounded-r-[20px]"
        } ${isMobileMenuOpen ? "block w-64" : "hidden lg:block"}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Close button inside sidebar (top-right) */}
        {isMobileMenuOpen && (
          <button
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaTimes size={24} />
          </button>
        )}

        {/* Logo */}
        <Link
          href="/"
          aria-label="Go to landing page"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="h-20 flex items-center justify-start px-2 relative hover:bg-white/5 transition-colors">
            <div className="w-16 h-16 flex items-center justify-center rounded-full">
              <Image
                src="/logo_white.svg"
                alt="RAISC Logo"
                width={64}
                height={64}
                className="rounded-full"
                priority
              />
            </div>
            {(isExpanded || isMobileMenuOpen) && (
              <span className="absolute left-20 font-bold text-xl">RAISC</span>
            )}
          </div>
        </Link>

        {/* Navigation */}
        <nav className="mt-4">
          {menuItems.map((item) => {
            const isActive = Array.isArray(item.path)
              ? item.path.includes(pathname)
              : pathname === item.path;
            return (
              <Link
                href={Array.isArray(item.path) ? item.path[0] : item.path}
                key={item.id}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={`flex items-center h-14 px-6 cursor-pointer transition-colors ${
                    isActive ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-8 flex justify-center">{item.icon}</div>
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ml-4 ${
                      isExpanded || isMobileMenuOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-8 left-0 w-full">
          <Link href="/logout" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center h-14 px-6 cursor-pointer transition-colors hover:bg-white/5 text-white w-full">
              <div className="w-8 flex justify-center">
                <FaSignOutAlt size={20} />
              </div>
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ml-4 ${
                  isExpanded || isMobileMenuOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                Logout
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

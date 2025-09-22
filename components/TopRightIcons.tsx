"use client";

import { FiBell, FiSettings } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { getNotifications, NotificationType } from "@/app/notifications/notification";
import { useRouter } from "next/navigation";

export default function TopRightIcons() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const key = localStorage.getItem("session_key");
    const userData = localStorage.getItem("user_data");
    if (key && userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed && parsed.user_type) {
          const data = getNotifications(parsed.user_type);
          setNotifications(data);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, isNew: false } : n))
    );
  };

  return (
    <div className="absolute top-5 right-5 z-50">
      {/* icons inline */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Notifications */}
        <button
          className="relative text-2xl lg:text-3xl text-heading2 hover:opacity-80 transition"
          aria-label="Notifications"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiBell />
          {/*
          {notifications.filter((n) => n.isNew).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notifications.filter((n) => n.isNew).length}
            </span>
          )}
          */}
        </button>

        {/* Settings */}
        <button
          className="text-2xl lg:text-3xl text-heading2 hover:opacity-80 transition"
          aria-label="Settings"
          onClick={() => router.push("/settings")}
        >
          <FiSettings />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute mt-2 right-0 w-96 bg-white rounded-xl shadow z-50"
        >
          <div className="px-4 py-3 text-lg font-bold text-heading2 border-b border-blue-100 rounded-t-xl">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  onClick={() => markAsRead(i)}
                  className={`px-4 py-3 border-b border-blue-100 hover:bg-blue-50 cursor-pointer ${
                    n.isNew ? "bg-[#D0E3FFC7]" : "bg-white"
                  }`}
                >
                  <div className="text-heading2 font-semibold">{n.title}</div>
                  <div className="text-sm text-normal">{n.description}</div>
                  <div className="text-xs text-right text-gray-600">{n.time}</div>
                </div>
              ))
            )}
          </div>
          <button
            className="w-full text-center py-3 text-heading2 hover:bg-blue-50 border-t border-blue-100 rounded-b-xl text-sm font-medium"
            onClick={() => router.push("/notifications")}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
}

// NotificationPage.tsx

"use client";

import { useEffect, useState } from "react";
import { getNotifications, NotificationType } from "./notification";
import { Search } from "lucide-react";

type FilterType = "all" | "new" | "read";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const key = localStorage.getItem("session_key");
    const userData = localStorage.getItem("user_data");

    if (key && userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed && parsed.user_type) {
          const data = getNotifications(parsed.user_type);
          if (isBackendConnected) {
            // Replace this with actual backend fetch logic
            setNotifications(data);
          } else {
            setNotifications(data);
          }
        }
      } catch {}
    }
  }, []);

  const markAsRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, isNew: false } : n))
    );
  };

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === "new") return n.isNew;
      if (filter === "read") return !n.isNew;
      return true;
    })
    .filter((n) =>
      `${n.title} ${n.description}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="pt-12 px-8 min-h-screen bg-blue-100">
      <h1 className="text-left text-[40px] leading-[100%] tracking-[0%] font-[700] font-quicksand text-[#1E3CA7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-6">
        Notifications
      </h1>

      <div className="bg-white rounded-xl shadow border border-[#2196F3] h-[calc(100vh-160px)] flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="text-heading2 font-semibold rounded-md px-3 py-2 text-lg"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="read">Read</option>
            </select>

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <Search
                size={18}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition ${
                  searchActive ? "text-heading2" : ""
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n, i) => (
              <div
                key={i}
                onClick={() => markAsRead(i)}
                className={`px-6 py-4 border-b border-blue-100 cursor-pointer ${
                  n.isNew ? "bg-[#D0E3FFC7]" : "bg-white"
                }`}
              >
                <div className="text-heading2 font-semibold">{n.title}</div>
                <div className="text-sm text-normal">{n.description}</div>
                <div className="text-xs text-right text-gray-600">{n.time}</div>
              </div>
            ))
          ) : (
            <div className="px-6 py-6 text-center text-gray-500 text-sm">
              No notifications found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

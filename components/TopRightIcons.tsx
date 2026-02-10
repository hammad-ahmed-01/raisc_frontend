"use client";

import { FiBell, FiSettings } from "react-icons/fi";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  NotificationType,
  mapNotificationForDisplay,
} from "@/app/notifications/notification";

// Polling interval in milliseconds (30 seconds)
const POLLING_INTERVAL = 30000;

// Max notifications to show in dropdown
const DROPDOWN_LIMIT = 5;

export default function TopRightIcons() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  /**
   * Fetch unread count (lightweight, for polling)
   */
  const fetchUnreadCount = useCallback(async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  }, []);

  /**
   * Fetch full notifications list
   */
  const fetchNotificationsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications({ limit: DROPDOWN_LIMIT });
      setNotifications(data);
      
      // Also update unread count based on fetched data
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("session_key");
    if (!token) return;

    // Fetch initial data
    fetchNotificationsList();

    // Start polling for unread count
    pollingRef.current = setInterval(() => {
      // Only poll if tab is visible
      if (!document.hidden) {
        fetchUnreadCount();
      }
    }, POLLING_INTERVAL);

    // Handle visibility change - poll immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotificationsList, fetchUnreadCount]);

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Fetch fresh notifications when dropdown opens
   */
  useEffect(() => {
    if (showDropdown) {
      fetchNotificationsList();
    }
  }, [showDropdown, fetchNotificationsList]);

  /**
   * Mark a notification as read
   */
  const handleMarkAsRead = async (notification: NotificationType) => {
    if (notification.is_read) return;

    const success = await markAsRead(notification.id);
    if (success) {
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification: NotificationType) => {
    // Mark as read
    handleMarkAsRead(notification);

    // Navigate based on notification type (can be expanded)
    // For now, just close dropdown
    setShowDropdown(false);

    // Optional: navigate to relevant page based on notification type
    // switch (notification.notification_type) {
    //   case 'reschedule_request':
    //     router.push('/doctor/pending-requests');
    //     break;
    //   case 'session_created':
    //     router.push('/sessions');
    //     break;
    //   default:
    //     break;
    // }
  };

  return (
    <div className="absolute top-5 right-5 z-50">
      {/* Icons inline */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Notifications */}
        <button
          className="relative text-2xl lg:text-3xl text-heading2 hover:opacity-80 transition"
          aria-label="Notifications"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiBell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
          className="absolute mt-2 right-0 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
        >
          <div className="px-4 py-3 text-lg font-bold text-heading2 border-b border-blue-100 rounded-t-xl flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-normal text-gray-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <div className="animate-pulse">Loading...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                const display = mapNotificationForDisplay(notification);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-blue-100 hover:bg-blue-50 cursor-pointer transition ${
                      display.isNew ? "bg-[#D0E3FFC7]" : "bg-white"
                    }`}
                  >
                    <div className="text-heading2 font-semibold">
                      {display.title}
                    </div>
                    <div className="text-sm text-normal line-clamp-2">
                      {display.description}
                    </div>
                    <div className="text-xs text-right text-gray-600 mt-1">
                      {display.time}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            className="w-full text-center py-3 text-heading2 hover:bg-blue-50 border-t border-blue-100 rounded-b-xl text-sm font-medium transition"
            onClick={() => {
              setShowDropdown(false);
              router.push("/notifications");
            }}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
}
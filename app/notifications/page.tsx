// app/notifications/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Trash2, Check, CheckCheck } from "lucide-react";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NotificationType,
} from "./notification";

type FilterType = "all" | "new" | "read";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Mark single notification as read
   */
  const handleMarkAsRead = async (notification: NotificationType) => {
    if (notification.is_read) return;

    setActionLoading(notification.id);
    const success = await markAsRead(notification.id);
    
    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
    setActionLoading(null);
  };

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = async () => {
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    if (unreadCount === 0) return;

    setActionLoading(-1); // -1 indicates "all"
    const success = await markAllAsRead();
    
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    }
    setActionLoading(null);
  };

  /**
   * Delete a notification
   */
  const handleDelete = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent marking as read
    
    setActionLoading(notificationId);
    const success = await deleteNotification(notificationId);
    
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
    setActionLoading(null);
  };

  /**
   * Filter notifications based on filter and search
   */
  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === "new") return !n.is_read;
      if (filter === "read") return n.is_read;
      return true;
    })
    .filter((n) =>
      `${n.title} ${n.message}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="pt-12 px-8 min-h-screen bg-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-left text-[40px] leading-[100%] tracking-[0%] font-[700] font-quicksand text-[#1E3CA7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          Notifications
        </h1>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === -1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-heading2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {actionLoading === -1 ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow border border-[#2196F3] h-[calc(100vh-160px)] flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="text-heading2 font-semibold rounded-md px-3 py-2 text-lg border border-gray-300"
            >
              <option value="all">All ({notifications.length})</option>
              <option value="new">Unread ({unreadCount})</option>
              <option value="read">Read ({notifications.length - unreadCount})</option>
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
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-pulse text-gray-500">Loading notifications...</div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={`px-6 py-4 border-b border-blue-100 cursor-pointer transition group ${
                  !notification.is_read ? "bg-[#D0E3FFC7]" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-heading2 font-semibold">
                        {notification.title}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <div className="text-sm text-normal mt-1">
                      {notification.message}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification);
                        }}
                        disabled={actionLoading === notification.id}
                        className="p-1 text-gray-400 hover:text-green-600 transition opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      disabled={actionLoading === notification.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-right text-gray-600 mt-2">
                  {notification.time_ago}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              {searchTerm
                ? "No notifications match your search."
                : filter === "new"
                ? "No unread notifications."
                : filter === "read"
                ? "No read notifications."
                : "No notifications yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// app/notifications/notification.ts

/**
 * Notification types and API functions
 */

export interface NotificationType {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
  sender_name?: string | null;
  related_calendar?: number | null;
  metadata?: Record<string, any>;
}

// Legacy type alias for backwards compatibility
export type { NotificationType as Notification };

// Helper to check if notification is "new" (unread)
export function isNewNotification(notification: NotificationType): boolean {
  return !notification.is_read;
}

// Map backend notification to display format (for backwards compatibility)
export function mapNotificationForDisplay(notification: NotificationType): {
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  id: number;
  notification_type: string;
} {
  return {
    id: notification.id,
    notification_type: notification.notification_type,
    title: notification.title,
    description: notification.message,
    time: notification.time_ago,
    isNew: !notification.is_read,
  };
}

/**
 * Get auth header from localStorage
 */
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  
  const token = localStorage.getItem("session_key") || "";
  if (!token) return {};
  
  return { Authorization: `Token ${token}` };
}

/**
 * Fetch notifications from API
 */
export async function fetchNotifications(options?: {
  limit?: number;
  isRead?: boolean;
}): Promise<NotificationType[]> {
  try {
    const params = new URLSearchParams();
    
    if (options?.limit) {
      params.append("limit", options.limit.toString());
    }
    if (options?.isRead !== undefined) {
      params.append("is_read", options.isRead.toString());
    }
    
    const queryString = params.toString();
    const url = `/api/notifications${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });
    
    if (!response.ok) {
      console.error("Failed to fetch notifications:", response.status);
      return [];
    }
    
    const data = await response.json();
    
    // Handle both array response and paginated response
    if (Array.isArray(data)) {
      return data;
    } else if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await fetch("/api/notifications/unread-count", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    return data?.unread_count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications/read/${notificationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

/**
 * Legacy function for backwards compatibility
 * Returns hardcoded notifications when backend is not connected
 * 
 * @deprecated Use fetchNotifications() instead
 */
export function getNotifications(userType: string): {
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}[] {
  // This is kept for backwards compatibility
  // Will return empty array - real data should come from fetchNotifications()
  console.warn("getNotifications() is deprecated. Use fetchNotifications() instead.");
  return [];
}
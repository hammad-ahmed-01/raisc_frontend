// lib/reschedule-requests.ts

/**
 * Types and API functions for reschedule requests
 */

export interface RescheduleRequest {
  id: number;
  calendar_session: number;
  session_title: string;
  requested_by: number;
  patient_name: string;
  doctor_name: string;
  current_date: string;
  current_time: string | null;
  current_date_display: string;
  proposed_date: string;
  proposed_time: string;
  proposed_date_display: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  response_note: string;
  created_at: string;
  responded_at: string | null;
}

export interface CreateRescheduleRequest {
  calendar_session: number;
  proposed_date: string;  // YYYY-MM-DD
  proposed_time: string;  // HH:MM
  reason?: string;
}

export interface RespondToRescheduleRequest {
  action: 'approve' | 'reject';
  response_note?: string;
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
 * Fetch all reschedule requests for the current user
 */
export async function fetchRescheduleRequests(): Promise<RescheduleRequest[]> {
  try {
    const response = await fetch("/api/reschedule-requests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch reschedule requests:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data?.results || [];
  } catch (error) {
    console.error("Error fetching reschedule requests:", error);
    return [];
  }
}

/**
 * Fetch pending reschedule requests (for doctors)
 */
export async function fetchPendingRescheduleRequests(): Promise<RescheduleRequest[]> {
  try {
    const response = await fetch("/api/reschedule-requests/pending", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch pending requests:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data?.results || [];
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
}

/**
 * Create a new reschedule request (for patients)
 */
export async function createRescheduleRequest(
  data: CreateRescheduleRequest
): Promise<{ success: boolean; data?: RescheduleRequest; error?: string }> {
  try {
    const response = await fetch("/api/reschedule-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result?.error || result?.detail || "Failed to create request",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating reschedule request:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Respond to a reschedule request (for doctors)
 */
export async function respondToRescheduleRequest(
  requestId: number,
  response: RespondToRescheduleRequest
): Promise<{ success: boolean; data?: RescheduleRequest; error?: string }> {
  try {
    const res = await fetch(`/api/reschedule-requests/${requestId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(response),
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result?.error || result?.detail || "Failed to respond",
      };
    }

    return { success: true, data: result?.reschedule_request };
  } catch (error) {
    console.error("Error responding to request:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Cancel a reschedule request (for patients)
 */
export async function cancelRescheduleRequest(
  requestId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/reschedule-requests/${requestId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: false,
        error: result?.error || result?.detail || "Failed to cancel",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error cancelling request:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Get a single reschedule request
 */
export async function getRescheduleRequest(
  requestId: number
): Promise<RescheduleRequest | null> {
  try {
    const response = await fetch(`/api/reschedule-requests/${requestId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching request:", error);
    return null;
  }
}
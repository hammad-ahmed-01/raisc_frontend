// app/api/reschedule-requests/pending/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

function getAuthHeader(request: NextRequest): Record<string, string> {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader) {
    return { Authorization: authHeader };
  }
  return {};
}

/**
 * GET /api/reschedule-requests/pending
 * Get all pending reschedule requests for the authenticated doctor
 */
export async function GET(request: NextRequest) {
  try {
    if (!DJANGO_BASE) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    const authHeaders = getAuthHeader(request);
    if (!authHeaders.Authorization) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${DJANGO_BASE}/users/doctor/reschedule-requests/pending/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to fetch pending requests" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Pending reschedule requests API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// app/api/notifications/mark-all-read/route.ts
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
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
export async function POST(request: NextRequest) {
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

    const response = await fetch(`${DJANGO_BASE}/api/notifications/mark-all-read/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to mark all as read" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mark all read API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
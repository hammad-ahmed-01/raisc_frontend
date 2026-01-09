// app/api/notifications/unread-count/route.ts
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
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for badge display
 * 
 * This endpoint is designed for frequent polling (every 30 seconds)
 */
export async function GET(request: NextRequest) {
  try {
    if (!DJANGO_BASE) {
      return NextResponse.json({ unread_count: 0 }, { status: 200 });
    }

    const authHeaders = getAuthHeader(request);
    if (!authHeaders.Authorization) {
      return NextResponse.json({ unread_count: 0 }, { status: 200 });
    }

    const response = await fetch(`${DJANGO_BASE}/api/notifications/unread-count/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Return 0 instead of error for badge display
      return NextResponse.json({ unread_count: 0 }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unread count API error:", error);
    // Return 0 instead of error for badge display
    return NextResponse.json({ unread_count: 0 }, { status: 200 });
  }
}
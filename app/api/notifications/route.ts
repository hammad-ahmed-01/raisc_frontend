// app/api/notifications/route.ts
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
 * GET /api/notifications
 * List notifications for the authenticated user
 * 
 * Query params:
 * - is_read: "true" | "false" - filter by read status
 * - limit: number - limit results
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

    // Forward query params
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${DJANGO_BASE}/api/notifications/${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
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
        { error: data?.detail || data?.error || "Failed to fetch notifications" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
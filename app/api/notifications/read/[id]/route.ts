// app/api/notifications/[id]/read/route.ts
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
 * PATCH /api/notifications/[id]/read
 * Mark a single notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const response = await fetch(`${DJANGO_BASE}/api/notifications/${id}/read/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to mark as read" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mark as read API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
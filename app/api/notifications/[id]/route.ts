// app/api/notifications/[id]/route.ts
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
 * GET /api/notifications/[id]
 * Get a single notification
 */
export async function GET(
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

    const response = await fetch(`${DJANGO_BASE}/api/notifications/${id}/`, {
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
        { error: data?.detail || data?.error || "Failed to fetch notification" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get notification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
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

    const response = await fetch(`${DJANGO_BASE}/api/notifications/${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to delete notification" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Delete notification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// app/api/organization/profile/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organization_id");

  if (!organizationId) {
    return NextResponse.json(
      { error: "organization_id parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${BASE}/organization/profile/?organization_id=${organizationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: "Failed to fetch organization profile" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Organization profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
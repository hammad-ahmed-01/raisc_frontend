// app/api/organization/organization_details/route.ts
import { NextRequest, NextResponse } from "next/server";

const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "") || "";

function getAuthHeader(req: NextRequest): string | null {
  const raw = req.headers.get("authorization") || "";
  const val = raw.trim();
  if (!val) return null;
  return /^token\s+/i.test(val) ? val : `Token ${val}`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ detail: "Missing Authorization header" }, { status: 401 });
    }

    const upstream = await fetch(`${DJANGO_BASE}/organization/organization_details`, {
      method: "GET",
      headers: { Authorization: auth },
      cache: "no-store",
    });

    const body = await upstream.text();
    return new NextResponse(body || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET organization_details error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthHeader(req);
    if (!auth) {
      return NextResponse.json({ detail: "Missing Authorization header" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let upstream;

    if (contentType.includes("multipart/form-data")) {
      // Forward multipart/form-data exactly (critical for file upload!)
      upstream = await fetch(`${DJANGO_BASE}/organization/organization_details`, {
        method: "PUT",
        headers: {
          Authorization: auth,
          // IMPORTANT: Do NOT set Content-Type manually — fetch will set it with boundary
        },
        body: req.body,           // ← Forward raw stream
        duplex: "half",           // ← Required in Node 18+ for streaming
      });
    } else {
      // JSON payload
      const payload = await req.text();
      upstream = await fetch(`${DJANGO_BASE}/organization/organization_details`, {
        method: "PUT",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: payload,
      });
    }

    const bodyText = await upstream.text();

    let responseData;
    try {
      responseData = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      responseData = { message: bodyText || "Success" };
    }

    return new NextResponse(JSON.stringify(responseData), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PUT organization_details error:", err);
    return NextResponse.json(
      { detail: "Internal server error", error: (err as Error).message },
      { status: 500 }
    );
  }
}
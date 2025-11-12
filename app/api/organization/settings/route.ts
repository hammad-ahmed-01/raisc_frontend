import { NextRequest, NextResponse } from "next/server";

const DJANGO_BASE =
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "") || "";

// Forward the auth token from the client → Next API route → Django
function buildAuthHeader(req: NextRequest): HeadersInit {
  // Prefer Authorization header the client passes to this route
  const auth =
    req.headers.get("authorization") ||
    req.cookies.get("token")?.value ||
    req.cookies.get("session_key")?.value ||
    "";
  if (!auth) return {};
  return { Authorization: auth.startsWith("Token") ? auth : `Token ${auth}` };
}

async function passThrough(
  req: NextRequest,
  method: "GET" | "PUT" | "DELETE",
  body?: any
) {
  if (!DJANGO_BASE) {
    return NextResponse.json(
      { error: "Backend base URL not configured" },
      { status: 500 }
    );
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...buildAuthHeader(req),
  };

  const upstream = await fetch(`${DJANGO_BASE}/organization/organization_details`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await upstream.text();
  // Try parsing JSON if present
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: data || "Request to backend failed" },
      { status: upstream.status }
    );
  }

  // 204 from Django should return empty body
  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(data ?? {}, { status: upstream.status || 200 });
}

export async function GET(req: NextRequest) {
  return passThrough(req, "GET");
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return passThrough(req, "PUT", body);
}

export async function DELETE(req: NextRequest) {
  return passThrough(req, "DELETE");
}

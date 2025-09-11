// app/api/doctors/update-summary/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const rawBase =
      process.env.NEXT_PUBLIC_DJANGO_BASE_URL ||
      process.env.DJANGO_BASE_URL ||
      "";
    const base = rawBase.replace(/\/+$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "Missing Django base URL (NEXT_PUBLIC_DJANGO_BASE_URL)" },
        { status: 500 }
      );
    }

    // Auth: header first, then cookie fallback
    let auth = req.headers.get("authorization") || "";
    if (!auth) {
      const sessionKey = req.cookies.get("session_key")?.value;
      if (sessionKey) auth = `Token ${sessionKey}`;
    }
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.text(); // forward raw body

    // Proxy to Django
    const upstream = await fetch(
      `${base}/users/doctor/update-summary/${encodeURIComponent(params.sessionId)}/`,
      {
        method: "PATCH",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body,
      }
    );

    const text = await upstream.text();
    try {
      const json = text ? JSON.parse(text) : {};
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      // Upstream didn’t return JSON; return as-is
      return new NextResponse(text || "", {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

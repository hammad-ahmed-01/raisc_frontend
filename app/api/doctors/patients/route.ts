// app/api/doctors/patients/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: NextRequest) {
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

    const upstream = await fetch(`${base}/users/doctor/patients/`, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    });

    const text = await upstream.text();
    try {
      const json = text ? JSON.parse(text) : {};
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      return new NextResponse(text || "", {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// app/api/doctor/patients/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

const RAW_BASE =
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL ||
  process.env.DJANGO_BASE_URL ||
  "";
const BASE = RAW_BASE.replace(/\/+$/, "");

export async function GET(req: NextRequest) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { error: "Missing Django base URL (NEXT_PUBLIC_DJANGO_BASE_URL)" },
        { status: 500 }
      );
    }

    // Prefer Authorization header; fallback to cookie session_key
    let auth = req.headers.get("authorization") || "";
    if (!auth) {
      const sessionKey = req.cookies.get("session_key")?.value;
      if (sessionKey) auth = `Token ${sessionKey}`;
    }
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BASE}/users/doctor/patients/`, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

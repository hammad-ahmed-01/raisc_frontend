// app/api/doctors/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function toDateOnly(s: string): string {
  // Accepts "YYYY-MM-DD" or any ISO string and returns "YYYY-MM-DD"
  if (!s) return s;
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  try {
    const d = new Date(s);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  } catch {
    return s;
  }
}

export async function POST(req: NextRequest) {
  try {
   const base = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");
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

    // Read incoming JSON
    const incoming = await req.json().catch(() => ({} as any));
    const patient_id = incoming?.patient_id;
    const title = (incoming?.title ?? "").toString();
    const description = (incoming?.description ?? "").toString();
    const dateIn = (incoming?.date ?? "").toString();

    // Ensure date-only for Django DateField safety
    const date = toDateOnly(dateIn);

    // Pass through; description may include [time=HH:mm] and [session_type=...] tags
    const payload = { patient_id, title, description, date };

    const upstream = await fetch(`${base}/users/doctor/create-session/`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

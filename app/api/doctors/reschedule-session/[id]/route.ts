// app/api/doctors/reschedule-session/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// We will POST to "create-session" because backend has no update endpoint.
const CREATE_PATH = "/users/doctor/create-session/";

function toDateOnly(s: string): string {
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Authorization from header or cookie
    let auth = req.headers.get("authorization") || "";
    if (!auth) {
      const sessionKey = req.cookies.get("session_key")?.value;
      if (sessionKey) auth = `Token ${sessionKey}`;
    }
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Expect: { patient_id, title, description, date }
    // Client adds [rescheduled_from=<oldId>] in description before sending.
    const incoming = await req.json().catch(() => ({} as any));
    const patient_id = (incoming?.patient_id ?? "").toString();
    const title = (incoming?.title ?? "").toString();
    const description = (incoming?.description ?? "").toString();
    const date = toDateOnly((incoming?.date ?? "").toString());

    if (!patient_id || !title || !date) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const upstream = await fetch(`${base}${CREATE_PATH}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patient_id, title, description, date }),
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

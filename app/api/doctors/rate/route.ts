// app/api/doctors/rate/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

const json = (data: unknown, status = 200) =>
  new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const ensureAuthHeader = (req: Request): string | null => {
  const raw = req.headers.get("authorization") || "";
  const val = raw.trim();
  if (!val) return null;
  return /^token\s+/i.test(val) ? val : `Token ${val}`;
};

export async function POST(req: Request) {
  try {
    if (!isBackendConnected) {
      return json({ doctor_id: 0, average: 4.6, count: 125, demo: true }, 200);
    }
    if (!BASE) return json({ detail: "Backend URL not configured" }, 500);

    const token = ensureAuthHeader(req);
    if (!token) return json({ detail: "Missing Authorization header" }, 401);

    const body = await req.json().catch(() => ({}));
    const doctorId = Number(body?.doctor_id);
    const rating = Number(body?.rating ?? body?.stars); // accept both
    const comment = typeof body?.comment === "string" ? body.comment : "";

    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      return json({ detail: "doctor_id is required" }, 400);
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return json({ detail: "rating must be between 1 and 5" }, 400);
    }

    const url = `${BASE}/users/doctor/rate/${doctorId}/`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/doctors/rate error:", err);
    return json({ detail: "Internal server error" }, 500);
  }
}

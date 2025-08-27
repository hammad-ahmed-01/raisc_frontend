// app/api/doctors/list/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

type Doctor = {
  id: number;
  username: string;
  name: string;
  profile_image: string;
  specialization: string;
  location: string;
  experience: string | number;
  rating: number;
  expertise: string[];
  education: string;
};

const safeStr = (v: unknown) => (v == null ? "" : String(v));
const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

// Normalize Django doctor model into frontend shape
function normalizeDoctor(raw: any): Doctor {
  const p = raw?.professional_information || {};
  return {
    id: raw?.id ?? raw?.user?.id ?? Math.floor(Math.random() * 1_000_000),
    username: safeStr(raw?.user?.username),
    name: safeStr(raw?.user?.username ?? "Doctor"),
    profile_image: safeStr(p?.profile_image ?? "/doctor_image.jpg"),
    specialization: safeStr(p?.specialization ?? ""),
    location: safeStr(p?.location ?? ""),
    experience: safeStr(p?.experience ?? ""),
    rating: Number(p?.rating ?? 0),
    expertise: toArray(p?.expertise),
    education: safeStr(p?.education ?? ""),
  };
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { detail: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
    if (!base) {
      return NextResponse.json(
        { detail: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Call Django endpoint /users/doctor/list/
    const url = `${base.replace(/\/+$/, "")}/users/doctor/list/`;
    const res = await fetch(url, {
      headers: { Authorization: token, "Content-Type": "application/json" },
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { detail: `Upstream error ${res.status}`, body: text },
        { status: res.status }
      );
    }

    let data: any = [];
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }

    const doctors = Array.isArray(data) ? data.map(normalizeDoctor) : [];

    return NextResponse.json(doctors, { status: 200 });
  } catch (err) {
    console.error("GET /api/doctors/list error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

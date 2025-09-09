// app/api/doctors/list/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

type Doctor = {
  id: number;            // Doctor model id
  user_id: number;       // <-- NEW: underlying auth User.id to match patient association
  username: string;
  name: string;
  profile_image: string;
  specialization: string;
  location: string;
  experience: string | number;
  rating: number;
  expertise: string[];
  education: string;
  description?: string;
  rates?: string;
};

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  const s = safeStr(v);
  if (!s) return [];
  return s.split(/[,\|]/g).map((x) => x.trim()).filter(Boolean);
}

function normalizeDoctor(raw: any): Doctor {
  const p = raw?.professional_information || {};
  const username = safeStr(raw?.user?.username);
  const displayName = safeStr(p?.display_name) || username || "Doctor";

  return {
    id: Number(raw?.id ?? 0),
    user_id: Number(raw?.user?.id ?? 0),            // <-- include it
    username,
    name: displayName,
    profile_image: safeStr(p?.profile_image) || "/doc.png",
    specialization: safeStr(p?.specialization),
    location: safeStr(p?.location),
    experience: p?.experience ?? "",
    rating: Number(p?.rating ?? 0),
    expertise: toArray(p?.expertise),
    education: safeStr(p?.education),
    description: safeStr(p?.description) || safeStr((p as any)?.bio) || undefined,
    rates: safeStr(raw?.rates),
  };
}

export async function GET(req: Request) {
  try {
    // Demo fallback (also includes user_id so matching still works)
    if (!isBackendConnected) {
      const demo: Doctor[] = [
        {
          id: 12,
          user_id: 1012,
          username: "drali",
          name: "Dr. Ali Hamza",
          profile_image: "/doc.png",
          specialization: "Cognitive Therapy",
          location: "Lahore",
          experience: "10 yrs",
          rating: 4.7,
          expertise: ["CBT", "Anxiety"],
          education: "MSc Clinical Psych",
          description: "Passionate about CBT and anxiety management.",
          rates: "480.00",
        },
        {
          id: 16,
          user_id: 1016,
          username: "draisha",
          name: "Dr. Aisha Mahmood",
          profile_image: "/doc.png",
          specialization: "Family Therapy",
          location: "Islamabad",
          experience: "8 yrs",
          rating: 4.5,
          expertise: ["Family Counseling", "Relationship Issues"],
          education: "MSc Family Psychology",
          description: "Helping families build healthier relationships.",
          rates: "480.00",
        },
      ];
      return NextResponse.json(demo, { status: 200 });
    }

    if (!BASE) {
      return NextResponse.json({ detail: "Backend URL not configured" }, { status: 500 });
    }

    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ detail: "Missing Authorization header" }, { status: 401 });
    }

    // upstream (Token auth)
    const url = `${BASE}/users/doctor/list/`;
    const upstream = await fetch(url, {
      method: "GET",
      headers: { Authorization: token, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const rawText = await upstream.text();

    if (!upstream.ok) {
      return NextResponse.json(
        { detail: `Upstream error ${upstream.status}`, body: rawText },
        { status: upstream.status },
      );
    }

    let parsed: any = [];
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = [];
    }

    const doctors = Array.isArray(parsed) ? parsed.map(normalizeDoctor) : [];
    return NextResponse.json(doctors, { status: 200 });
  } catch (err) {
    console.error("GET /api/doctors/list error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

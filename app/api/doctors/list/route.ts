import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

type Doctor = {
  id: number;
  user_id: number;
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
  phone?: string;
  affiliated_organization?: string;
  availability?: string;
  website?: string;
};

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE =
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "") ||
  process.env.DJANGO_BASE_URL?.replace(/\/+$/, "") ||
  "";

function flipScheme(auth: string) {
  const s = auth.toLowerCase();
  if (s.startsWith("bearer ")) return "Token " + auth.slice(7);
  if (s.startsWith("token ")) return "Bearer " + auth.slice(6);
  if (s.startsWith("jwt ")) return "Bearer " + auth.slice(4);
  return auth;
}

function extractAuth(req: Request | NextRequest): string | null {
  const direct = req.headers.get("authorization");
  if (direct && direct.trim()) return direct;

  const mirror = req.headers.get("x-authorization");
  if (mirror && mirror.trim()) return mirror;

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMap = new Map<string, string>();
  cookieHeader.split(";").forEach((p) => {
    const [k, ...rest] = p.split("=");
    if (!k) return;
    cookieMap.set(k.trim(), decodeURIComponent((rest.join("=") || "").trim()));
  });

  for (const k of ["session_key", "access_token", "token", "authToken", "jwt", "id_token"]) {
    const v = cookieMap.get(k);
    if (v) return `${v.includes(".") ? "Bearer" : "Token"} ${v}`;
  }
  return null;
}

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  const s = safeStr(v);
  if (!s) return [];
  return s.split(/[,\|]/g).map((x) => x.trim()).filter(Boolean);
}

function normalizeDoctor(raw: any): Doctor {
  const p = raw?.professional_information || {};
  const username = safeStr(raw?.user?.username || raw?.username);
  const displayName = safeStr(p?.display_name) || safeStr(raw?.name) || username || "Doctor";

  const affiliatedOrg =
    safeStr(p?.affiliated_organization) ||
    safeStr(p?.affiliation) ||
    safeStr(p?.organization) ||
    safeStr(p?.hospital);

  const phone =
    safeStr(p?.phone) ||
    safeStr(p?.phone_number) ||
    safeStr(p?.contact) ||
    safeStr(p?.contact_number);

  const website = safeStr(p?.website) || safeStr(p?.site) || "";
  const availability =
    safeStr(p?.availability) || safeStr(p?.available_slots) || safeStr(p?.schedule) || "";

  return {
    id: Number(raw?.id ?? raw?.pk ?? 0),
    user_id: Number(raw?.user?.id ?? raw?.user_id ?? 0),
    username,
    name: displayName,
    profile_image: safeStr(p?.profile_image) || safeStr(raw?.profile_image) || "/doc.png",
    specialization: safeStr(p?.specialization || raw?.specialization),
    location: safeStr(p?.location || raw?.location),
    experience: p?.experience ?? raw?.experience ?? "",
    rating: Number(p?.rating ?? raw?.rating ?? 0),
    expertise: toArray(p?.expertise),
    education: safeStr(p?.education || raw?.education),
    description: safeStr(p?.description || (p as any)?.bio || raw?.description) || undefined,
    rates: safeStr(raw?.rates),
    phone,
    affiliated_organization: affiliatedOrg,
    availability,
    website,
  };
}

export async function GET(req: Request) {
  try {
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
          phone: "",
          affiliated_organization: "Pakistan Institute of Mental Health (PIMH)",
          availability: "",
          website: "",
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
          phone: "+92 300 1234567",
          affiliated_organization: "Shifa International Hospital",
          availability: "",
          website: "",
        },
      ];
      return NextResponse.json(demo, { status: 200 });
    }

    if (!BASE) {
      return NextResponse.json({ detail: "Backend URL not configured" }, { status: 500 });
    }

    const auth = extractAuth(req);
    if (!auth) return NextResponse.json({ detail: "Missing Authorization" }, { status: 401 });

    const url = `${BASE}/users/doctor/list/`;
    let upstream = await fetch(url, {
      method: "GET",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (upstream.status === 401) {
      upstream = await fetch(url, {
        method: "GET",
        headers: { Authorization: flipScheme(auth), "Content-Type": "application/json" },
        cache: "no-store",
      });
    }

    const rawText = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        { detail: `Upstream error ${upstream.status}`, body: rawText },
        { status: upstream.status }
      );
    }

    let parsed: any = [];
    try { parsed = JSON.parse(rawText); } catch { parsed = []; }

    const doctors = Array.isArray(parsed) ? parsed.map(normalizeDoctor) : [];
    return NextResponse.json(doctors, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/doctors/list error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// app/api/calendar/sessions/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DjangoCalendarItem = {
  id: number;
  title: string;
  details?: string | null;
  description?: string | null;
  date: string; // ISO or YYYY-MM-DD
  patient?: { user?: { username?: string } } | null;
};

const TZ = "Asia/Karachi";
const TIME_TAG_RE = /\[time\s*=\s*([0-2]\d:[0-5]\d)\]/i;

function formatLocalParts(isoOrDate: string) {
  const dt = new Date(isoOrDate);

  const y = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric" }).format(dt);
  const m = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, month: "2-digit" }).format(dt);
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, day: "2-digit" }).format(dt);
  const date = `${y}-${m}-${d}`;

  const hh = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(dt);
  const mm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, minute: "2-digit" }).format(dt);
  const time = `${hh}:${mm}`;

  return { date, time };
}

function inferType(s: DjangoCalendarItem): "video" | "audio" | "in-person" {
  const hay = `${s.title || ""} ${s.details || ""} ${s.description || ""}`.toLowerCase();
  if (hay.includes("in-person") || hay.includes("in person") || hay.includes("clinic")) return "in-person";
  if (hay.includes("audio") || hay.includes("phone")) return "audio";
  if (hay.includes("video") || hay.includes("zoom") || hay.includes("meet")) return "video";
  return "video";
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const rawBase =
      process.env.NEXT_PUBLIC_DJANGO_BASE_URL ||
      process.env.DJANGO_BASE_URL ||
      "";
    const base = rawBase.replace(/\/+$/, "");
    if (!base) {
      return NextResponse.json({ error: "Missing Django base URL" }, { status: 500 });
    }

    const upstream = await fetch(`${base}/users/doctor/sessions/`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: text || "Failed to fetch sessions" }, { status: upstream.status });
    }

    let raw: DjangoCalendarItem[] = [];
    try { raw = JSON.parse(text); } catch {}

    const shaped = raw.map((s) => {
      const { date, time } = formatLocalParts(s.date);

      // If description carries a time tag, prefer that
      let outTime = time;
      const tag = (s.description || "").match(TIME_TAG_RE);
      if (tag?.[1]) outTime = tag[1]; // "HH:mm"

      return {
        id: String(s.id),
        patient_name: s.patient?.user?.username || "Patient",
        date,
        time: outTime,
        type: inferType(s),
      };
    });

    return NextResponse.json(shaped, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

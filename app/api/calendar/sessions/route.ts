// app/api/calendar/sessions/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DjangoCalendarItem = {
  id: number;
  title: string;
  details?: string | null;
  description?: string | null;
  date: string; // backend Calendar.date (date or datetime)
  doctor_summary?: string | null;
  patient?: {
    user?: {
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    level?: number;
    associated_psychologist?: number | null;
    profile_data?: Record<string, any>;
  } | null;
};

const TZ = "Asia/Karachi";

function formatLocalParts(isoOrDateOnly: string) {
  const dt = new Date(isoOrDateOnly);

  // Local YYYY-MM-DD
  const y = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric" }).format(dt);
  const m = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, month: "2-digit" }).format(dt);
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, day: "2-digit" }).format(dt);
  const date = `${y}-${m}-${d}`;

  // Local HH:mm (24h)
  const hh = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(dt);
  const mm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, minute: "2-digit" }).format(dt);
  const time = `${hh}:${mm}`;

  return { date, time };
}

function pickDisplayName(p?: DjangoCalendarItem["patient"]) {
  const pd = p?.profile_data ?? {};
  const u = p?.user ?? {};
  const display = (pd?.display_name && String(pd.display_name).trim())
    || ([u.first_name, u.last_name].filter(Boolean).join(" ").trim())
    || String(u.username || "Patient");
  return display;
}

function inferTransportType(haystack: string): "video" | "audio" | "in-person" {
  const h = haystack.toLowerCase();
  if (h.includes("in-person") || h.includes("in person") || h.includes("clinic")) return "in-person";
  if (h.includes("audio") || h.includes("phone")) return "audio";
  if (h.includes("video") || h.includes("zoom") || h.includes("meet")) return "video";
  return "video";
}

function parseTag(desc: string, key: string): string | null {
  const rx = new RegExp(`\\[${key}=([^\\]]+)\\]`, "i");
  const m = desc.match(rx);
  return m ? m[1].trim() : null;
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const base = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");
    if (!base) {
      return NextResponse.json({ error: "Missing Django base URL" }, { status: 500 });
    }

    const res = await fetch(`${base}/users/doctor/sessions/`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || "Failed to fetch sessions" }, { status: res.status });
    }

    const raw: DjangoCalendarItem[] = await res.json();

    const shaped = raw.map((s) => {
      const desc = s.description || "";
      const maybeTime = parseTag(desc, "time");           // e.g. [time=14:00]
      const maybeType = parseTag(desc, "session_type");   // e.g. [session_type=Follow-up]

      // If you created with date-only + [time=HH:mm] tag, prefer that
      const baseParts = formatLocalParts(s.date);
      const time = maybeTime && /^\d{2}:\d{2}$/.test(maybeTime) ? maybeTime : baseParts.time;

      const displayName = pickDisplayName(s.patient);
      const transport = inferTransportType(`${s.details || ""} ${desc}`);

      return {
        id: String(s.id),
        // we keep the property name as patient_name but feed display name
        patient_name: displayName,
        date: baseParts.date,                 // YYYY-MM-DD
        time,                                 // HH:mm
        type: transport,                      // "video" | "audio" | "in-person"
        session_type: maybeType || null,      // "Follow-up" | "Initial" | "Emergency" if present
        title: s.title || "",
        doctor_summary: s.doctor_summary || "",
      };
    });

    return NextResponse.json(shaped, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

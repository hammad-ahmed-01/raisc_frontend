// app/api/calendar/sessions/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DjangoCalendarItem = {
  id: number;
  title: string;
  details?: string | null;
  description?: string | null;
  date: string; // ISO or YYYY-MM-DD from backend
  patient?: {
    user?: {
      id?: number;
      username?: string;
    };
  } | null;
};

const TZ = "Asia/Karachi";

function formatLocalParts(iso: string) {
  const dt = new Date(iso);
  const y = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric" }).format(dt);
  const m = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, month: "2-digit" }).format(dt);
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, day: "2-digit" }).format(dt);
  const date = `${y}-${m}-${d}`;

  const hh = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(dt);
  const mm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, minute: "2-digit" }).format(dt);
  const time = `${hh}:${mm}`;

  return { date, time };
}

function inferTransportType(s: DjangoCalendarItem): "video" | "audio" | "in-person" {
  const hay = `${s.details || ""} ${s.description || ""}`.toLowerCase();
  if (hay.includes("in-person") || hay.includes("in person") || hay.includes("clinic")) return "in-person";
  if (hay.includes("audio") || hay.includes("phone")) return "audio";
  if (hay.includes("video") || hay.includes("zoom") || hay.includes("meet")) return "video";
  return "video";
}

// Parse [key=value] tags from description
function parseTags(desc: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!desc) return out;
  const re = /\[(\w+)\s*=\s*([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(desc)) !== null) out[m[1]] = m[2];
  return out;
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL!;
    const res = await fetch(`${base}/users/doctor/sessions/`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || "Failed to fetch sessions" }, { status: res.status });
    }

    const raw: DjangoCalendarItem[] = await res.json();

    // First pass: shape and collect reschedule links
    const shaped = raw.map((s) => {
      const { date } = formatLocalParts(s.date);
      const tags = parseTags(s.description);
      const timeTag = (tags["time"] || "").trim();                 // "HH:mm"
      const sessionTypeTag = (tags["session_type"] || "").trim();   // "Follow-up" | "Initial" | "Emergency"
      const reschedFrom = (tags["rescheduled_from"] || "").trim();  // original id if present

      const time = /^\d{2}:\d{2}$/.test(timeTag) ? timeTag : "09:00";

      return {
        id: String(s.id),
        patient_name: s.patient?.user?.username || "Patient",
        patient_user_id: s.patient?.user?.id ? String(s.patient.user.id) : null, // ✅ expose for rescheduler
        date,
        time,
        type: inferTransportType(s),
        session_type: sessionTypeTag || null,
        rescheduled_from: reschedFrom || null,
        title: s.title || null,
      };
    });

    // Second pass: hide any session that has been superseded
    const supersededIds = new Set(shaped.filter(x => x.rescheduled_from).map(x => x.rescheduled_from as string));
    const filtered = shaped.filter(x => !supersededIds.has(x.id));

    return NextResponse.json(filtered, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

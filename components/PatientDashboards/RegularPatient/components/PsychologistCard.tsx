"use client";

// components/PsychologistCard.tsx
import { UserCircle2, Dot, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@/app/dashboard/page";
import Image from "next/image";

interface PsychologistData {
  name: string;
  role: string;
  isAvailable: boolean;
  imageUrl: string;
  upcomingSession: string;
}

interface BackendDoctor {
  id: number | string;
  user: { id: number; username: string; email: string; user_type: string };
  professional_information?: Record<string, any>;
  chatgroup_nickname?: string | null;
  rates?: string | number | null;
}

interface BackendLatestSession {
  id: number | string;
  title: string;
  date: string;                // ISO datetime
  description?: string | null;
  display_datetime?: string | null; // e.g. "May 24, 2025 – 4:00 PM"
  session_number?: number | null;
  feedback?: string | null;
}

interface PsychologistCardProps {
  user?: User;
}

function getAuthHeaderFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const candidates = [
    localStorage.getItem("Authorization"),
    localStorage.getItem("authorization"),
    localStorage.getItem("session_key"),
    localStorage.getItem("auth_token"),
    localStorage.getItem("access_token"),
    localStorage.getItem("token"),
  ].filter(Boolean) as string[];

  const raw = candidates.find(Boolean);
  if (!raw) return {};
  const val = /^token\s+/i.test(raw) || /^bearer\s+/i.test(raw) ? raw : `Token ${raw}`;
  return { Authorization: val, "x-raisc-auth": val };
}

function formatPrettyDate(d?: string | null) {
  if (!d) return "";
  // if backend already sent a pretty string, keep it
  if (/–|\bam\b|\bpm\b|AM|PM/.test(d)) return d;
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function PsychologistCard({ user }: PsychologistCardProps) {
  const [psychologist, setPsychologist] = useState<PsychologistData>({
    name: user?.patient_profile?.associated_psychologist_name || "Your Psychologist",
    role: "Clinical Psychologist",
    isAvailable: true,
    imageUrl: "/doctor.jpg",
    upcomingSession: "—",
  });

  useEffect(() => {
    const run = async () => {
      try {
        const headers = getAuthHeaderFromStorage();

        // 1) Current psychologist (works for patient: associated doc; for doctor: self)
        const resDoc = await fetch("/api/psychologist/current", {
          credentials: "include",
          cache: "no-store",
          headers,
        });
        if (resDoc.ok) {
          const data: BackendDoctor = await resDoc.json();
          const pi = data.professional_information || {};

          const displayName =
            pi.display_name ||
            [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim() ||
            data.user?.username ||
            psychologist.name;

          setPsychologist((prev) => ({
            ...prev,
            name: displayName,
            role: pi.specialization || prev.role,
            imageUrl: pi.profile_image || pi.avatar_url || prev.imageUrl,
          }));
        }

        // 2) Latest session (patient → by patient, doctor → by doctor)
        const resLatest = await fetch("/api/sessions/latest", {
          credentials: "include",
          cache: "no-store",
          headers,
        });
        if (resLatest.ok) {
          const s: BackendLatestSession = await resLatest.json();
          const when = s.display_datetime?.trim() || formatPrettyDate(s.date);
          const titled = s.title ? `${s.title} — ${when}` : when;

          setPsychologist((prev) => ({
            ...prev,
            upcomingSession: titled || prev.upcomingSession,
          }));
        }
      } catch (e) {
        console.error("Failed to load psychologist/upcoming session:", e);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-sm p-6 bg-gradient-to-br border-2 border-[#bfaaff] from-purple-100 to-blue-50 rounded-3xl shadow-md">
      <h2 className="text-2xl font-bold text-heading mb-3">Psychologist Connection</h2>

      <div className="flex items-center gap-4">
        {psychologist.imageUrl ? (
          <a
            href="/AssociatedPsychologist"
            className="rounded-full overflow-hidden w-16 h-16 border-2 border-blue-200 flex-shrink-0 bg-blue-50"
            title="View profile"
          >
            <Image
              src={psychologist.imageUrl}
              alt={psychologist.name}
              className="w-16 h-16 rounded-full object-cover"
              width={64}
              height={64}
            />
          </a>
        ) : (
          <a
            href="/AssociatedPsychologist"
            className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-200"
            title="View profile"
          >
            <UserCircle2 size={36} className="text-gray-600" />
          </a>
        )}

        <div>
          <p className="font-bold text-lg">{psychologist.name}</p>
          <p className="text-sm">{psychologist.role}</p>
          <p
            className={`${
              psychologist.isAvailable ? "text-green-600" : "text-red-600"
            } text-sm flex items-center gap-1`}
          >
            <Dot className={psychologist.isAvailable ? "text-green-600" : "text-red-600"} />
            {psychologist.isAvailable ? "Available Now" : "Not Available"}
          </p>
          <a href="/AssociatedPsychologist" className="text-blue-600 underline text-sm">
            view more
          </a>
        </div>
      </div>

      <button className="mt-4 w-full bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition">
        Send Message
      </button>

      <div className="mt-6">
        <p className="font-semibold flex items-center text-center gap-2">
          <Calendar size={18} /> Upcoming session
        </p>
        <p className="text-sm text-left ml-7">{psychologist.upcomingSession}</p>

        {/* Reschedule intentionally untouched per your request */}
        <button
          className="mt-3 w-full bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition"
          disabled
          title="Reschedule not implemented in this card (per request)."
        >
          Reschedule
        </button>
      </div>
    </div>
  );
}

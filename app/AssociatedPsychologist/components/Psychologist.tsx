// app/AssociatedPsychologist/components/Psychologist.tsx
"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getToken, fetchMe } from "@/lib/auth";

/* ----------------------------- types ----------------------------- */

interface PsychologistData {
  name: string;
  role: string;
  affiliation: string;
  image: string;
  about: string;
  qualifications: string[];
  languages: string[];
  experience: string;
  rating: number;
  reviews: number;
}

type Doctor = {
  id: number;          // Doctor model id
  user_id: number;     // Underlying User.id (from /api/doctors/list)
  username?: string;
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

/* ----------------------------- utils ----------------------------- */

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  const s = safeStr(v);
  if (!s) return [];
  return s
    .split(/[,\|]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeDoctor(raw: any): Doctor {
  const p = raw?.professional_information || raw?.professionalInformation || {};
  const username = safeStr(raw?.user?.username || raw?.username);
  const displayName =
    safeStr(p?.display_name || p?.displayName) ||
    safeStr(raw?.name) ||
    username ||
    "Doctor";

  const description =
    safeStr(p?.description) ||
    safeStr((p as any)?.bio) ||
    safeStr(raw?.description) ||
    safeStr(raw?.bio);

  return {
    id: Number(raw?.id ?? raw?.pk ?? 0),
    user_id: Number(raw?.user_id ?? raw?.user?.id ?? 0),  // <-- we rely on list route exposing user_id
    username,
    name: displayName,
    profile_image: safeStr(p?.profile_image || raw?.profile_image) || "/doctor.jpg",
    specialization: safeStr(p?.specialization || raw?.specialization),
    location: safeStr(p?.location || raw?.location),
    experience: p?.experience ?? raw?.experience ?? "",
    rating: Number(p?.rating ?? raw?.rating ?? 0),
    expertise: toArray(p?.expertise ?? raw?.expertise),
    education: safeStr(p?.education || raw?.education),
    description,
    rates: safeStr(raw?.rates),
  };
}

/* ----------------------------- UI rating stars ----------------------------- */

const StarBar = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex gap-1 py-2 justify-center">
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const active = value >= idx;
        return (
          <button
            key={idx}
            type="button"
            aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
            onClick={() => !disabled && onChange(idx)}
            className="p-1"
            disabled={disabled}
          >
            <Star
              className="w-7 h-7 transition-transform"
              fill={active ? "#FFD700" : "none"}
              stroke={active ? "#FFD700" : "#000000"}
            />
          </button>
        );
      })}
    </div>
  );
};

/* ----------------------------- component ----------------------------- */

export default function Psychologist() {
  const [psychologist, setPsychologist] = useState<PsychologistData>({
    name: "—",
    role: "Psychologist",
    affiliation: "—",
    image: "/doctor.jpg",
    about: "Once your request is accepted, your psychologist will appear here.",
    qualifications: [],
    languages: ["English", "Urdu"],
    experience: "",
    rating: 0,
    reviews: 0,
  });

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const pollStopAt = useRef<number>(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const toUI = (d: Doctor): PsychologistData => ({
    name: d.name || d.username || "Doctor",
    role: d.specialization || "Psychologist",
    affiliation: d.location || "—",
    image: d.profile_image || "/doctor.jpg",
    about:
      d.description ||
      (d.expertise?.length
        ? `Specializes in ${d.specialization} with expertise in ${d.expertise.join(", ")}.`
        : `Specializes in ${d.specialization}.`),
    qualifications: d.education ? [d.education] : [],
    languages: ["English", "Urdu"],
    experience: safeStr(d.experience) || "",
    rating: Number.isFinite(d.rating) ? d.rating : 0,
    reviews: Math.max(0, Math.floor((Number(d.rating) || 0) * 20)),
  });

  const pickDoctor = (docs: Doctor[], assocId: number | null, assocName: string) => {
    if (assocId != null) {
      const byUserId = docs.find((d) => Number(d.user_id) === Number(assocId));
      if (byUserId) return byUserId;
      const byDoctorId = docs.find((d) => Number(d.id) === Number(assocId));
      if (byDoctorId) return byDoctorId;
    }
    if (assocName) {
      const lower = assocName.toLowerCase();
      return (
        docs.find((d) => d.name.toLowerCase() === lower) ||
        docs.find((d) => safeStr(d.username).toLowerCase() === lower) ||
        null
      );
    }
    return null;
  };

  const loadAssociatedDoctor = useCallback(async () => {
    try {
      // 1) Always fetch the canonical, fresh user profile from backend
      const me: any = await fetchMe().catch(() => null);
      const assocRaw =
        me?.patient_profile?.associated_psychologist ??
        me?.patient_profile?.associated_psychologist_id ??
        null;
      const assocName = safeStr(me?.patient_profile?.associated_psychologist_name);

      const assocId = assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

      // 2) Load doctor directory via Next proxy
      const token = getToken();
      const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
      const res = await fetch("/api/doctors/list", { headers, cache: "no-store" });
      const raw = await res.json().catch(() => []);
      const doctors: Doctor[] = Array.isArray(raw) ? raw.map(normalizeDoctor) : [];

      // 3) Pick the associated doctor (by user_id first)
      const chosen = pickDoctor(doctors, assocId, assocName);

      if (chosen) {
        setSelectedDoctor(chosen);
        setPsychologist(toUI(chosen));
        // Stop any active polling once we resolve a doctor
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
        return true;
      }

      // not found yet
      return false;
    } catch (e) {
      console.error("Failed to resolve associated psychologist:", e);
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAssociatedDoctor();
  }, [loadAssociatedDoctor]);

  // Refresh when tab regains focus or becomes visible (common case right after approval)
  useEffect(() => {
    const onFocus = () => loadAssociatedDoctor();
    const onVis = () => {
      if (document.visibilityState === "visible") loadAssociatedDoctor();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loadAssociatedDoctor]);

  // Short, gentle polling (max ~2 minutes) to auto-update right after an approval
  useEffect(() => {
    // Only start if we don't have a doctor yet
    if (selectedDoctor) return;
    if (pollTimer.current) return;
    pollStopAt.current = Date.now() + 2 * 60 * 1000; // stop in 2 minutes
    pollTimer.current = setInterval(async () => {
      const ok = await loadAssociatedDoctor();
      if (ok || Date.now() > pollStopAt.current) {
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
      }
    }, 10_000); // check every 10s
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [selectedDoctor, loadAssociatedDoctor]);

  /* ----------------------------- submit rating ----------------------------- */

  const submitRating = async () => {
    if (!selectedDoctor || selectedRating < 1 || selectedRating > 5) return;

    const token = getToken();
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch("/api/doctors/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id, // Doctor.id
          rating: selectedRating,
          comment: "",
        }),
      });

      const payloadText = await resp.text();
      let data: any = {};
      try {
        data = JSON.parse(payloadText);
      } catch {}

      if (!resp.ok) {
        console.error("Rating failed:", resp.status, payloadText);
        return;
      }

      const newAvg = Number(data?.average ?? psychologist.rating);
      const newCount = Number(data?.count ?? psychologist.reviews);

      setPsychologist((prev) => ({
        ...prev,
        rating: Number.isFinite(newAvg) ? newAvg : prev.rating,
        reviews: Number.isFinite(newCount) ? newCount : prev.reviews,
      }));

      setSelectedRating(0);
    } catch (e) {
      console.error("Rating request error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-4 mt-6 sm:mt-10">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-lg p-3 sm:p-6 gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Image
            src={psychologist.image}
            alt={psychologist.name}
            width={80}
            height={80}
            className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-2 border-blue-300 object-cover"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-sm sm:text-lg font-bold text-heading">
              {psychologist.name}
            </h2>
            <p className="text-heading2 text-xs sm:text-base">{psychologist.role}</p>
            <p className="text-xs sm:text-sm text-heading2">
              <span className="text-red-500">📍</span> Location: <strong>{psychologist.affiliation}</strong>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="text-xs sm:text-sm">{psychologist.rating} Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="bg-[#FFF8ECDB] p-3 sm:p-4 rounded-xl">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2 text-sm sm:text-base">
              👤 About Me
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.about}</p>

            <h3 className="font-semibold text-heading mt-3 mb-1 flex items-center gap-2 text-sm sm:text-base">
              🎓 Qualification
            </h3>
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.qualifications.length
                ? psychologist.qualifications.map((qual, i) => (
                    <span key={i}>
                      {qual}
                      {i < psychologist.qualifications.length - 1 && <br />}
                    </span>
                  ))
                : "—"}
            </p>
          </div>

          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2 text-sm sm:text-base">
              💬 Languages Spoken
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.languages.join(", ")}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2 text-sm sm:text-base">
              🧳 Experience
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.experience || "—"}</p>
          </div>

          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-2xl border border-[#D7E2FE] shadow-sm">
            <h3 className="font-semibold text-heading2 text-sm sm:text-lg mb-2 flex items-center gap-2">
              ⭐ Rating / Reviews
            </h3>
            <p className="text-heading2 mb-2 sm:mb-3 flex items-center gap-1 text-xs sm:text-sm">
              <span>⭐</span> {psychologist.rating} rating
            </p>
            <button
              className="w-full bg-[#E9F5FE] text-heading2 font-medium py-1.5 sm:py-2 rounded-full hover:bg-blue-100 transition text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={submitRating}
              disabled={submitting || selectedRating === 0 || !selectedDoctor}
            >
              {submitting ? "Submitting..." : "Submit your rating"}
            </button>
            <StarBar
              value={selectedRating}
              onChange={setSelectedRating}
              disabled={submitting || !selectedDoctor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

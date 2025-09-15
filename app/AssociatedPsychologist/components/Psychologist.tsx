// app/AssociatedPsychologist/components/Psychologist.tsx
"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  id: number;             // Doctor model id
  user_id?: number;       // Underlying User.id (if exposed)
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

/** Try multiple common keys for images coming from various backends */
function pickImage(src: any): string {
  const p = src?.professional_information || src?.professionalInformation || src || {};
  return (
    safeStr(p.avatar_url) ||
    safeStr(p.profile_image_url) ||
    safeStr(p.profileImageUrl) ||
    safeStr(p.profile_image) ||
    safeStr(src.profile_image) ||
    "/doctor.jpg"
  );
}

/** Single place to turn any backend doctor shape into our UI Doctor */
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

  const user_id =
    raw?.user_id != null
      ? Number(raw.user_id)
      : raw?.user?.id != null
      ? Number(raw.user.id)
      : undefined;

  return {
    id: Number(raw?.id ?? raw?.pk ?? 0),
    user_id,
    username,
    name: displayName,
    profile_image: pickImage(raw),
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

function toUI(d: Doctor): PsychologistData {
  return {
    name: d.name || d.username || "Doctor",
    role: d.specialization || "Psychologist",
    affiliation: d.location || "—",
    image: d.profile_image || "/doctor.jpg",
    about:
      d.description ||
      (d.expertise?.length
        ? `Specializes in ${d.specialization} with expertise in ${d.expertise.join(", ")}.`
        : d.specialization
        ? `Specializes in ${d.specialization}.`
        : "—"),
    qualifications: d.education ? [d.education] : [],
    languages: ["English", "Urdu"],
    experience: safeStr(d.experience) || "",
    rating: Number.isFinite(d.rating) ? d.rating : 0,
    reviews: Math.max(0, Math.floor((Number(d.rating) || 0) * 20)),
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
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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

  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const pollStopAt = useRef<number>(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /** #1 LocalStorage handoff from DoctorsPage (fast path) */
  const tryLocalSelectedDoctor = (): Doctor | null => {
    try {
      const raw = localStorage.getItem("selectedDoctor");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return normalizeDoctor(parsed);
    } catch {
      return null;
    }
  };

  /** #2 Dedicated endpoint for the associated/current psychologist */
  const tryApiCurrent = async (token: string | null): Promise<Doctor | null> => {
    try {
      const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
      const res = await fetch("/api/psychologist/current", {
        headers,
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      const doc = normalizeDoctor(data);
      return doc.id || doc.user_id ? doc : null;
    } catch {
      return null;
    }
  };

  /** #3 Doctor list + match using patient_profile.associated_psychologist(_id/_name) */
  const tryDirectoryMatch = async (token: string | null): Promise<Doctor | null> => {
    try {
      const me: any = await fetchMe().catch(() => null);
      const assocRaw =
        me?.patient_profile?.associated_psychologist ??
        me?.patient_profile?.associated_psychologist_id ??
        null;
      const assocName = safeStr(me?.patient_profile?.associated_psychologist_name);
      const assocId =
        assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

      const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
      const res = await fetch("/api/doctors/list", { headers, cache: "no-store" });
      const list = (await res.json().catch(() => [])) as any[];
      const docs = Array.isArray(list) ? list.map(normalizeDoctor) : [];

      // Match by user_id or id, else by name/username
      if (assocId != null) {
        const byUID = docs.find((d) => Number(d.user_id) === Number(assocId));
        if (byUID) return byUID;
        const byDoc = docs.find((d) => Number(d.id) === Number(assocId));
        if (byDoc) return byDoc;
      }
      if (assocName) {
        const lower = assocName.toLowerCase();
        const byName =
          docs.find((d) => safeStr(d.name).toLowerCase() === lower) ||
          docs.find((d) => safeStr(d.username).toLowerCase() === lower) ||
          null;
        if (byName) return byName;
      }

      return null;
    } catch {
      return null;
    }
  };

  /** Resolve + set doctor in the best possible way */
  const resolveDoctor = useCallback(async () => {
    const token = getToken();

    // 1) localStorage handoff
    const fromLocal = tryLocalSelectedDoctor();
    if (fromLocal) {
      setSelectedDoctor(fromLocal);
      setPsychologist(toUI(fromLocal));
      return true;
    }

    // 2) dedicated endpoint
    const fromCurrent = await tryApiCurrent(token);
    if (fromCurrent) {
      setSelectedDoctor(fromCurrent);
      setPsychologist(toUI(fromCurrent));
      return true;
    }

    // 3) directory match
    const fromDirectory = await tryDirectoryMatch(token);
    if (fromDirectory) {
      setSelectedDoctor(fromDirectory);
      setPsychologist(toUI(fromDirectory));
      return true;
    }

    return false;
  }, []);

  // Initial load
  useEffect(() => {
    resolveDoctor();
  }, [resolveDoctor]);

  // Refresh when tab regains focus or becomes visible (approval just happened)
  useEffect(() => {
    const onFocus = () => resolveDoctor();
    const onVis = () => {
      if (document.visibilityState === "visible") resolveDoctor();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [resolveDoctor]);

  // Gentle polling for ~2 minutes until an associated doctor appears
  useEffect(() => {
    if (selectedDoctor) return;
    if (pollTimer.current) return;
    pollStopAt.current = Date.now() + 2 * 60 * 1000;
    pollTimer.current = setInterval(async () => {
      const ok = await resolveDoctor();
      if (ok || Date.now() > pollStopAt.current) {
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
      }
    }, 10_000);
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [selectedDoctor, resolveDoctor]);

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

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="flex flex-col gap-2 sm:gap-4 mt-6 sm:mt-10">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-lg p-3 sm:p-6 gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Image
            src={psychologist.image || "/doctor.jpg"}
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
              <span className="text-red-500">📍</span> Location:{" "}
              <strong>{psychologist.affiliation}</strong>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="text-xs sm:text-sm">
                {Number(psychologist.rating || 0).toFixed(1)} Rating
              </span>
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
            <p className="text-xs sm:text-sm text-heading2">{psychologist.about || "—"}</p>

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
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.languages.join(", ")}
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2 text-sm sm:text-base">
              🧳 Experience
            </h3>
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.experience || "—"}
            </p>
          </div>

          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-2xl border border-[#D7E2FE] shadow-sm">
            <h3 className="font-semibold text-heading2 text-sm sm:text-lg mb-2 flex items-center gap-2">
              ⭐ Rating / Reviews
            </h3>
            <p className="text-heading2 mb-2 sm:mb-3 flex items-center gap-1 text-xs sm:text-sm">
              <span>⭐</span> {Number(psychologist.rating || 0).toFixed(1)} rating
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

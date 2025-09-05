"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getToken } from "@/lib/auth";

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
  rating: number;   // live average after submit
  reviews: number;  // count
}

type RequestStatus = "none" | "pending" | "accepted";

type Doctor = {
  id: number;
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
    username,
    name: displayName,
    profile_image: safeStr(p?.profile_image || raw?.profile_image) || "/doc.png",
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

/* ----------------------------- single interactive stars ----------------------------- */

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
    name: "Dr. Yusuf Haroon",
    role: "Clinical Psychologist",
    affiliation: "Pakistan Institute of Mental Health (PIMH)",
    image: "/doctor.jpg",
    about: "Passionate about helping individuals manage anxiety and emotional challenges.",
    qualifications: ["MSc in Clinical Psychology", "Certified CBT Therapist"],
    languages: ["English", "Urdu"],
    experience:
      "2+ years of experience in trauma, cognitive behavioural therapy, family therapy, anxiety.",
    rating: 4.6,
    reviews: 124,
  });

  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

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
    reviews: Math.max(1, Math.floor((Number(d.rating) || 0) * 20)),
  });

  useEffect(() => {
    const resolveAssociatedDoctorId = (): number | null => {
      const userData = localStorage.getItem("user_data");
      if (!userData) return null;
      try {
        const parsed = JSON.parse(userData);
        const idStr =
          parsed?.patient_profile?.associated_psychologist ??
          parsed?.patient_profile?.associated_psychologist_id ??
          null;
        if (idStr == null) return null;
        const n = Number(idStr);
        return Number.isFinite(n) ? n : null;
      } catch {
        return null;
      }
    };

    const tryLocalSelected = (): Doctor | null => {
      const selectedDoctorData = localStorage.getItem("selectedDoctor");
      if (!selectedDoctorData) return null;
      try {
        return normalizeDoctor(JSON.parse(selectedDoctorData));
      } catch {
        return null;
      }
    };

    const pickDoctorById = (arr: Doctor[], id: number): Doctor | null =>
      arr.find((d) => Number(d.id) === Number(id)) || null;

    const mapAndSet = (doc: Doctor) => {
      setSelectedDoctor(doc);
      setPsychologist(toUI(doc));
      const rawSelected = localStorage.getItem("selectedDoctor");
      if (rawSelected) {
        try {
          const parsed = JSON.parse(rawSelected);
          setRequestStatus((parsed?.requestStatus as RequestStatus) ?? "none");
        } catch {
          setRequestStatus("none");
        }
      }
    };

    const go = async () => {
      const localSel = tryLocalSelected();
      if (localSel) {
        mapAndSet(localSel);
        return;
      }

      const assocId = resolveAssociatedDoctorId();

      try {
        const token = getToken();
        const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
        const res = await fetch("/api/doctors/list", { headers, cache: "no-store" });
        const data: Doctor[] = await res.json().catch(() => []);
        let chosen: Doctor | null = null;
        if (assocId != null) chosen = pickDoctorById(data, assocId);
        if (!chosen && data?.length) chosen = data[0];
        if (chosen) {
          mapAndSet(chosen);
          return;
        }
      } catch (e) {
        console.error("Failed to load doctor list:", e);
      }
    };

    go();
  }, []);

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
          doctor_id: selectedDoctor.id, // Doctor.id (not user id)
          rating: selectedRating,       // our Next route maps this → stars for Django
          comment: "",
        }),
      });

      const payloadText = await resp.text();
      const data = (() => {
        try {
          return JSON.parse(payloadText);
        } catch {
          return {};
        }
      })();

      if (!resp.ok) {
        console.error("Rating failed:", resp.status, payloadText);
        return;
      }

      // backend returns { doctor_id, average, count }
      const newAvg = Number(data?.average ?? psychologist.rating);
      const newCount = Number(data?.count ?? psychologist.reviews);

      setPsychologist((prev) => ({
        ...prev,
        rating: Number.isFinite(newAvg) ? newAvg : prev.rating,
        reviews: Number.isFinite(newCount) ? newCount : prev.reviews,
      }));

      if (selectedDoctor) {
        const updatedDoc = { ...selectedDoctor, rating: newAvg };
        setSelectedDoctor(updatedDoc);
        try {
          const raw = localStorage.getItem("selectedDoctor");
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.rating = newAvg;
            localStorage.setItem("selectedDoctor", JSON.stringify(parsed));
          }
        } catch {}
      }

      setSelectedRating(0);
    } catch (e) {
      console.error("Rating request error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------- UI ----------------------------- */

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
            <h2 className="text-sm sm:text-lg font-bold font-weight-700 text-heading">
              {psychologist.name}
            </h2>
            <p className="text-heading2 font-weight-400 text-xs sm:text-base">{psychologist.role}</p>
            <p className="text-xs sm:text-sm text-heading2">
              <span className="text-red-500">📍</span> Location: <strong>{psychologist.affiliation}</strong>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="font-weight-400 text-xs sm:text-sm">{psychologist.rating} Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* About */}
          <div className="bg-[#FFF8ECDB] p-3 sm:p-4 rounded-xl">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="about">👤</span> About Me
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.about}</p>

            {/* Qualifications */}
            <h3 className="font-semibold text-heading mt-2 sm:mt-3 mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="qualification">🎓</span> Qualification
            </h3>
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.qualifications.map((qual, index) => (
                <span key={index}>
                  {qual}
                  {index < psychologist.qualifications.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          {/* Languages */}
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="languages">💬</span> Languages Spoken
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.languages.join(", ")}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* Experience */}
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="experience">🧳</span> Experience
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.experience}</p>
          </div>

          {/* Ratings (single row of stars) */}
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-2xl border border-[#D7E2FE] shadow-sm">
            <h3 className="font-semibold text-heading2 text-sm sm:text-lg mb-2 flex items-center gap-1 sm:gap-2">
              <span>⭐</span> Rating / Reviews
            </h3>

            {/* live average number (auto-updates after submit) */}
            <p className="text-heading2 mb-2 sm:mb-3 flex items-center gap-1 text-xs sm:text-sm">
              <span>⭐</span> {psychologist.rating} rating
            </p>

            {/* submit button */}
            <button
              className="w-full bg-[#E9F5FE] text-heading2 font-medium py-1.5 sm:py-2 rounded-full hover:bg-blue-100 transition text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={submitRating}
              disabled={submitting || selectedRating === 0 || !selectedDoctor}
            >
              {submitting ? "Submitting..." : "Submit your rating"}
            </button>

            {/* single interactive row directly under the button */}
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

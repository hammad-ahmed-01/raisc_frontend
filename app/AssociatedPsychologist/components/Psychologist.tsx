// app/AssociatedPsychologist/components/Psychologist.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getToken, fetchMe } from "@/lib/auth";
import { Star } from "lucide-react";

/* ----------------------------- types ----------------------------- */

interface PsychologistData {
  name: string;
  role: string;
  affiliationOrg: string;   // bold org name
  affiliationCity: string;  // appended in parentheses after org
  image: string;
  about: string;
  qualifications: string[];
  languages: string[];
  experience: string;
  rating?: number;
  reviews?: number;
}

type Doctor = {
  id: number;
  user_id?: number;
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
  phone?: string;
  affiliated_organization?: string;
  availability?: string;
  website?: string;
};

/* ----------------------------- utils ----------------------------- */

const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");
const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  const s = safeStr(v);
  if (!s) return [];
  return s.split(/[,\|]/g).map((x) => x.trim()).filter(Boolean);
}

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

  const affiliatedOrg =
    safeStr(p?.affiliated_organization) ||
    safeStr(p?.affiliation) ||
    safeStr(p?.organization) ||
    safeStr(p?.hospital);

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
    phone: safeStr(p?.phone || p?.phone_number || p?.contact || p?.contact_number),
    affiliated_organization: affiliatedOrg,
    availability: safeStr(p?.availability || p?.available_slots || p?.schedule),
    website: safeStr(p?.website || p?.site),
  };
}

function toUI(d: Doctor): PsychologistData {
  const org = safeStr(d.affiliated_organization) || "Pakistan Institute of Mental Health (PIMH)";
  const city = safeStr(d.location);
  return {
    name: d.name || d.username || "Doctor",
    role: d.specialization || "Clinical Psychologist",
    affiliationOrg: org,
    affiliationCity: city,
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

/* ----------------------------- Stars UI ----------------------------- */

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

// accepted/pending/none
type AssocStatus = "accepted" | "pending" | "none";

export default function Psychologist() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [psychologist, setPsychologist] = useState<PsychologistData>({
    name: "—",
    role: "Clinical Psychologist",
    affiliationOrg: "Pakistan Institute of Mental Health (PIMH)",
    affiliationCity: "",
    image: "/doctor.jpg",
    about: "Once your request is accepted, your psychologist will appear here.",
    qualifications: [],
    languages: ["English", "Urdu"],
    experience: "",
    rating: 0,
    reviews: 0,
  });

  const [assocStatus, setAssocStatus] = useState<AssocStatus>("none");

  // rating state
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // request state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const pollStopAt = useRef<number>(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ----------------------------- helpers ----------------------------- */

  const computeAssocStatus = (doc: Doctor | null, me: any): AssocStatus => {
    if (!doc || !me) return "none";
    const pp = me?.patient_profile || {};
    const assocRaw =
      pp?.associated_psychologist ?? pp?.associated_psychologist_id ?? null;
    const assocName = safeStr(pp?.associated_psychologist_name);

    const assocId = assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

    // accepted by id (could match user_id or doctor.id depending on backend)
    if (
      assocId != null &&
      (Number(doc.user_id) === assocId || Number(doc.id) === assocId)
    ) {
      return "accepted";
    }

    // accepted by name fallback
    if (
      assocName &&
      (assocName.toLowerCase() === safeStr(doc.name).toLowerCase() ||
        assocName.toLowerCase() === safeStr(doc.username).toLowerCase())
    ) {
      return "accepted";
    }

    // pending if request already sent
    const sentArr: string[] = Array.isArray(pp?.sent_requests) ? pp.sent_requests : [];
    if (
      sentArr.includes(String(doc.id)) ||
      (doc.user_id != null && sentArr.includes(String(doc.user_id)))
    ) {
      return "pending";
    }

    return "none";
  };

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

  const tryDirectoryMatch = async (token: string | null): Promise<Doctor | null> => {
    try {
      const me: any = await fetchMe().catch(() => null);
      const assocRaw =
        me?.patient_profile?.associated_psychologist ??
        me?.patient_profile?.associated_psychologist_id ??
        null;
      const assocName = safeStr(me?.patient_profile?.associated_psychologist_name);
      const assocId = assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

      const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
      const res = await fetch("/api/doctors/list", { headers, cache: "no-store" });
      const list = (await res.json().catch(() => [])) as any[];
      const docs = Array.isArray(list) ? list.map(normalizeDoctor) : [];

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

  const refreshAssocStatus = useCallback(async (doc: Doctor | null) => {
    const me = await fetchMe().catch(() => null);
    setAssocStatus(computeAssocStatus(doc, me));
  }, []);

  const resolveDoctor = useCallback(async () => {
    const token = getToken();

    // 1) localStorage handoff
    const fromLocal = tryLocalSelectedDoctor();
    if (fromLocal) {
      setSelectedDoctor(fromLocal);
      setPsychologist(toUI(fromLocal));
      await refreshAssocStatus(fromLocal);
      return true;
    }

    // 2) dedicated endpoint
    const fromCurrent = await tryApiCurrent(token);
    if (fromCurrent) {
      setSelectedDoctor(fromCurrent);
      setPsychologist(toUI(fromCurrent));
      await refreshAssocStatus(fromCurrent);
      return true;
    }

    // 3) directory match
    const fromDirectory = await tryDirectoryMatch(token);
    if (fromDirectory) {
      setSelectedDoctor(fromDirectory);
      setPsychologist(toUI(fromDirectory));
      await refreshAssocStatus(fromDirectory);
      return true;
    }

    return false;
  }, [refreshAssocStatus]);

  useEffect(() => {
    resolveDoctor();
  }, [resolveDoctor]);

  // Re-check status when tab becomes active
  useEffect(() => {
    const onFocus = () => refreshAssocStatus(selectedDoctor);
    const onVis = () => {
      if (document.visibilityState === "visible") refreshAssocStatus(selectedDoctor);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [selectedDoctor, refreshAssocStatus]);

  // Listen for cross-tab profile updates (e.g., doctor accepts)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("profile-sync");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "profile-updated") {
          refreshAssocStatus(selectedDoctor);
        }
      };
    } catch {}
    return () => {
      if (bc) bc.close();
    };
  }, [selectedDoctor, refreshAssocStatus]);

  // Gentle polling until associated doctor appears / state changes
  useEffect(() => {
    if (pollTimer.current) return;
    pollStopAt.current = Date.now() + 2 * 60 * 1000;
    pollTimer.current = setInterval(async () => {
      await refreshAssocStatus(selectedDoctor);
      if (Date.now() > pollStopAt.current) {
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
  }, [selectedDoctor, refreshAssocStatus]);

  /* ----------------------------- actions ----------------------------- */

  const sendRequest = async () => {
    if (!selectedDoctor || sending) return;

    setSending(true);

    // Demo fallback
    if (!isBackendConnected || !BASE) {
      setSent(true);
      setSending(false);
      setAssocStatus("pending");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        console.error("Missing auth token");
        setSending(false);
        return;
      }

      const resp = await fetch(`${BASE}/users/doctor/request/${selectedDoctor.id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error("Request failed", resp.status, t);
        setSending(false);
        return;
      }

      setSent(true);
      setAssocStatus("pending");

      // mirror DoctorsPage local state (so UI stays in sync across pages)
      try {
        const raw = localStorage.getItem("user_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          const sentSet = new Set(parsed?.patient_profile?.sent_requests ?? []);
          sentSet.add(String(selectedDoctor.id));
          parsed.patient_profile = {
            ...(parsed.patient_profile || {}),
            sent_requests: [...sentSet],
          };
          localStorage.setItem("user_data", JSON.stringify(parsed));
          try {
            new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
          } catch {}
        }
      } catch {}
    } catch (e) {
      console.error("sendRequest error", e);
    } finally {
      setSending(false);
    }
  };

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
          doctor_id: selectedDoctor.id,
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
      {/* HEADER CARD – light blue bg, blue border, round avatar, single-line button */}
      <div
        className="rounded-2xl p-4 sm:p-5 shadow"
        style={{ backgroundColor: "#DAECFF", border: "2px solid #2196F3" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* fully round, equal width/height */}
            <div className="rounded-full overflow-hidden w-16 sm:w-20 h-16 sm:h-20 ring-2 ring-offset-0 bg-white flex-shrink-0">
              <Image
                src={psychologist.image || "/doctor.jpg"}
                alt={psychologist.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="text-[#123AAB] font-bold text-lg sm:text-2xl leading-tight">
                {psychologist.name}
              </h2>
              <p className="text-[#123AAB] text-sm sm:text-base">
                {psychologist.role}
              </p>

              {/* Affiliation line with bold org name; city in parentheses */}
              <p className="text-[#123AAB] text-sm sm:text-base mt-1">
                Affiliated with{" "}
                <strong className="font-semibold">{psychologist.affiliationOrg}</strong>
              </p>
            </div>
          </div>

          {/* One-line pill button — hidden if accepted */}
          {assocStatus !== "accepted" && (
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={sendRequest}
                disabled={!selectedDoctor || sending || sent || assocStatus === "pending"}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 bg-white text-[#123AAB] font-semibold shadow-sm disabled:opacity-60"
                style={{ border: "1px solid #2196F3" }}
                title={
                  assocStatus === "pending"
                    ? "Request already sent"
                    : sent
                    ? "Request sent"
                    : "Send Request"
                }
              >
                {assocStatus === "pending"
                  ? "Request Sent"
                  : sent
                  ? "Request Sent"
                  : sending
                  ? "Sending…"
                  : "Send Request"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INFO GRID (about / qualification / languages / experience + rating section) */}
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

          {/* Rating / Reviews */}
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

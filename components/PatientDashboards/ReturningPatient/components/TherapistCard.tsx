"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { Hourglass } from "lucide-react";
import { fetchMe, getToken } from "@/lib/auth";

/* ----------------------------- config ----------------------------- */

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

/* ------------------------------ types ----------------------------- */

export type RequestStatus = "none" | "pending" | "accepted";

type Doctor = {
  id: number;
  user_id?: number;
  username?: string;
  name: string;
  profile_image: string;
  specialization: string;
  location?: string;
  experience?: string | number;
  rating?: number;
  expertise?: string[];
  education?: string;
  description?: string;
  rates?: string;
  requestStatus?: RequestStatus; // derived
};

interface TherapistCardProps {
  /** Back-compat props (optional). If provided as pending/accepted, the card shows that state and hides the list when pending. */
  doctor?: Partial<Doctor> | null;
  hasRequest?: boolean;
  requestStatus?: RequestStatus;
  /** View more click handler (push to /Doctors) */
  onViewMoreClick: () => void;
}

/* ----------------------------- utils ----------------------------- */

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function normalizeDoctor(raw: any): Doctor {
  const p = raw?.professional_information || {};
  const username = safeStr(raw?.user?.username || raw?.username);
  const displayName =
    safeStr(p?.display_name) || safeStr(raw?.name) || username || "Doctor";

  const profile_image =
    safeStr(p?.profile_image) ||
    safeStr(raw?.profile_image) ||
    "/doctor.jpg";

  return {
    id: Number(raw?.id ?? raw?.pk ?? raw?.user?.id ?? 0),
    user_id:
      raw?.user_id != null
        ? Number(raw.user_id)
        : raw?.user?.id != null
        ? Number(raw.user.id)
        : undefined,
    username,
    name: displayName,
    profile_image,
    specialization: safeStr(p?.specialization || raw?.specialization),
    location: safeStr(p?.location || raw?.location),
    experience: p?.experience ?? raw?.experience ?? "",
    rating: Number(p?.rating ?? raw?.rating ?? 0) || 0,
    expertise: Array.isArray(p?.expertise) ? p.expertise : [],
    education: safeStr(p?.education || raw?.education),
    description: safeStr(p?.description || raw?.description || (p as any)?.bio || raw?.bio),
    rates: safeStr(raw?.rates),
  };
}

function computeStatusForDoctor(d: Doctor, me: any): RequestStatus {
  const pp = me?.patient_profile || {};
  const assocRaw = pp?.associated_psychologist ?? pp?.associated_psychologist_id ?? null;
  const assocName = safeStr(pp?.associated_psychologist_name);
  const assocId =
    assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;
  const sentArr: string[] = Array.isArray(pp?.sent_requests) ? pp.sent_requests : [];

  if (
    assocId != null &&
    (Number(d.user_id) === assocId || Number(d.id) === assocId)
  ) {
    return "accepted";
  }

  if (
    assocName &&
    (assocName.toLowerCase() === safeStr(d.name).toLowerCase() ||
      assocName.toLowerCase() === safeStr(d.username).toLowerCase())
  ) {
    return "accepted";
  }

  if (
    sentArr.includes(String(d.id)) ||
    (d.user_id != null && sentArr.includes(String(d.user_id)))
  ) {
    return "pending";
  }

  return "none";
}

/* ----------------------------- component ----------------------------- */

export const TherapistCard: React.FC<TherapistCardProps> = ({
  doctor: doctorProp = null,
  hasRequest,
  requestStatus,
  onViewMoreClick,
}) => {
  const [me, setMe] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);

  const bcRef = useRef<BroadcastChannel | null>(null);
  const token = useMemo(() => getToken(), []);

  const load = async () => {
    try {
      setLoading(true);
      const meData = await fetchMe().catch(() => null);
      setMe(meData);

      const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
      const res = await fetch("/api/doctors/list", {
        headers,
        cache: "no-store",
      });
      const list = (await res.json().catch(() => [])) as any[];
      const normalized: Doctor[] = Array.isArray(list) ? list.map(normalizeDoctor) : [];

      const withStatuses = normalized.map((d) => ({
        ...d,
        requestStatus: computeStatusForDoctor(d, meData),
      }));
      setDoctors(withStatuses);
    } finally {
      setLoading(false);
    }
  };

  // initial + sync listeners
  useEffect(() => {
    void load();

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "selectedDoctor") void load();
    };
    window.addEventListener("storage", onStorage);

    if ("BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("profile-sync");
      bcRef.current.onmessage = (ev) => {
        if (ev?.data?.type === "profile-updated") void load();
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      if (bcRef.current) bcRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If legacy props are provided, shape them as an override doctor
  const overrideDoctor = useMemo<Doctor | null>(() => {
    if (!doctorProp) return null;
    const id = Number((doctorProp as any)?.id ?? 0);
    if (!Number.isFinite(id) || id <= 0) return null;

    const d: Doctor = {
      id,
      user_id: Number((doctorProp as any)?.user_id ?? 0) || undefined,
      name: safeStr((doctorProp as any)?.name) || "Doctor",
      username: safeStr((doctorProp as any)?.username),
      profile_image: safeStr((doctorProp as any)?.profile_image) || "/doctor.jpg",
      specialization: safeStr((doctorProp as any)?.specialization) || "Psychologist",
      location: safeStr((doctorProp as any)?.location),
      rating: Number((doctorProp as any)?.rating ?? 0) || 0,
      requestStatus:
        requestStatus ??
        ((doctorProp as any)?.requestStatus as RequestStatus | undefined) ??
        (hasRequest ? "pending" : "none"),
    };
    return d;
  }, [doctorProp, hasRequest, requestStatus]);

  const pendingDoctorComputed = useMemo(
    () => doctors.find((d) => d.requestStatus === "pending") || null,
    [doctors]
  );
  const acceptedDoctorComputed = useMemo(
    () => doctors.find((d) => d.requestStatus === "accepted") || null,
    [doctors]
  );

  const pendingDoctor = overrideDoctor?.requestStatus === "pending" ? overrideDoctor : pendingDoctorComputed;
  const acceptedDoctor = overrideDoctor?.requestStatus === "accepted" ? overrideDoctor : acceptedDoctorComputed;

  /* ------------------------------ actions ------------------------------ */

  const sendRequest = async (doc: Doctor) => {
    if (!doc?.id || sendingId != null) return;
    setSendingId(doc.id);

    // demo/local path
    if (!isBackendConnected || !BASE) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, requestStatus: "pending" } : d))
      );
      try {
        const raw = localStorage.getItem("user_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          const sent = new Set(parsed?.patient_profile?.sent_requests ?? []);
          sent.add(String(doc.id));
          parsed.patient_profile = { ...(parsed.patient_profile || {}), sent_requests: [...sent] };
          localStorage.setItem("user_data", JSON.stringify(parsed));
        }
        localStorage.setItem("selectedDoctor", JSON.stringify({ ...doc, requestStatus: "pending" }));
        if (bcRef.current) bcRef.current.postMessage({ type: "profile-updated" });
      } catch {}
      setSendingId(null);
      return;
    }

    try {
      const tok = token;
      if (!tok) {
        console.error("No auth token");
        setSendingId(null);
        return;
      }
      const resp = await fetch(`${BASE}/users/doctor/request/${doc.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${tok}` },
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error("Send request failed", resp.status, t);
        setSendingId(null);
        return;
      }
      // mark pending locally
      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, requestStatus: "pending" } : d))
      );
      try {
        const raw = localStorage.getItem("user_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          const sent = new Set(parsed?.patient_profile?.sent_requests ?? []);
          sent.add(String(doc.id));
          parsed.patient_profile = { ...(parsed.patient_profile || {}), sent_requests: [...sent] };
          localStorage.setItem("user_data", JSON.stringify(parsed));
        }
        localStorage.setItem("selectedDoctor", JSON.stringify({ ...doc, requestStatus: "pending" }));
        if (bcRef.current) bcRef.current.postMessage({ type: "profile-updated" });
      } catch {}
    } catch (e) {
      console.error("sendRequest error:", e);
    } finally {
      setSendingId(null);
    }
  };

  // Try several plausible cancel endpoints; fall back to local-only if not available.
  const cancelRequest = async (doc: Doctor) => {
    if (!doc?.id || cancelId != null) return;
    setCancelId(doc.id);

    const localCleanup = () => {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, requestStatus: "none" } : d))
      );
      try {
        const raw = localStorage.getItem("user_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          const sentArr: string[] = parsed?.patient_profile?.sent_requests ?? [];
          const filtered = sentArr.filter(
            (x) => x !== String(doc.id) && x !== String(doc.user_id)
          );
          parsed.patient_profile = { ...(parsed.patient_profile || {}), sent_requests: filtered };
          localStorage.setItem("user_data", JSON.stringify(parsed));
        }
        const selRaw = localStorage.getItem("selectedDoctor");
        if (selRaw) {
          const sel = JSON.parse(selRaw);
          if (Number(sel?.id) === Number(doc.id)) {
            localStorage.setItem("selectedDoctor", JSON.stringify({ ...sel, requestStatus: "none" }));
          }
        }
        if (bcRef.current) bcRef.current.postMessage({ type: "profile-updated" });
      } catch {}
    };

    if (!isBackendConnected || !BASE || !token) {
      localCleanup();
      setCancelId(null);
      return;
    }

    try {
      // Try multiple common patterns
      const tok = token!;
      const candidates = [
        `${BASE}/users/doctor/request/${doc.id}/cancel/`,
        `${BASE}/users/doctor/request/cancel/${doc.id}/`,
        `${BASE}/users/doctor/request/${doc.id}/`, // maybe DELETE
      ];

      for (const url of candidates) {
        const method = url.endsWith(`/${doc.id}/`) ? "DELETE" : "POST";
        try {
          const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Token ${tok}` },
          });
          if (resp.ok) break;
        } catch {
          // try next
        }
      }

      // Regardless, make UI consistent
      localCleanup();
    } finally {
      setCancelId(null);
    }
  };

  /* ------------------------------ render ------------------------------ */

  // Hide the scrollable list when a request is pending (spec).
  const hideList = !!pendingDoctor;

  return (
    <div className="bg-[#F6FDFE] shadow-md p-3 sm:p-6 rounded-2xl w-full max-w-[320px] sm:max-w-sm text-heading2">
      {/* Title chip */}
      <h2 className="text-heading2 bg-[#D7E2FE] text-sm sm:text-xl font-semibold p-2 sm:p-4 mb-4 sm:mb-6 rounded-full text-center">
        Choose Your Therapist
      </h2>

      {/* Accepted (connected) banner */}
      {acceptedDoctor && (
        <div className="border border-green-300 bg-green-50 rounded-xl p-3 sm:p-4 mb-4">
          <div className="flex items-center gap-3">
            <Image
              src={acceptedDoctor.profile_image || "/doctor.jpg"}
              alt={acceptedDoctor.name}
              className="w-12 h-12 rounded-full border-green-300 border object-cover"
              width={48}
              height={48}
            />
            <div className="flex-1 min-w-0">
              <p className="text-green-800 font-semibold text-sm sm:text-base truncate">
                {acceptedDoctor.name}
              </p>
              <p className="text-green-700 text-xs sm:text-sm truncate">
                {acceptedDoctor.specialization || "Psychologist"}
              </p>
            </div>
            <span className="text-green-600 text-xs sm:text-sm font-semibold">✅ Connected</span>
          </div>
        </div>
      )}

      {/* Pending card (single-line Status at TOP; list hidden while pending) */}
      {!acceptedDoctor && pendingDoctor && (
        <div className="border border-[#CFE0FF] bg-white rounded-2xl p-3 sm:p-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          {/* Status line at top, single line */}
          <div className="flex items-center justify-between">
            <div className="text-[#1E3CA7] font-semibold text-xs sm:text-sm whitespace-nowrap">
              Status:&nbsp;
              <span className="inline-flex items-center gap-1">
                <Hourglass className="w-4 h-4" />
                Pending&nbsp;Request
              </span>
            </div>
            <SecondaryButton
              text={cancelId === pendingDoctor.id ? "Cancelling…" : "Cancel"}
              onClick={() => cancelRequest(pendingDoctor)}
              className="px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
              disabled={cancelId === pendingDoctor.id}
            />
          </div>

          {/* Doctor row */}
          <div className="mt-3 flex items-center gap-3 sm:gap-4">
            <Image
              src={pendingDoctor.profile_image || "/doctor.jpg"}
              alt={pendingDoctor.name}
              className="w-14 h-14 rounded-full border-blue-200 border object-cover"
              width={56}
              height={56}
            />
            <div className="flex-1 min-w-0">
              <p className="text-blue-800 font-semibold text-sm sm:text-base truncate">
                {pendingDoctor.name}
              </p>
              <p className="text-blue-600 text-xs sm:text-sm truncate">
                {pendingDoctor.specialization || "Psychologist"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable list — hidden while a request is pending */}
      {!hideList && (
        <div
          className="flex flex-col gap-2 sm:gap-3 overflow-y-auto pr-1"
          style={{ maxHeight: 320 }}
        >
          {loading && (
            <div className="text-center text-xs sm:text-sm text-gray-500 py-6">
              Loading doctors…
            </div>
          )}
          {!loading && doctors.length === 0 && (
            <div className="text-center text-xs sm:text-sm text-gray-500 py-6">
              No therapists available.
            </div>
          )}

          {!loading &&
            doctors.map((d) => (
              <div
                key={`${d.id}-${d.user_id ?? "x"}`}
                className="border border-blue-100 rounded-[18px] p-3 sm:p-4 hover:bg-blue-50 transition shadow-[0_1px_6px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <Image
                    src={d.profile_image || "/doctor.jpg"}
                    alt={d.name}
                    className="w-14 h-14 rounded-full border-blue-200 border object-cover"
                    width={56}
                    height={56}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-blue-800 font-semibold text-sm sm:text-base truncate">
                      {d.name}
                    </p>
                    <p className="text-blue-600 text-xs sm:text-sm truncate">
                      {d.specialization || "Psychologist"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500 text-xs sm:text-sm">
                        ⭐ {isNum(d.rating) ? d.rating.toFixed(1) : "0.0"}
                      </span>
                      {safeStr(d.location) && (
                        <span className="text-gray-400 text-xs sm:text-sm">
                          • {d.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {d.requestStatus === "accepted" ? (
                    <span className="text-green-600 text-xs sm:text-sm font-semibold">
                      Connected
                    </span>
                  ) : d.requestStatus === "pending" ? (
                    <span className="inline-flex items-center gap-1 text-[#1E3CA7] text-xs sm:text-sm font-semibold whitespace-nowrap">
                      <Hourglass className="w-4 h-4" /> Pending
                    </span>
                  ) : (
                    <SecondaryButton
                      text={sendingId === d.id ? "Sending…" : "Request"}
                      onClick={() => sendRequest(d)}
                      className="px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold disabled:opacity-60"
                      disabled={sendingId === d.id}
                    />
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <hr className="my-3 sm:my-5 text-[#D0E3FFC7]" />

      <div className="flex justify-center">
        <PrimaryButton
          text="View More"
          onClick={onViewMoreClick}
          className="w-fit flex items-center justify-center px-6 py-2 rounded-full text-xs sm:text-sm"
        />
      </div>
    </div>
  );
};

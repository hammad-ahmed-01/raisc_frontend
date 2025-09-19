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

export type RequestStatus = "none" | "pending" | "accepted" | "rejected" | "cancelled";

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
  requestStatus?: RequestStatus;
};

interface TherapistCardProps {
  doctor?: Partial<Doctor> | null;
  hasRequest?: boolean;
  requestStatus?: RequestStatus;
  onViewMoreClick: () => void;
}

/* ----------------------------- utils ----------------------------- */

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const PENDING_CACHE_KEY = "pending_requests_cache";
const CANCELLED_CACHE_KEY = "cancelled_requests_cache";
const SELECTED_DOCTOR_KEY = "selectedDoctor";

/** sets for durable flags */
function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
}
function writeSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {}
}
function addToSet(key: string, idLike: number | string | undefined | null) {
  if (idLike == null) return;
  const s = String(idLike);
  const cache = readSet(key);
  cache.add(s);
  writeSet(key, cache);
}
function removeFromSet(key: string, idLike: number | string | undefined | null) {
  if (idLike == null) return;
  const s = String(idLike);
  const cache = readSet(key);
  cache.delete(s);
  writeSet(key, cache);
}
const readPendingCache = () => readSet(PENDING_CACHE_KEY);
const writePendingCache = (s: Set<string>) => writeSet(PENDING_CACHE_KEY, s);
const addToPendingCache = (id?: number | string | null) => addToSet(PENDING_CACHE_KEY, id);
const removeFromPendingCache = (id?: number | string | null) => removeFromSet(PENDING_CACHE_KEY, id);

const readCancelledCache = () => readSet(CANCELLED_CACHE_KEY);
const writeCancelledCache = (s: Set<string>) => writeSet(CANCELLED_CACHE_KEY, s);
const addToCancelledCache = (id?: number | string | null) => addToSet(CANCELLED_CACHE_KEY, id);
const removeFromCancelledCache = (id?: number | string | null) => removeFromSet(CANCELLED_CACHE_KEY, id);

function readSelectedDoctor(): Doctor | null {
  try {
    const raw = localStorage.getItem(SELECTED_DOCTOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeSelectedDoctor(doc: Partial<Doctor> & { requestStatus?: RequestStatus }) {
  try {
    localStorage.setItem(SELECTED_DOCTOR_KEY, JSON.stringify(doc));
  } catch {}
}

function normalizeDoctor(raw: any): Doctor {
  const p = raw?.professional_information || {};
  const username = safeStr(raw?.user?.username || raw?.username);
  const displayName = safeStr(p?.display_name) || safeStr(raw?.name) || username || "Doctor";
  const profile_image = safeStr(p?.profile_image) || safeStr(raw?.profile_image) || "/doctor.jpg";

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

function normalizeDecision(v: unknown): "pending" | "accepted" | "rejected" | "" {
  const s = safeStr(v).toLowerCase();
  if (!s) return "";
  if (s === "pending") return "pending";
  if (s === "approved" || s === "accepted" || s === "approve") return "accepted";
  if (["rejected", "declined", "request_again", "canceled", "cancelled", "denied"].includes(s))
    return "rejected";
  return "";
}

/**
 * Build a map of the **latest** status per doctor.user_id.
 * Assumes payload is newest-first from backend.
 */
function buildLatestStatusByDoctor(payload: any): Map<string, "pending" | "accepted" | "rejected"> {
  const map = new Map<string, "pending" | "accepted" | "rejected">();
  const consider = (item: any) => {
    const status = normalizeDecision(item?.status);
    const uid =
      item?.doctor?.user_id ??
      item?.doctor?.user?.id ??
      item?.doctor_id ??
      item?.doctorId ??
      null;
    if (!status || uid == null || Number.isNaN(Number(uid))) return;
    const key = String(uid);
    if (!map.has(key)) map.set(key, status);
  };
  if (Array.isArray(payload)) payload.forEach(consider);
  else if (payload && typeof payload === "object") {
    if (Array.isArray(payload.requests)) payload.requests.forEach(consider);
    else Object.values(payload).forEach((v) => v && typeof v === "object" && consider(v));
  }
  return map;
}

/**
 * Base list status: "accepted" (association), "pending" (cache), or "none".
 * We overlay "cancelled" or "rejected" later depending on source.
 */
function computeStatusForDoctor(d: Doctor, me: any, pendingCache: Set<string>): RequestStatus {
  const pp = me?.patient_profile || {};
  const assocRaw = pp?.associated_psychologist ?? pp?.associated_psychologist_id ?? null;
  const assocName = safeStr(pp?.associated_psychologist_name);
  const assocId = assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

  const matchesAssoc =
    (assocId != null && (Number(d.user_id) === assocId || Number(d.id) === assocId)) ||
    (assocName &&
      (assocName.toLowerCase() === safeStr(d.name).toLowerCase() ||
        assocName.toLowerCase() === safeStr(d.username).toLowerCase()));
  if (matchesAssoc) {
    removeFromPendingCache(d.id);
    removeFromPendingCache(d.user_id);
    removeFromCancelledCache(d.id);
    removeFromCancelledCache(d.user_id);
    return "accepted";
  }

  if (
    pendingCache.has(String(d.id)) ||
    (d.user_id != null && pendingCache.has(String(d.user_id)))
  ) {
    return "pending";
  }
  return "none";
}

function authHeaders(): HeadersInit {
  const t = getToken();
  if (!t) return {};
  const looksJWT = String(t).includes(".");
  return { Authorization: `${looksJWT ? "Bearer" : "Token"} ${t}` };
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rejectWatchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** patient’s requests (latest status map) */
  const fetchLatestStatusMap = async (): Promise<
    Map<string, "pending" | "accepted" | "rejected"> | null
  > => {
    try {
      const res = await fetch(`/api/patient/requests`, {
        headers: { ...authHeaders() },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      return buildLatestStatusByDoctor(data);
    } catch {
      return null;
    }
  };

  /**
   * Doctor-driven rejection:
   * - Only flip currently-pending doctors whose latest status is "rejected"
   * - Ignore if this doctor is in the CANCELLED cache (patient just cancelled)
   */
  const applyDoctorDrivenRejection = (
    latestMap: Map<string, "pending" | "accepted" | "rejected">
  ) => {
    if (!latestMap || latestMap.size === 0) return;

    const cancelledCache = readCancelledCache();

    // Find pending doctors, test latest status
    const affectedIds = new Set<string>();
    doctors.forEach((d) => {
      if (d.requestStatus !== "pending") return;
      const uid = String(d.user_id ?? "");
      const latest = uid ? latestMap.get(uid) : undefined;
      if (latest === "rejected" && !cancelledCache.has(uid) && !cancelledCache.has(String(d.id))) {
        affectedIds.add(String(d.id));
        // clear pending flags
        removeFromPendingCache(d.id);
        removeFromPendingCache(d.user_id);
      }
    });

    if (!affectedIds.size) return;

    // Update selected doctor if affected
    try {
      const sel = readSelectedDoctor();
      if (sel && affectedIds.has(String(sel.id ?? ""))) {
        writeSelectedDoctor({ ...sel, requestStatus: "rejected" });
      }
      if (bcRef.current) bcRef.current.postMessage({ type: "profile-updated" });
    } catch {}

    // Flip UI
    setDoctors((prev) =>
      prev.map((d) =>
        affectedIds.has(String(d.id)) ? { ...d, requestStatus: "rejected" as const } : d
      )
    );
  };

  const load = async () => {
    try {
      setLoading(true);

      const meData = await fetchMe().catch(() => null);
      setMe(meData);

      const res = await fetch("/api/doctors/list", {
        headers: { ...authHeaders() },
        cache: "no-store",
      });
      const list = (await res.json().catch(() => [])) as any[];
      const normalized: Doctor[] = Array.isArray(list) ? list.map(normalizeDoctor) : [];

      let pendingCache = readPendingCache();
      const cancelledCache = readCancelledCache();

      // 1) Base: accepted/pending/none
      let withStatuses = normalized.map((d) => ({
        ...d,
        requestStatus: computeStatusForDoctor(d, meData, pendingCache),
      }));

      // 2) Overlay "cancelled" from local cache (after pending was cleared)
      withStatuses = withStatuses.map((d) => {
        if (d.requestStatus === "none") {
          const idKey = String(d.id);
          const uidKey = String(d.user_id ?? "");
          if ((uidKey && cancelledCache.has(uidKey)) || cancelledCache.has(idKey)) {
            return { ...d, requestStatus: "cancelled" as const };
          }
        }
        return d;
      });

      setDoctors(withStatuses);

      // 3) Check latest statuses to react to doctor-driven rejections of PENDING ones
      const latest = await fetchLatestStatusMap();
      if (latest) applyDoctorDrivenRejection(latest);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === PENDING_CACHE_KEY ||
        e.key === CANCELLED_CACHE_KEY ||
        e.key === SELECTED_DOCTOR_KEY ||
        e.key === "user_data"
      ) {
        void load();
      }
    };
    window.addEventListener("storage", onStorage);

    if ("BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("profile-sync");
      bcRef.current.onmessage = (ev) => {
        if (ev?.data?.type === "profile-updated") void load();
      };
    }

    // doctor UI accepts/rejects → refresh immediately
    const onDoctorDecision = () => void load();
    window.addEventListener("doctor-request-updated", onDoctorDecision as EventListener);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("doctor-request-updated", onDoctorDecision as EventListener);
      if (bcRef.current) bcRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // while any request is pending, slow poll to detect ACCEPT association quickly
  useEffect(() => {
    const hasPending =
      readPendingCache().size > 0 ||
      doctors.some((d) => d.requestStatus === "pending");
    if (hasPending) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => void load(), 8000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  // fast watcher (2s): only flip pending → rejected if latest says rejected AND not cancelled
  useEffect(() => {
    const hasPending =
      readPendingCache().size > 0 ||
      doctors.some((d) => d.requestStatus === "pending");
    if (hasPending) {
      (async () => {
        const latest = await fetchLatestStatusMap();
        if (latest) applyDoctorDrivenRejection(latest);
      })();

      if (rejectWatchRef.current) clearInterval(rejectWatchRef.current);
      rejectWatchRef.current = setInterval(async () => {
        const latest = await fetchLatestStatusMap();
        if (latest) applyDoctorDrivenRejection(latest);
      }, 2000);
    } else if (rejectWatchRef.current) {
      clearInterval(rejectWatchRef.current);
      rejectWatchRef.current = null;
    }

    return () => {
      if (rejectWatchRef.current) {
        clearInterval(rejectWatchRef.current);
        rejectWatchRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  // optional one-card override (kept)
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

  /** pick pending from list or durable fallback */
  const pendingDoctorComputed = useMemo(() => {
    const fromList = doctors.find((d) => d.requestStatus === "pending") || null;
    if (fromList) return fromList;

    const cache = readPendingCache();
    if (!cache.size) return null;

    const sel = readSelectedDoctor();
    if (!sel) return null;

    const selId = String(sel.id ?? "");
    const selU = String(sel.user_id ?? "");
    if ((selId && cache.has(selId)) || (selU && cache.has(selU))) {
      return {
        ...sel,
        id: Number(sel.id || 0),
        requestStatus: "pending" as const,
        name: safeStr(sel.name || sel.username || "Doctor"),
        profile_image: safeStr(sel.profile_image || "/doctor.jpg"),
        specialization: safeStr(sel.specialization || "Psychologist"),
      } as Doctor;
    }
    return null;
  }, [doctors]);

  const acceptedDoctorComputed = useMemo(
    () => doctors.find((d) => d.requestStatus === "accepted") || null,
    [doctors]
  );
  const rejectedDoctorComputed = useMemo(
    () => doctors.find((d) => d.requestStatus === "rejected") || null,
    [doctors]
  );
  const cancelledDoctorComputed = useMemo(
    () => doctors.find((d) => d.requestStatus === "cancelled") || null,
    [doctors]
  );

  const pendingDoctor =
    overrideDoctor?.requestStatus === "pending" ? overrideDoctor : pendingDoctorComputed;
  const acceptedDoctor =
    overrideDoctor?.requestStatus === "accepted" ? overrideDoctor : acceptedDoctorComputed;
  const rejectedDoctor =
    overrideDoctor?.requestStatus === "rejected" ? overrideDoctor : rejectedDoctorComputed;
  const cancelledDoctor =
    overrideDoctor?.requestStatus === "cancelled" ? overrideDoctor : cancelledDoctorComputed;

  /* ------------------------------ actions ------------------------------ */

  const sendRequest = async (doc: Doctor) => {
    if (!doc?.id || sendingId != null) return;
    setSendingId(doc.id);

    // fresh request: clear any old "cancelled" mark
    removeFromCancelledCache(doc.id);
    removeFromCancelledCache(doc.user_id);

    // mark pending immediately
    addToPendingCache(doc.id);
    addToPendingCache(doc.user_id);
    writeSelectedDoctor({ ...doc, requestStatus: "pending" });

    const markPendingLocally = () => {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, requestStatus: "pending" } : d))
      );
      try {
        writeSelectedDoctor({ ...doc, requestStatus: "pending" });
        if (bcRef.current) bcRef.current.postMessage({ type: "profile-updated" });
      } catch {}
    };

    if (!isBackendConnected || !BASE) {
      markPendingLocally();
      setSendingId(null);
      return;
    }

    try {
      const resp = await fetch(`${BASE}/users/doctor/request/${doc.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error("Send request failed", resp.status, t);
      }
      markPendingLocally();
    } catch (e) {
      console.error("sendRequest error:", e);
      markPendingLocally();
    } finally {
      setSendingId(null);
    }
  };

  const cancelRequest = async (doc: Doctor) => {
    if (!doc?.id || cancelId != null) return;
    setCancelId(doc.id);

    const localCleanup = () => {
      // clear pending
      removeFromPendingCache(doc.id);
      removeFromPendingCache(doc.user_id);
      // mark cancelled (for UI distinction)
      addToCancelledCache(doc.id);
      addToCancelledCache(doc.user_id);

      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, requestStatus: "cancelled" } : d))
      );

      try {
        const sel = readSelectedDoctor();
        if (sel && Number(sel?.id) === Number(doc.id)) {
          writeSelectedDoctor({ ...sel, requestStatus: "cancelled" });
        }
        if (bcRef.current) bcRef.current.postMessage({ type: "profile-updated" });
      } catch {}
    };

    if (!isBackendConnected || !BASE) {
      localCleanup();
      setCancelId(null);
      return;
    }

    try {
      const candidates = [
        `${BASE}/users/doctor/request/${doc.id}/cancel/`,
        `${BASE}/users/doctor/request/cancel/${doc.id}/`,
        `${BASE}/users/doctor/request/${doc.id}/`,
      ];
      let ok = false;
      for (const url of candidates) {
        const method = url.endsWith(`/${doc.id}/`) ? "DELETE" : "POST";
        try {
          const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...authHeaders() },
          });
          if (resp.ok) {
            ok = true;
            break;
          }
        } catch {}
      }
      localCleanup();
      if (ok) void load();
    } finally {
      setCancelId(null);
    }
  };

  /* ------------------------------ render ------------------------------ */

  return (
    <div
      className="
        bg-[#F6FDFE] shadow-md p-3 sm:p-6 rounded-2xl
        w-full
        max-w-[680px] sm:max-w-[720px] lg:max-w-[760px]
        text-heading2
      "
    >
      <h2 className="text-heading2 bg-[#D7E2FE] text-base sm:text-xl font-semibold p-3 sm:p-4 mb-4 sm:mb-6 rounded-full text-center">
        Choose Your Therapist
      </h2>

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

      {!acceptedDoctor && pendingDoctor && (
        <div className="border border-[#CFE0FF] bg-white rounded-2xl p-3 sm:p-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-[#1E3CA7] font-semibold text-xs sm:text-sm whitespace-nowrap">
              <span>Status:</span>
              <Hourglass className="w-4 h-4 flex-shrink-0" />
              <span>Pending Request</span>
            </div>
            <SecondaryButton
              text={cancelId === pendingDoctor.id ? "Cancelling…" : "Cancel"}
              onClick={() => cancelRequest(pendingDoctor)}
              className="px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
              disabled={cancelId === pendingDoctor.id}
            />
          </div>

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

      {/* Rejected info card (no Cancel button) */}
      {!acceptedDoctor && !pendingDoctor && rejectedDoctor && (
        <div className="border border-red-200 bg-red-50 rounded-2xl p-3 sm:p-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-red-700 font-semibold text-xs sm:text-sm whitespace-nowrap">
              <span>Status:</span>
              <span>Rejected</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 sm:gap-4">
            <Image
              src={rejectedDoctor.profile_image || "/doctor.jpg"}
              alt={rejectedDoctor.name}
              className="w-14 h-14 rounded-full border-red-200 border object-cover"
              width={56}
              height={56}
            />
            <div className="flex-1 min-w-0">
              <p className="text-red-800 font-semibold text-sm sm:text-base truncate">
                {rejectedDoctor.name}
              </p>
              <p className="text-red-700 text-xs sm:text-sm truncate">
                {rejectedDoctor.specialization || "Psychologist"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled info card (no Cancel button) */}
      {!acceptedDoctor && !pendingDoctor && !rejectedDoctor && cancelledDoctor && (
        <div className="border border-orange-200 bg-orange-50 rounded-2xl p-3 sm:p-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-orange-700 font-semibold text-xs sm:text-sm whitespace-nowrap">
              <span>Status:</span>
              <span>Cancelled</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 sm:gap-4">
            <Image
              src={cancelledDoctor.profile_image || "/doctor.jpg"}
              alt={cancelledDoctor.name}
              className="w-14 h-14 rounded-full border-orange-200 border object-cover"
              width={56}
              height={56}
            />
            <div className="flex-1 min-w-0">
              <p className="text-orange-800 font-semibold text-sm sm:text-base truncate">
                {cancelledDoctor.name}
              </p>
              <p className="text-orange-700 text-xs sm:text-sm truncate">
                {cancelledDoctor.specialization || "Psychologist"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Only when no pending exists → show the full list */}
      {!pendingDoctor && (
        <div className="flex flex-col gap-2 sm:gap-3 overflow-y-auto pr-1" style={{ maxHeight: 420 }}>
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
                        <span className="text-gray-400 text-xs sm:text-sm">• {d.location}</span>
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
                  ) : d.requestStatus === "rejected" ? (
                    <span className="text-red-600 text-xs sm:text-sm font-semibold">
                      Rejected
                    </span>
                  ) : d.requestStatus === "cancelled" ? (
                    <span className="text-orange-600 text-xs sm:text-sm font-semibold">
                      Cancelled
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

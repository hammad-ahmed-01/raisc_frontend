// app/DoctorsPage/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin, fetchMe } from "@/lib/auth";
import {
  resolveDisplayName,
  readUserFromLocalStorage,
  normalizeUser,
  safeStr,
  yearsFromExperience,
} from "./_utils";
import type { Doctor as BaseDoctor, User } from "./types";

import FiltersBar from "./components/FiltersBar";
import SearchInputs from "./components/SearchInputs";
import DoctorCard from "./components/DoctorCard";

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

// Request status used locally
type RequestStatus = "none" | "pending" | "accepted";

// Extend the imported Doctor type locally; do not modify shared types file.
type Doctor = Omit<BaseDoctor, "requestStatus"> & {
  user_id?: number;
  username?: string;
  requestStatus?: RequestStatus; // "none" | "pending" | "accepted"
};

/** Accepted/Pending/None — mirrors Psychologist.tsx logic */
function computeRequestStatus(doctor: Doctor, me: any): RequestStatus {
  const pp = me?.patient_profile || {};
  const assocRaw =
    pp?.associated_psychologist ?? pp?.associated_psychologist_id ?? null;
  const assocName = (pp?.associated_psychologist_name || "").toString().trim();
  const assocId = assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

  if (
    assocId != null &&
    (Number(doctor.user_id ?? NaN) === assocId || Number(doctor.id) === assocId)
  ) {
    return "accepted";
  }
  if (
    assocName &&
    (assocName.toLowerCase() === (doctor.name || "").toLowerCase() ||
      assocName.toLowerCase() === (doctor.username || "").toLowerCase())
  ) {
    return "accepted";
  }

  const sentArr: string[] = Array.isArray(pp?.sent_requests) ? pp.sent_requests : [];
  if (
    sentArr.includes(String(doctor.id)) ||
    (doctor.user_id != null && sentArr.includes(String(doctor.user_id)))
  ) {
    return "pending";
  }
  return "none";
}

export default function DoctorsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [filterType, setFilterType] =
    useState<"experience" | "rating" | "specialty">("experience");
  const [authError, setAuthError] = useState("");
  const [authVerified, setAuthVerified] = useState(false);

  const mountedRef = useRef(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStopAt = useRef<number>(0);

  // optimistic user to prevent header flicker
  useEffect(() => {
    const cached = readUserFromLocalStorage();
    if (cached) setUser(normalizeUser(cached));
  }, []);

  const refreshStatuses = useCallback(
    async (currentDoctors: Doctor[] | null = null) => {
      try {
        const me = await fetchMe().catch(() => null);
        if (!me) return;
        setDoctors((prev) => {
          const base = currentDoctors ?? prev;
          return base.map((d) => ({
            ...d,
            requestStatus: computeRequestStatus(d, me),
          }));
        });
      } catch {
        // ignore
      }
    },
    []
  );

  const loadEverything = useCallback(async () => {
    const res = await checkAuth();

    if (!res.isAuthenticated) {
      setAuthError(res.error || "Authentication failed");
      setTimeout(redirectToLogin, 1200);
      return;
    }

    if (res.user?.user_type === "doctor") {
      setAuthError("Doctors cannot access the Doctors page");
      setTimeout(() => router.push("/dashboard"), 1200);
      return;
    }

    const normalizedUser = normalizeUser(res.user as User);
    setUser(normalizedUser);
    setAuthVerified(true);

    const token = (localStorage.getItem("session_key") || "").trim();
    if (!token) {
      setAuthError("Missing session token");
      setTimeout(redirectToLogin, 1000);
      return;
    }

    const resp = await fetch("/api/doctors/list", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
    });

    console.log(resp)

    if (resp.status === 401) {
      setAuthError("Unauthorized access");
      setTimeout(redirectToLogin, 1200);
      return;
    }

    const list = (await resp.json().catch(() => [])) as any[];
    const arr: Doctor[] = Array.isArray(list) ? list : [];

    console.log(arr)

    // compute initial status with freshest /me
    try {
      const me = await fetchMe().catch(() => null);
      const withStatuses: Doctor[] = arr.map((d) => ({
        ...d,
        requestStatus: me ? computeRequestStatus(d, me) : "none",
      }));
      setDoctors(withStatuses);
    } catch {
      setDoctors(arr.map((d) => ({ ...d, requestStatus: "none" })));
    }
  }, [router]);

  // mount
  useEffect(() => {
    mountedRef.current = true;
    loadEverything();
    return () => {
      mountedRef.current = false;
    };
  }, [loadEverything]);

  // live sync after profile changes & cross-tab
  useEffect(() => {
    const onProfileUpdated = () => {
      if (!mountedRef.current) return;
      refreshStatuses();
    };
    window.addEventListener("profile:updated", onProfileUpdated);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("profile-sync");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "profile-updated") onProfileUpdated();
      };
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user_data") onProfileUpdated();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("profile:updated", onProfileUpdated);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, [refreshStatuses]);

  // refresh status when tab regains focus or becomes visible
  useEffect(() => {
    const onFocus = () => refreshStatuses();
    const onVis = () => {
      if (document.visibilityState === "visible") refreshStatuses();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refreshStatuses]);

  // short polling (~2 minutes) to catch acceptance
  useEffect(() => {
    if (pollTimer.current) return;
    pollStopAt.current = Date.now() + 2 * 60 * 1000;
    pollTimer.current = setInterval(async () => {
      await refreshStatuses();
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
  }, [refreshStatuses]);

  /* ------------------------------- actions -------------------------------- */

  const sendRequest = async (doctorId: number) => {
    if (!user) return;

    if (isBackendConnected && BASE) {
      try {
        const sessionKey = (localStorage.getItem("session_key") || "").trim();
        const resp = await fetch(`${BASE}/users/doctor/request/${doctorId}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${sessionKey}`,
          },
        });
        if (!resp.ok) {
          const t = await resp.text();
          console.error("Request failed", resp.status, t);
          return;
        }
      } catch (e) {
        console.log("sendRequest failed:", e);
        return;
      }
    }

    // Instant UI update
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, requestStatus: "pending" } : d))
    );
    setUser((prev) => {
      if (!prev) return null;
      const sent = new Set(prev.patient_profile?.sent_requests ?? []);
      sent.add(String(doctorId));
      const updated = {
        ...prev,
        patient_profile: {
          ...(prev.patient_profile as NonNullable<User["patient_profile"]>),
          sent_requests: [...sent],
        },
      };
      try {
        const raw = localStorage.getItem("user_data");
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.patient_profile = updated.patient_profile;
        localStorage.setItem("user_data", JSON.stringify(parsed));
        new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeRequest = async (doctorId: number) => {
    if (!user) return;

    if (isBackendConnected) {
      // backend cancel endpoint not present yet
      console.info("Cancel request is not supported by backend yet.");
      return;
    } else {
      // demo: revert to 'none'
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, requestStatus: "none" } : d))
      );
      const raw = localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        const sentArr: string[] = parsed?.patient_profile?.sent_requests ?? [];
        const updated = sentArr.filter((x) => x !== String(doctorId));
        const updatedUser = {
          ...parsed,
          patient_profile: { ...(parsed.patient_profile || {}), sent_requests: updated },
        };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
        setUser(updatedUser);
      }
    }
  };

  /* ---------------------------- filter & sort ---------------------------- */

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const cityOk =
        !searchCity || safeStr(d.location).toLowerCase().includes(searchCity.toLowerCase());
      const term = searchSpecialty.toLowerCase();
      const specOk =
        !term ||
        safeStr(d.specialization).toLowerCase().includes(term) ||
        (d.expertise ?? []).some((x) => safeStr(x).toLowerCase().includes(term));
      return cityOk && specOk;
    });
  }, [doctors, searchCity, searchSpecialty]);

  const sortedDoctors = useMemo(() => {
    const arr = [...filteredDoctors];
    if (filterType === "experience") {
      arr.sort((a, b) => yearsFromExperience(b.experience) - yearsFromExperience(a.experience));
    } else if (filterType === "rating") {
      arr.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (filterType === "specialty") {
      const term = searchSpecialty.toLowerCase();
      if (term) {
        arr.sort((a, b) => {
          const aSpec = safeStr(a.specialization).toLowerCase().includes(term);
          const bSpec = safeStr(b.specialization).toLowerCase().includes(term);
          if (aSpec && !bSpec) return -1;
          if (!aSpec && bSpec) return 1;
          const aCount = (a.expertise ?? []).filter((e) => safeStr(e).toLowerCase().includes(term))
            .length;
          const bCount = (b.expertise ?? []).filter((e) => safeStr(e).toLowerCase().includes(term))
            .length;
          return bCount - aCount;
        });
      } else {
        arr.sort((a, b) => safeStr(a.specialization).localeCompare(safeStr(b.specialization)));
      }
    }
    return arr;
  }, [filteredDoctors, filterType, searchSpecialty]);

  /* ------------------------------- render -------------------------------- */

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
        </div>
      </div>
    );
  }

  if (!authVerified || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleViewProfile = (doctor: Doctor) => {
    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    router.push("/AssociatedPsychologist");
  };

  return (
    <>
      {/* FIXED background layer */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg/patientbg.png')" }}
      />

      {/* Foreground content (scrolls) */}
      <div className="min-h-screen py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-800 mb-1 font-weight-700">
              Welcome, {resolveDisplayName(user)}
            </h1>
            <p className="text-sm sm:text-lg text-blue-600">Choose your support companion</p>
          </div>

          <FiltersBar filterType={filterType} onChange={setFilterType} />

          <SearchInputs
            searchCity={searchCity}
            setSearchCity={setSearchCity}
            searchSpecialty={searchSpecialty}
            setSearchSpecialty={setSearchSpecialty}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {sortedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onViewProfile={handleViewProfile}
                onSendRequest={sendRequest}
                onCancelRequest={removeRequest}
              />
            ))}
          </div>

          {sortedDoctors.length === 0 && (
            <div className="text-center py-6 sm:py-10">
              <p className="text-lg sm:text-xl text-gray-600">
                No doctors found matching your criteria.
              </p>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Try adjusting your search filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import {
  MapPin,
  MessageSquareText,
  GraduationCap,
  Heart,
  Star,
  Compass,
  Sparkles,
  Search,
  BadgeDollarSign,
} from "lucide-react";

/* ------------------------------- types ------------------------------- */

interface PatientProfile {
  level: number;
  associated_psychologist: string | null;
  associated_psychologist_name: string | null;
  sent_requests?: string[];
}

interface DoctorProfile {
  professional_information: {
    specialization: string;
    experience: string | number;
    qualifications: string | string[];
    location?: string;
    expertise?: string[];
    profile_image?: string;
    rating?: number;
    education?: string;
  };
  chatgroup_nickname: string;
  rates: string | number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "patient" | "doctor" | "organization";
  display_name?: string; // prefer this for greetings
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile | null;
}

interface Doctor {
  id: number;
  username: string;
  name: string;
  profile_image: string;
  specialization: string;
  location: string;
  experience: string | number;
  rating: number;
  expertise: string[];
  education: string;
  rates?: string; // NEW: display rates if provided
  requestStatus?: "none" | "pending";
}

/* ------------------------------- config ------------------------------ */

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

/* -------------------------------- utils ------------------------------ */

const safeStr = (v: any) => (v == null ? "" : String(v));
const yearsFromExperience = (exp: unknown): number => {
  if (typeof exp === "number" && Number.isFinite(exp)) return exp;
  const m = String(exp ?? "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

const readUserFromLocalStorage = (): User | null => {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const displayNameOf = (u: User | null) =>
  (u?.display_name && String(u.display_name).trim()) || u?.username || "";

/* ------------------------------ component ---------------------------- */

export default function DoctorsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [filterType, setFilterType] = useState<"experience" | "rating" | "specialty">("experience");
  const [authError, setAuthError] = useState("");
  const [authVerified, setAuthVerified] = useState(false);

  // keep a ref to avoid stale closures in listeners
  const mountedRef = useRef(false);

  // ensure patient_profile exists (defensive for UI)
  const normalizeUser = (u: User): User => {
    if (u?.user_type !== "patient") return u;
    const pp = u.patient_profile ?? null;
    const safe: PatientProfile = {
      level: typeof pp?.level === "number" ? pp.level : 0,
      associated_psychologist: pp?.associated_psychologist ?? null,
      associated_psychologist_name: pp?.associated_psychologist_name ?? null,
      sent_requests: pp?.sent_requests ?? [],
    };
    // pull display_name from localStorage if present (set by /users/profile/ page)
    const raw = localStorage.getItem("user_data");
    let dn = undefined;
    try {
      const parsed = raw ? JSON.parse(raw) : {};
      dn = parsed?.display_name;
    } catch {}
    return { ...u, patient_profile: safe, display_name: dn ?? u.display_name };
  };

  // Initial optimistic user to prevent header flicker
  useEffect(() => {
    const cached = readUserFromLocalStorage();
    if (cached) setUser(normalizeUser(cached));
  }, []);

  // Core loader (auth + doctors list)
  const loadEverything = async () => {
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

    // Always hit local API route
    const resp = await fetch("/api/doctors/list", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
    });

    if (resp.status === 401) {
      setAuthError("Unauthorized access");
      setTimeout(redirectToLogin, 1200);
      return;
    }

    const list = (await resp.json().catch(() => [])) as any[];
    const arr: Doctor[] = Array.isArray(list) ? list : [];

    // apply request statuses using user's sent_requests
    const sentIds = normalizedUser.patient_profile?.sent_requests ?? [];
    const withStatuses: Doctor[] = arr.map((d) => ({
      ...d,
      requestStatus: sentIds.includes(String(d.id)) ? "pending" : "none",
    }));

    setDoctors(withStatuses);
  };

  // mount
  useEffect(() => {
    mountedRef.current = true;
    loadEverything();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* --------------------- live sync after profile changes -------------------- */
  useEffect(() => {
    // 1) Same-tab event fired after successful settings save
    const onProfileUpdated = () => {
      if (!mountedRef.current) return;
      loadEverything();
    };
    window.addEventListener("profile:updated", onProfileUpdated);

    // 2) Cross-tab/channel sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("profile-sync");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "profile-updated") {
          onProfileUpdated();
        }
      };
    } catch {
      // ignore unsupported
    }

    // 3) storage change from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user_data") {
        onProfileUpdated();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("profile:updated", onProfileUpdated);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------- actions -------------------------------- */

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
        if (resp.ok) {
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
                ...(prev.patient_profile as PatientProfile),
                sent_requests: [...sent],
              },
            };
            // sync localStorage for other tabs
            try {
              const raw = localStorage.getItem("user_data");
              const parsed = raw ? JSON.parse(raw) : {};
              parsed.patient_profile = updated.patient_profile;
              localStorage.setItem("user_data", JSON.stringify(parsed));
              new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
            } catch {}
            return updated;
          });
        } else {
          console.warn("sendRequest non-200:", await resp.text());
        }
      } catch (e) {
        console.log("sendRequest failed:", e);
      }
    } else {
      // demo: only update UI/local
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, requestStatus: "pending" } : d))
      );
      const raw = localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        const sent = new Set(parsed?.patient_profile?.sent_requests ?? []);
        sent.add(String(doctorId));
        const updatedUser = {
          ...parsed,
          patient_profile: { ...(parsed.patient_profile || {}), sent_requests: [...sent] },
        };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
        setUser(updatedUser);
      }
    }
  };

  const removeRequest = async (doctorId: number) => {
    if (!user) return;

    if (isBackendConnected) {
      // NOTE: backend method for cancel not yet available (kept as info)
      console.info("Cancel request is not supported by backend yet.");
      return;
    } else {
      // demo
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
          const aCount = (a.expertise ?? []).filter((e) => safeStr(e).toLowerCase().includes(term)).length;
          const bCount = (b.expertise ?? []).filter((e) => safeStr(e).toLowerCase().includes(term)).length;
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

  return (
    <div
      className="min-h-screen py-4 sm:py-8"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-blue-800 mb-1 font-weight-700">
            Welcome, {displayNameOf(user)}
          </h1>
          <p className="text-sm sm:text-lg text-blue-600">
            Choose your support companion
          </p>
        </div>

        {/* filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button
            className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[#1E3CA7] flex items-center gap-1.5 sm:gap-2 border text-xs sm:text-sm ${
              filterType === "experience" ? "bg-white border-blue-300 font-medium" : "bg-white border-gray-200 shadow-sm"
            }`}
            onClick={() => setFilterType("experience")}
          >
            <Compass className={filterType === "experience" ? "w-4 h-4 text-green-600" : "w-4 h-4 text-blue-600"} />
            Sort by Experience
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[#1E3CA7] rounded-full flex items-center gap-1.5 sm:gap-2 border text-xs sm:text-sm ${
              filterType === "rating" ? "bg-white border-yellow-300 font-medium" : "bg-white border-gray-200 shadow-sm"
            }`}
            onClick={() => setFilterType("rating")}
          >
            <Star className="w-4 h-4 text-yellow-500" /> Highest Rated
          </button>
          <button
            className={`px-2 sm:px-4 py-1 sm:py-1.5 text-[#1E3CA7] rounded-full flex items-center gap-1.5 sm:gap-2 border text-xs sm:text-sm ${
              filterType === "specialty" ? "bg-white border-purple-300 font-medium" : "bg-white border-gray-200 shadow-sm"
            }`}
            onClick={() => setFilterType("specialty")}
          >
            <Sparkles className="w-4 h-4 text-blue-500" /> Specialties
          </button>
        </div>

        {/* search */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-7">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by city e.g, Lahore"
              className="pl-9 sm:pl-10 pr-3 sm:pr-4 font-weight-400 py-2 rounded-full bg-[#FFD2DC] border-0 w-full sm:w-64 shadow-sm text-[#444444] text-xs sm:text-sm"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Search className="text-[#444444] absolute left-2 sm:left-3 top-2.5 w-4 h-4" />
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by specialties e.g, CBT"
              className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 font-weight-400 rounded-full bg-[#FFD2DC] border-0 w-full sm:w-64 shadow-sm text-[#444444] text-xs sm:text-sm"
              value={searchSpecialty}
              onChange={(e) => setSearchSpecialty(e.target.value)}
            />
            <Search className="text-[#444444] absolute left-2 sm:left-3 top-2.5 w-4 h-4" />
          </div>
        </div>

        {/* doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {sortedDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white bg-opacity-95 rounded-xl p-3 sm:p-6 shadow border-0 min-h-[280px] sm:h-[300px] flex flex-col"
            >
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="rounded-full overflow-hidden w-12 sm:w-20 h-12 sm:h-20 border-2 border-blue-200 flex-shrink-0 bg-blue-50">
                  <Image
                    src={doctor.profile_image}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-xl font-bold text-blue-800 font-weight-700">
                    {doctor.name}
                  </h3>
                  <p className="text-blue-600 font-weight-400 text-xs sm:text-base">
                    {doctor.specialization}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="ml-1 font-medium text-gray-700 font-weight-400 text-xs sm:text-base">
                      {Number(doctor.rating || 0).toFixed(1)} Rating
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-3 text-gray-700 text-xs sm:text-sm font-weight-400">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Location: {doctor.location || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MessageSquareText className="w-4 h-4 text-gray-600" />
                  <span>Experience: {safeStr(doctor.experience) || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="truncate">{doctor.education || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="truncate">
                    Expertise: {(doctor.expertise ?? []).join(", ") || "—"}
                  </span>
                </div>
                {doctor.rates && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-green-600" />
                    <span>Rates: {doctor.rates}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-2 sm:pt-4 flex flex-col items-center">
                {doctor.requestStatus === "pending" && (
                  <div className="mb-2 sm:mb-3 flex justify-center items-center gap-1.5 sm:gap-2 font-weight-700 text-[#1E3CA7] text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-[#1E3CA7]" /> Status: Pending Request
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full">
                  <PrimaryButton
                    text="View Profile"
                    onClick={() => {
                      localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
                      router.push("/AssociatedPsychologist");
                    }}
                    className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
                  />
                  {doctor.requestStatus === "pending" ? (
                    <SecondaryButton
                      text="Cancel Request"
                      onClick={() => removeRequest(doctor.id)}
                      className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold font-weight-700"
                    />
                  ) : (
                    <SecondaryButton
                      text="Send Request"
                      onClick={() => sendRequest(doctor.id)}
                      className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedDoctors.length === 0 && (
          <div className="text-center py-6 sm:py-10">
            <p className="text-lg sm:text-xl text-gray-600">No doctors found matching your criteria.</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

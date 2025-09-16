"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";

interface PatientProfile {
  level: number;
  associated_psychologist: string | null;
  associated_psychologist_name: string | null;
}
interface DoctorProfile {
  professional_information: {
    specialization: string;
    experience: string;
    qualifications: string;
  };
  chatgroup_nickname: string;
  rates: string;
}
interface OrganizationProfile {
  name: string;
  total_psychologists: number;
  total_patients: number;
  sessions_today: number;
  new_join_requests: number;
  todays_sessions: { doctor: string; therapy_type: string; time: string }[];
}
export interface User {
  id: number;
  username?: string;              // sometimes comes nested as user.username
  email?: string;
  user_type?: "patient" | "doctor" | "organization";
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile;
  organization_profile?: OrganizationProfile;
  // allow unknown extra fields (for nested shapes)
  [key: string]: any;
}

/** Try to pull a username from multiple possible shapes. */
function extractUsername(u: any): string | null {
  if (!u) return null;
  // common shapes
  if (typeof u.username === "string" && u.username.trim()) return u.username.trim();
  if (u.user && typeof u.user.username === "string" && u.user.username.trim()) {
    return u.user.username.trim();
  }
  // occasionally APIs only give email
  const email = u.email || u.user?.email;
  if (typeof email === "string" && email.includes("@")) {
    return email.split("@")[0];
  }
  return null;
}

/** Try localStorage "user" (as saved by your login page) */
function getUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** Fetch /users/user/ with token if we still don't have username */
async function fetchUserFromAPI(): Promise<User | null> {
  const base = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL?.replace(/\/+$/, "") || "";
  const token = localStorage.getItem("token");
  if (!base || !token) return null;

  try {
    const resp = await fetch(`${base}/users/user/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as User;
    return data || null;
  } catch {
    return null;
  }
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 1) Primary: your existing auth bootstrap
        const authResult = await checkAuth();

        if (!authResult.isAuthenticated) {
          setAuthError(authResult.error || "Authentication failed");
          setTimeout(() => redirectToLogin(), 600);
          return;
        }

        let u: User | null = (authResult.user as User) ?? null;

        // 2) Normalize patient payloads only (keep your existing contract)
        if (u?.user_type === "patient") {
          const pp = (u as any).patient_profile ?? null;
          const safeProfile: PatientProfile = {
            level: typeof pp?.level === "number" ? pp.level : 0,
            associated_psychologist: pp?.associated_psychologist ?? null,
            associated_psychologist_name: pp?.associated_psychologist_name ?? null,
          };
          u = { ...u, patient_profile: safeProfile };
        } else if (u) {
          // strip unexpected nested patient_profile for non-patients
          const { patient_profile, ...rest } = u as any;
          u = rest as User;
        }

        // 3) If username is still missing/empty, try API and then localStorage
        let name = extractUsername(u);
        if (!name) {
          const apiUser = await fetchUserFromAPI();
          if (apiUser) {
            u = { ...apiUser, ...(u || {}) }; // prefer API fields if present
            name = extractUsername(u);
          }
        }
        if (!name) {
          const stored = getUserFromStorage();
          if (stored) {
            // Do not overwrite server roles with storage, just pull username/email
            const merged = { ...(u || {}), username: stored.username ?? u?.username, email: stored.email ?? u?.email };
            u = merged;
            name = extractUsername(merged);
          }
        }

        setUser(u);
      } catch (e) {
        console.error("Header auth resolve failed:", e);
        setAuthError("Authentication failed");
        setTimeout(() => redirectToLogin(), 600);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Loading shimmer
  if (loading) {
    return (
      <div className="bg-[#CDD2F4] border-2 border-[#2196F3] p-6 rounded-[28px] min-h-28 font-quicksand shadow-sm">
        <div className="flex flex-col justify-center text-center md:text-left w-full">
          <div className="h-6 w-48 bg-white/70 rounded mb-2" />
          <div className="h-4 w-64 bg-white/60 rounded" />
        </div>
        <div className="flex items-end justify-center md:justify-end mt-4 md:mt-0">
          <div className="h-5 w-40 bg-white/60 rounded" />
        </div>
      </div>
    );
  }

  // If unauthenticated, briefly show neutral header before redirect
  if (authError || !user) {
    return (
      <div className="bg-[#EEE7FD] border border-[#D1D5DB] p-6 rounded-[28px] flex flex-col md:flex-row justify-between items-center md:items-stretch min-h-28 font-quicksand">
        <div className="flex flex-col justify-center text-center md:text-left">
          <h2 className="text-2xl font-bold text-heading">Welcome back</h2>
          <p className="text-md text-heading">Your AI Assistant is here to support you.</p>
        </div>
        <div className="flex items-end justify-center md:justify-end mt-4 md:mt-0">
          <div className="text-heading font-semibold flex items-center space-x-2">
            <span className="text-lg">⚪</span>
            <span>Status: Checking auth…</span>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 Prefer username explicitly; never show placeholder "user"
  const displayName =
    extractUsername(user) ||
    "friend"; // ultra-safe fallback (won’t show literal "user")

  return (
    <div className="bg-[#EEE7FD] border border-[#D1D5DB] p-6 rounded-[28px] flex flex-col md:flex-row justify-between items-center md:items-stretch min-h-28 font-quicksand">
      {/* Left Column */}
      <div className="flex flex-col justify-center text-center md:text-left">
        <h2 className="text-2xl font-bold text-heading">
          Welcome back, {displayName}
        </h2>
        <p className="text-md text-heading">Your AI Assistant is here to support you.</p>
      </div>

      {/* Right Column */}
      <div className="flex items-end justify-center md:justify-end mt-4 md:mt-0">
        <div className="text-heading font-semibold flex items-center space-x-2">
          <span className="text-lg">🟢</span>
          <span>Status: AI Buddy – Online</span>
        </div>
      </div>
    </div>
  );
}

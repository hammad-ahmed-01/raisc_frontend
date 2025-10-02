"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  username?: string;
  email?: string;
  user_type?: "patient" | "doctor" | "organization";
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile;
  organization_profile?: OrganizationProfile;
  [key: string]: any;
}

function extractUsername(u: any): string | null {
  if (!u) return null;
  if (typeof u.username === "string" && u.username.trim()) return u.username.trim();
  if (u.user && typeof u.user.username === "string" && u.user.username.trim()) return u.user.username.trim();
  const email = u.email || u.user?.email;
  if (typeof email === "string" && email.includes("@")) return email.split("@")[0];
  return null;
}

function getUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

async function fetchUserFromAPI(): Promise<User | null> {
  const base = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL?.replace(/\/+$/, "") || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!base || !token) return null;

  try {
    const resp = await fetch(`${base}/users/user/`, {
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      cache: "no-store",
    });
    if (!resp.ok) return null;
    return (await resp.json()) as User;
  } catch {
    return null;
  }
}

function MobileTopBar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 h-14 bg-[#CDD2F4] border-b border-[#2196F3] shadow-sm">
        {/* Hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-md active:scale-95 transition"
          onClick={onOpenSidebar}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#1E3CA7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Center: Robo + RAISC */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image src="/mini-robo.svg" alt="RAISC bot" fill className="object-contain drop-shadow-sm" priority />
          </div>
          <span className="text-heading2 font-extrabold text-xl tracking-wide">RAISC</span>
        </div>

        {/* Online status */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🟢</span>
          <span className="text-heading font-semibold">Online</span>
        </div>
      </div>
    </header>
  );
}

export default function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const authResult = await checkAuth();
        if (!authResult.isAuthenticated) {
          setAuthError(authResult.error || "Authentication failed");
          setTimeout(() => redirectToLogin(), 600);
          return;
        }
        let u: User | null = (authResult.user as User) ?? null;

        if (u?.user_type === "patient") {
          const pp = (u as any).patient_profile ?? null;
          u = {
            ...u,
            patient_profile: {
              level: typeof pp?.level === "number" ? pp.level : 0,
              associated_psychologist: pp?.associated_psychologist ?? null,
              associated_psychologist_name: pp?.associated_psychologist_name ?? null,
            },
          };
        } else if (u) {
          const { patient_profile, ...rest } = u as any;
          u = rest as User;
        }

        let name = extractUsername(u);
        if (!name) {
          const apiUser = await fetchUserFromAPI();
          if (apiUser) {
            u = { ...apiUser, ...(u || {}) };
          }
        }
        if (!name) {
          const stored = getUserFromStorage();
          if (stored) {
            const merged = { ...(u || {}), username: stored.username ?? u?.username, email: stored.email ?? u?.email };
            u = merged;
          }
        }
        setUser(u);
      } catch {
        setAuthError("Authentication failed");
        setTimeout(() => redirectToLogin(), 600);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <>
        <MobileTopBar onOpenSidebar={onOpenSidebar} />
        <div className="hidden md:block bg-[#CDD2F4] border-2 border-[#2196F3] p-6 rounded-[28px] min-h-28 font-quicksand shadow-sm">
          <div className="h-6 w-48 bg-white/70 rounded mb-2" />
          <div className="h-4 w-64 bg-white/60 rounded" />
        </div>
      </>
    );
  }

  if (authError || !user) {
    return (
      <>
        <MobileTopBar onOpenSidebar={onOpenSidebar} />
        <div className="hidden md:flex bg-[#EEE7FD] border border-[#D1D5DB] p-6 rounded-[28px] justify-between items-center min-h-28 font-quicksand">
          <div>
            <h2 className="text-2xl font-bold text-heading">Welcome back</h2>
            <p className="text-md text-heading">Your AI Assistant is here to support you.</p>
          </div>
          <div className="text-heading font-semibold flex items-center space-x-2">
            <span className="text-lg">⚪</span>
            <span>Status: Checking auth…</span>
          </div>
        </div>
      </>
    );
  }

  const displayName = extractUsername(user) || "friend";
  return (
    <>
      <MobileTopBar onOpenSidebar={onOpenSidebar} />
      <div className="hidden md:flex bg-[#EEE7FD] border border-[#D1D5DB] p-6 rounded-[28px] justify-between items-center min-h-28 font-quicksand">
        <div>
          <h2 className="text-2xl font-bold text-heading">Welcome back, {displayName}</h2>
          <p className="text-md text-heading">Your AI Assistant is here to support you.</p>
        </div>
        <div className="text-heading font-semibold flex items-center space-x-2">
          <span className="text-lg">🟢</span>
          <span>Status: AI Buddy – Online</span>
        </div>
      </div>
    </>
  );
}

// app/AssociatedPsychologist/page.tsx
"use client";

import TopRightIcons from "@/components/TopRightIcons";
import Psychologist from "./components/Psychologist";
import Association from "./components/Association";
import { useEffect, useState, useRef, useMemo } from "react";
import { checkAuth, redirectToLogin, fetchMe } from "@/lib/auth";

/* ----------------------------- types ----------------------------- */

type UserType = "patient" | "doctor" | "organization";

interface PatientProfile {
  level: number;
  associated_psychologist: string | null;
  associated_psychologist_name: string | null;
  profile_data?: Record<string, unknown> | null;
}

interface DoctorPI {
  specialization?: string;
  experience?: string | number;
  display_name?: string;
  location?: string;
  education?: string;
  expertise?: string[] | string;
  description?: string;
  profile_image?: string;
  rating?: number | string;
  [k: string]: unknown;
}
interface DoctorProfile {
  professional_information?: DoctorPI | null;
  chatgroup_nickname?: string;
  rates?: string | number | null;
}

interface OrganizationProfile {
  name: string;
  total_psychologists: number;
  total_patients: number;
  sessions_today: number;
  new_join_requests: number;
  todays_sessions: { doctor: string; therapy_type: string; time: string }[];
}

interface UserShape {
  id: number;
  username: string;
  email: string;
  user_type: UserType;
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile | null;
  organization_profile?: OrganizationProfile | null;
}

/* --------------------------- component --------------------------- */

export default function NewPatientHome() {
  const [user, setUser] = useState<UserShape | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const refreshingRef = useRef(false);

  // normalize like your dashboard code
  const normalizeUser = (u: UserShape): UserShape => {
    if (u.user_type === "patient") {
      const pp = u.patient_profile ?? ({} as Partial<PatientProfile>);
      const safe: PatientProfile = {
        level: typeof pp.level === "number" ? pp.level : 0,
        associated_psychologist: (pp.associated_psychologist ?? null) as string | null,
        associated_psychologist_name: (pp.associated_psychologist_name ?? null) as string | null,
        profile_data: (pp.profile_data ?? null) as Record<string, unknown> | null,
      };
      return { ...u, patient_profile: safe };
    }
    const { patient_profile, ...rest } = u as any;
    return rest as UserShape;
  };

  const refreshUser = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const me = (await fetchMe()) as unknown as UserShape | null;
      if (me) setUser(normalizeUser(me));
    } finally {
      refreshingRef.current = false;
    }
  };

  // derived display name identical in spirit to your dashboard file
  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.user_type === "doctor") {
      return (
        user.doctor_profile?.professional_information?.display_name ||
        user.username
      );
    }
    if (user.user_type === "patient") {
      const pd = (user.patient_profile?.profile_data ?? {}) as Record<string, unknown>;
      return (pd?.display_name as string) || user.username;
    }
    if (user.user_type === "organization") {
      return user.organization_profile?.name || user.username;
    }
    return user.username;
  }, [user]);

  useEffect(() => {
    (async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => redirectToLogin(), 2000);
        return;
      }

      // Doctors cannot access this page
      if (authResult.user?.user_type === "doctor") {
        setAuthError("Doctors cannot access the Associated Psychologist page");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
        return;
      }

      // load canonical user (prevents stale local state)
      await refreshUser();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !user) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-6 sm:py-10 px-2 sm:px-4"
      style={{ backgroundImage: "url('/bg/patientbg.png')" }}
    >
      <TopRightIcons />

      <div className="relative min-h-screen py-6 sm:py-10 px-2 sm:px-4 z-10 pt-12 sm:pt-16">
        <h1 className="text-heading text-xl sm:text-4xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)] text-center">
          Welcome back, {displayName}
        </h1>
        <p className="text-center text-sm sm:text-xl text-heading2 mt-2 px-2">
          {"Healing takes time, asking for help is a courageous step"}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-6 sm:mt-10 ml-0 sm:ml-20">
          <Psychologist />
          <Association />
        </div>
      </div>
    </div>
  );
}

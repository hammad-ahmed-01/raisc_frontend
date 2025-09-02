"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin, fetchMe } from "@/lib/auth";
import DoctorDashboard from "@/components/DoctorDashboard/page";
import PatientDashboard from "@/components/PatientDashboards/RegularPatient/page";
import ReturningPatientDashboard from "@/components/PatientDashboards/ReturningPatient/page";
import NewPatientDashboard from "@/components/PatientDashboards/NewPatient/page";
import OrganizationDashboard from "@/components/OrganizationDashboard/page";

/* ----------------------------- types ----------------------------- */

interface PatientProfile {
  level: number;
  associated_psychologist: string | null;
  associated_psychologist_name: string | null;
  // we read display_name from profile_data when present
  profile_data?: Record<string, any> | null;
}

interface DoctorProfile {
  professional_information?: {
    specialization?: string;
    experience?: string;
    qualifications?: string;
    /** we prefer this as the "name" shown across dashboards */
    display_name?: string;
    location?: string;
    [k: string]: any;
  } | null;
  chatgroup_nickname?: string;
  rates?: string;
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
  username: string;
  email: string;
  user_type: "patient" | "doctor" | "organization";
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile | null;
  organization_profile?: OrganizationProfile | null;
}

/* --------------------------- component --------------------------- */

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const router = useRouter();

  // keep a stable ref to avoid racing updates
  const refreshingRef = useRef<boolean>(false);

  // central refresh that always hits backend canonical /users/user/
  const refreshUser = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const me = await fetchMe(); // pulls fresh user + refreshes localStorage
      if (me) setUser(normalizeUser(me));
    } finally {
      refreshingRef.current = false;
    }
  };

  // normalize so we always have safe patient_profile shape and no stale junk
  const normalizeUser = (u: User): User => {
    if (u.user_type === "patient") {
      const pp = u.patient_profile ?? ({} as PatientProfile);
      const safe: PatientProfile = {
        level: typeof pp?.level === "number" ? pp.level : 0,
        associated_psychologist: pp?.associated_psychologist ?? null,
        associated_psychologist_name: pp?.associated_psychologist_name ?? null,
        profile_data: pp?.profile_data ?? null,
      };
      return { ...u, patient_profile: safe };
    }
    // strip patient_profile for non-patients to avoid accidental UI reads
    const { patient_profile, ...rest } = u as any;
    return rest as User;
  };

  // derive a friendly display name that reflects profile edits
  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.user_type === "doctor") {
      return (
        user.doctor_profile?.professional_information?.display_name ||
        user.username
      );
    }
    if (user.user_type === "patient") {
      const pd = user.patient_profile?.profile_data || {};
      return (pd?.display_name as string) || user.username;
    }
    if (user.user_type === "organization") {
      return user.organization_profile?.name || user.username;
    }
    return user.username;
  }, [user]);

  /* --------------------------- first load --------------------------- */
  useEffect(() => {
    (async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => redirectToLogin(), 1000);
        return;
      }
      // fetch canonical user (ensures we have latest after server updates)
      await refreshUser();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* ---------------------- live sync mechanisms ---------------------- */

  useEffect(() => {
    // 1) refetch when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshUser();
    };
    document.addEventListener("visibilitychange", onVisible);

    // 2) refetch if session/user_data changes in localStorage (e.g., other tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "session_key") {
        refreshUser();
      }
    };
    window.addEventListener("storage", onStorage);

    // 3) listen for a custom window event fired by settings page after saves
    const customHandler = () => refreshUser();
    window.addEventListener("profile:updated", customHandler as EventListener);

    // 4) cross-tab BroadcastChannel (optional, low overhead)
    const bc = new BroadcastChannel("profile-sync");
    bc.onmessage = (msg) => {
      if (msg?.data?.type === "profile-updated") refreshUser();
    };

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("profile:updated", customHandler as EventListener);
      bc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ views ----------------------------- */

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  // Non-patient dashboards first
  if (user.user_type === "doctor") {
    // pass along a derived displayName so the child can use it if it prefers
    return <DoctorDashboard user={{ ...user, username: displayName }} />;
  }
  if (user.user_type === "organization") {
    return <OrganizationDashboard user={{ ...user, username: displayName }} />;
  }

  // Patient dashboards by level
  const level = user.patient_profile?.level ?? 0;
  if (level === 0) return <NewPatientDashboard user={{ ...user, username: displayName }} />;
  if (level === 1) return <ReturningPatientDashboard user={{ ...user, username: displayName }} />;
  if (level === 2) return <PatientDashboard user={{ ...user, username: displayName }} />;

  // Fallback view
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Welcome, {displayName}!
      </h1>
      <p className="text-center text-gray-600">Email: {user.email}</p>
    </div>
  );
}

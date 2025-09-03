// app/dashboard/page.tsx
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

export interface UserShape {
  id: number;
  username: string;
  email: string;
  user_type: UserType;
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile | null;
  organization_profile?: OrganizationProfile | null;
}

/* --------------------------- component --------------------------- */

export default function Dashboard() {
  const [user, setUser] = useState<UserShape | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const router = useRouter();

  // avoid overlapping refreshes
  const refreshingRef = useRef(false);

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
    const { patient_profile, ...rest } = u as any; // strip to avoid accidental reads
    return rest as UserShape;
  };

  // canonical refresh from backend
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

  // derived display name for header/children
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

  /* --------------------------- first load --------------------------- */
  useEffect(() => {
    (async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => redirectToLogin(), 1000);
        return;
      }
      await refreshUser();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* ---------------------- live sync mechanisms ---------------------- */
  useEffect(() => {
    // 1) refetch when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };
    document.addEventListener("visibilitychange", onVisible);

    // 2) refetch if session/user_data changes in localStorage (e.g., other tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "session_key") {
        void refreshUser();
      }
    };
    window.addEventListener("storage", onStorage);

    // 3) listen for a custom window event fired by settings page after saves
    const customHandler = () => void refreshUser();
    window.addEventListener("profile:updated", customHandler as EventListener);

    // 4) cross-tab BroadcastChannel, guarded for unsupported browsers
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("profile-sync");
      bc.onmessage = (msg: MessageEvent) => {
        const data = (msg?.data ?? {}) as { type?: string };
        if (data.type === "profile-updated") void refreshUser();
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("profile:updated", customHandler as EventListener);
      if (bc) bc.close();
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

  // pass a safe object to children (some of them might expect slightly different shapes)
  const childUser = { ...user, username: displayName } as unknown as any;

  if (user.user_type === "doctor") {
    return <DoctorDashboard user={childUser} />;
  }
  if (user.user_type === "organization") {
    return <OrganizationDashboard user={childUser} />;
  }

  const level = user.patient_profile?.level ?? 0;
  if (level === 0) return <NewPatientDashboard user={childUser} />;
  if (level === 1) return <ReturningPatientDashboard user={childUser} />;
  if (level === 2) return <PatientDashboard user={childUser} />;

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

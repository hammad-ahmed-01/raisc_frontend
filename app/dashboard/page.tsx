"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/auth";
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

  const refreshingRef = useRef(false);

  // Normalize fetched user
  const normalizeUser = (u: UserShape): UserShape => {
    if (u.user_type === "patient") {
      const pp = u.patient_profile ?? ({} as Partial<PatientProfile>);
      return {
        ...u,
        patient_profile: {
          level: typeof pp.level === "number" ? pp.level : 0,
          associated_psychologist: pp.associated_psychologist ?? null,
          associated_psychologist_name: pp.associated_psychologist_name ?? null,
          profile_data: pp.profile_data ?? null,
        },
      };
    }
    return u;
  };

  // Fetch user from backend
  const refreshUser = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const token = localStorage.getItem("session_key");
      if (!token) {
        setAuthError("No authentication token found. Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const me = (await fetchMe()) as unknown as UserShape | null;
      if (me) setUser(normalizeUser(me));
      else {
        setAuthError("Session expired. Please log in again.");
        setTimeout(() => router.push("/login"), 1500);
      }
    } finally {
      refreshingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    refreshUser();
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.user_type === "doctor")
      return (
        user.doctor_profile?.professional_information?.display_name ||
        user.username
      );
    if (user.user_type === "patient") {
      const pd = (user.patient_profile?.profile_data ?? {}) as Record<
        string,
        unknown
      >;
      return (pd?.display_name as string) || user.username;
    }
    if (user.user_type === "organization")
      return user.organization_profile?.name || user.username;
    return user.username;
  }, [user]);

  /* ------------------------------ views ----------------------------- */
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  if (!user)
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;

  const childUser = { ...user, username: displayName } as unknown as any;

  // Conditional Rendering
  if (user.user_type === "doctor") {
    const DashboardComponent = DoctorDashboard as React.ComponentType<any>;
    return <DashboardComponent user={childUser} />;
  }

  if (user.user_type === "organization") {
    const OrgDashboard = OrganizationDashboard as React.ComponentType<any>;
    return <OrgDashboard user={childUser} />;
  }

  if (user.user_type === "patient") {
    const level = user.patient_profile?.level ?? 0;
    if (level === 0) {
      const NewDash = NewPatientDashboard as React.ComponentType<any>;
      return <NewDash user={childUser} />;
    }
    if (level === 1) {
      const ReturningDash = ReturningPatientDashboard as React.ComponentType<any>;
      return <ReturningDash user={childUser} />;
    }
    const RegularDash = PatientDashboard as React.ComponentType<any>;
    return <RegularDash user={childUser} />;
  }

  // Fallback
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Welcome, {displayName}!
      </h1>
      <p className="text-center text-gray-600">Email: {user.email}</p>
    </div>
  );
}

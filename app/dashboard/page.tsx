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

  // Create mock organization user for direct access
  const createMockOrganizationUser = (): UserShape => {
    return {
      id: 1,
      username: "Demo Organization",
      email: "demo@org.com",
      user_type: "organization",
      organization_profile: {
        name: "Pakistan Institute of Mental Health",
        total_psychologists: 10,
        total_patients: 30,
        sessions_today: 4,
        new_join_requests: 2,
        todays_sessions: [
          {
            doctor: "Dr. Ali Hamza",
            therapy_type: "Cognitive Therapy",
            time: "9:00 AM",
          },
          {
            doctor: "Dr. Alisha",
            therapy_type: "Cognitive Therapy",
            time: "11:00 AM",
          },
          {
            doctor: "Dr. Sara Ali",
            therapy_type: "Cognitive Therapy",
            time: "10:00 AM",
          },
          { 
            doctor: "Dr. Zahra", 
            therapy_type: "Cognitive Therapy", 
            time: "3:00 PM" 
          },
        ],
      }
    };
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
    // Bypass authentication and directly set organization user
    const mockUser = createMockOrganizationUser();
    setUser(mockUser);
    
    // Also store in localStorage to maintain consistency
    localStorage.setItem("session_key", "mock-org-token-12345");
    localStorage.setItem("user_data", JSON.stringify(mockUser));
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
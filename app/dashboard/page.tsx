"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import DoctorDashboard from "@/components/DoctorDashboard/page";
import PatientDashboard from "@/components/PatientDashboards/RegularPatient/page";
import ReturningPatientDashboard from "@/components/PatientDashboards/ReturningPatient/page";
import NewPatientDashboard from "@/components/PatientDashboards/NewPatient/page";
import OrganizationDashboard from "@/components/OrganizationDashboard/page";

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
  username: string;
  email: string;
  user_type: string;
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile;
  organization_profile?: OrganizationProfile;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();

      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => redirectToLogin(), 1000);
        return;
      }

      // ✅ Normalize: always ensure patient has a level (default 0)
      const u = authResult.user as User;
      let normalized: User = { ...u };

      if (u?.user_type === "patient") {
        const pp = u.patient_profile ?? null;
        const safeProfile: PatientProfile = {
          level: typeof pp?.level === "number" ? pp.level : 0,
          associated_psychologist: pp?.associated_psychologist ?? null,
          associated_psychologist_name: pp?.associated_psychologist_name ?? null,
        };
        normalized = { ...u, patient_profile: safeProfile };
      }

      setUser(normalized);
    };

    performAuthCheck();
  }, [router]);

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

  // ===== Patient dashboards by level (now safe) =====
  if (user.user_type === "patient" && (user.patient_profile?.level ?? 0) === 0) {
    return <NewPatientDashboard user={user} />;
  }
  if (user.user_type === "patient" && user.patient_profile?.level === 1) {
    return <ReturningPatientDashboard user={user} />;
  }
  if (user.user_type === "patient" && user.patient_profile?.level === 2) {
    return <PatientDashboard user={user} />;
  }

  // ===== Others =====
  if (user.user_type === "doctor") {
    return <DoctorDashboard user={user} />;
  }
  if (user.user_type === "organization") {
    return <OrganizationDashboard user={user} />;
  }

  // Fallback (kept minimal; no unsafe .level access)
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Welcome, {user.username}!
      </h1>
      <p className="text-center text-gray-600">Email: {user.email}</p>
    </div>
  );
}

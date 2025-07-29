"use client";
import { useEffect, useState } from "react";
import DoctorMyAccount from "@/components/DoctorSettings/Account/MyAccount";
import PatientMyAccount from "@/components/PatientSettings/Account/MyAccount";
import OrganizationMyAccount from "@/components/OrganizationSettings/Account/MyAccount";
import { checkAuth, redirectToLogin } from "@/lib/auth";

export interface Doctor {
  id: number;
  username: string;
  email: string;
  user_type: string;
  display_name?: string;
  phone?: string;
  last_login?: string;
  member_since?: string;
  rating?: number;
  organization?: string;
  location?: string;
  patients_assigned?: number;
  qualifications?: string[];
  university?: string;
  graduation_year?: string;
  emailVerified?: string; // Added email verification status
}

export interface Patient {
  displayName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  lastLogin: string;
  therapyFocus: string;
  sessionsCompleted: number;
  lastSession: string;
}

export interface Organization {
  organization_name: string;
  description: string;
  logo_url?: string;
  contact_email: string;
  contact_numbers: string[];
  location: string;
  linkedin?: string;
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userTypeS, setUserTypeS] = useState<string>("");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const isBackendConnected =
    process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication required");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }
      setAuthVerified(true);
    };
    performAuthCheck();
  }, []);

  useEffect(() => {
    // Get user type from localStorage
    const fetchUserData = async () => {
      setLoading(true);

      let userDataRaw = localStorage.getItem("user_data");
      let userData = userDataRaw ? JSON.parse(userDataRaw) : {};
      const userType = userData ? userData.user_type : "doctor";
      setUserTypeS(userType);

      if (isBackendConnected) {
        try {
          const sessionKey = localStorage.getItem("session_key");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/${userType}/profile/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${sessionKey}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (userType === "doctor") {
              setDoctor(data);
            } else if (userType === "patient") {
              setPatient(data);
            } else if (userType === "organization") {
              setOrganization(data);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (userType === "doctor") {
            const data = getDummyDoctor();
            setDoctor(data);
          } else if (userType === "patient") {
            const data = getDummyPatient();
            setPatient(data);
          } else if (userType === "organization") {
            const data = getDummyOrganization();
            setOrganization(data);
          }
        }
      } else {
        // Use dummy data when backend is not connected
        if (userType === "doctor") {
          const data = getDummyDoctor();
          setDoctor(data);
        } else if (userType === "patient") {
          const data = getDummyPatient();
          setPatient(data);
        } else if (userType === "organization") {
          const data = getDummyOrganization();
          setOrganization(data);
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, [isBackendConnected]);

  const getDummyPatient = (): Patient => {
    return {
      displayName: "Ayesha Khan",
      username: "ayesha_khan22",
      email: "ayesha.khan22@example.com",
      emailVerified: true,
      lastLogin: "19 July, 2025",
      therapyFocus: "Anxiety & Stress Management",
      sessionsCompleted: 12,
      lastSession: "15 July, 2025",
    };
  };

  const getDummyDoctor = (): Doctor => {
    return {
      id: 1,
      username: "Ali_Hamza123",
      email: "AliHamza123@gmail.com",
      emailVerified: "✓ Verified",
      display_name: "Dr. Ali Hamza",
      user_type: "doctor",
      phone: "+92 300 1234567",
      last_login: "17 July, 2025",
      member_since: "Mar, 2024",
      rating: 4.7,
      organization: "Pakistan Institute of Mental Health (PIMH)",
      location: "Rawalpindi, Pakistan",
      patients_assigned: 8,
      qualifications: [
        "MSc in Clinical Psychology",
        "Certified CBT Therapist",
      ],
      university: "University of XYZ",
      graduation_year: "2021-2023",
    };
  };

  const getDummyOrganization = (): Organization => ({
    organization_name: "Pakistan Institute Of Mental Health",
    description: "Pakistan Institute Of Mental Health..........",
    logo_url: "/org-logo.png",
    contact_email: "info@pimh.org",
    contact_numbers: ["+92300-xxxxxxx", "+92300-xxxxxxx"],
    location: "Rawalpindi, Pakistan",
    linkedin: "linkedin.com",
  });

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  if (!authVerified || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!doctor && !patient && !organization) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">Error loading user data</div>
      </div>
    );
  }

  if (userTypeS === "doctor" && doctor) {
    return <DoctorMyAccount doctor={doctor} />;
  }

  if (userTypeS === "patient" && patient) {
    return <PatientMyAccount patient={patient} />;
  }

  if (userTypeS === "organization" && organization) {
    return <OrganizationMyAccount organization={organization} />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-xl text-red-600">Error loading user data</div>
    </div>
  );
}
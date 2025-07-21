"use client";
import { useEffect, useState } from "react";
import DoctorMyAccount from "@/components/DoctorSettings/Account/MyAccount";
import PatientMyAccount from "@/components/PatientSettings/Account/MyAccount";

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

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [userTypeS, setUserTypeS] = useState<string>("");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  const isBackendConnected =
    process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";



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
            } else {
              setPatient(data);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (userType === "doctor") {
            const data = getDummyDoctor();
            setDoctor(data);
          } else {
            const data = getDummyPatient();
            setPatient(data);
          }
        }
      } else {
        // Use dummy data when backend is not connected
        if (userType === "doctor") {
          const data = getDummyDoctor();
          setDoctor(data);
        } else {
          const data = getDummyPatient();
          setPatient(data);
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
  }

  const getDummyDoctor = ():Doctor=> {
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
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }


  if (!doctor && !patient) {
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

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-xl text-red-600">Error loading user data</div>
    </div>
  );
}
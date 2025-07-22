"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import DoctorDashboard from "@/components/DoctorDashboard/page";
import PatientDashboard from "@/components/PatientDashboards/RegularPatient/page";
import ReturningPatientDashboard from "@/components/PatientDashboards/ReturningPatient/page";
import NewPatientDashboard from "@/components/PatientDashboards/NewPatient/page";

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

export interface User {
    id: number;
    username: string;
    email: string;
    user_type: string;
    patient_profile?: PatientProfile;
    doctor_profile?: DoctorProfile;
}

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [authError, setAuthError] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const hasReloaded = sessionStorage.getItem("hasReloaded");

        if (!hasReloaded) {
            sessionStorage.setItem("hasReloaded", "true");
            window.location.reload();
        } else {
            const performAuthCheck = async () => {
                const authResult = await checkAuth();

                if (!authResult.isAuthenticated) {
                    setAuthError(authResult.error || "Authentication failed");
                    setTimeout(() => {
                        redirectToLogin();
                    }, 2000);
                    return;
                }

                setUser(authResult.user);
            };

            performAuthCheck();
        }
    }, [router]);

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
        return <p className="text-center text-gray-600 mt-10">Loading...</p>; // **New Patient (Level 0) - Immersive Experience**
    if (user.user_type === "patient" && user.patient_profile?.level === 0) {
        return <NewPatientDashboard user={user} />;
    }

    // **Returning Patient (Level 1) - Calm & Reassuring**
    if (user.user_type === "patient" && user.patient_profile?.level === 1) {
        return <ReturningPatientDashboard user={user} />;
    }

    // ** Regular Patient (Level 2) - Calm & Reassuring**
    if (user.user_type === "patient" && user.patient_profile?.level === 2) {
        return <PatientDashboard user={user} />;
    }

    // **Returning Patient (Level 1) - Calm & Reassuring**
    if (user.user_type === "doctor") {
        return <DoctorDashboard user={user} />;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
                Welcome, {user.username}!
            </h1>
            <p className="text-center text-gray-600">Email: {user.email}</p>
            {/* Level 2+ Patient Dashboard (Structured & Engaged) */}
            {user.user_type === "patient" &&
                user.patient_profile !== undefined &&
                user.patient_profile.level > 1 && <PatientDashboard user={user} />}

            {/* Doctor Dashboard */}
            {/* {user.user_type === "doctor" && <DoctorDashboard user={user} />} */}
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorDashboard from "@/components/DoctorDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import ReturningPatientDashboard from "@/components/ReturningPatientDashboard";
import NewPatientDashboard from "@/components/NewPatientDashboard";

interface PatientProfile {
    level: number;
    associated_psychologist: string | null;
    associated_psychologist_name: string | null;
}

interface DoctorProfile {
    professional_information: {
        specialization: string;
        experience: string;
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

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem("user_data");
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            router.push("/login");
        }
    }, [router]);

    if (!user) return <p className="text-center text-gray-600 mt-10">Loading...</p>;

    // **New Patient (Level 0) - Immersive Experience**
    if (user.user_type === "patient" && user.patient_profile?.level === 0) {
        return <NewPatientDashboard user={user} />;
    }

    // **Returning Patient (Level 1) - Calm & Reassuring**
    if (user.user_type === "patient" && user.patient_profile?.level === 1) {
        return <ReturningPatientDashboard user={user} />;
    }

    // ** Patient (Level 2) - Calm & Reassuring**
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
            {user.user_type === "patient" && user.patient_profile?.level > 1 && (
                <PatientDashboard user={user} />
            )}

            {/* Doctor Dashboard */}
            {/* {user.user_type === "doctor" && <DoctorDashboard user={user} />} */}
        </div>
    );
}

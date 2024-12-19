"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PatientProfile {
    level: number;
    associated_psychologist: string | null;
}

interface DoctorProfile {
    professional_information: { qualification: string };
    chatgroup_nickname: string;
    rates: string;
}

interface User {
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
            router.push("/login"); // Redirect to login if user data is missing
        }
    }, [router]);

    if (!user) {
        return <p>Loading...</p>; // Show loading screen while user data is being fetched
    }

    return (
        <div className="dashboard-container">
            <h1>Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>

            {user.user_type === "patient" && user.patient_profile && (
                <div className="patient-dashboard">
                    <h2>Patient Dashboard</h2>
                    <p>Level: {user.patient_profile.level}</p>
                    <p>
                        Associated Psychologist:{" "}
                        {user.patient_profile.associated_psychologist || "None"}
                    </p>
                    <button onClick={() => router.push("/chat")}>
                        Chat with Bot
                    </button>
                </div>
            )}

            {user.user_type === "doctor" && user.doctor_profile && (
                <div className="doctor-dashboard">
                    <h2>Doctor Dashboard</h2>
                    <p>
                        Qualification:{" "}
                        {user.doctor_profile.professional_information.qualification}
                    </p>
                    <p>Nickname: {user.doctor_profile.chatgroup_nickname}</p>
                    <p>Rates: ${user.doctor_profile.rates}</p>
                </div>
            )}
        </div>
    );
}

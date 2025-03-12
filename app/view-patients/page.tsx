"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import router for navigation

interface Patient {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
    };
    profile_data: {
        Age: string;
        name: string;
        Gender: string;
        History: string;
        Condition: string;
    };
}

export default function PatientsList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialize router

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/doctor/patients/", {
                headers: {
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-8 pt-12">
            <h1 className="text-4xl font-bold text-green-800 text-center mb-8">My Patients</h1>

            {loading ? (
                <p className="text-center text-gray-600 text-lg">Loading patients...</p>
            ) : patients.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No patients assigned yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                        <div
                            key={patient.id}
                            className="p-6 bg-white rounded-3xl shadow-lg border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-xl"
                        >
                            {/* Patient Header */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-blue-700">{patient.user.username}</h3>
                            </div>
                            <p className="text-gray-500"><strong>Email:</strong> {patient.user.email}</p>

                            {/* Divider */}
                            <div className="border-b my-4"></div>

                            {/* Patient Profile Data */}
                            <h4 className="text-lg font-semibold text-blue-700">Profile Data</h4>
                            <p className="text-gray-700"><strong>Name:</strong> {patient.profile_data.name}</p>
                            <p className="text-gray-700"><strong>Age:</strong> {patient.profile_data.Age}</p>
                            <p className="text-gray-700"><strong>Gender:</strong> {patient.profile_data.Gender}</p>
                            <p className="text-gray-700"><strong>Medical History:</strong> {patient.profile_data.History}</p>
                            <p className="text-gray-700"><strong>Current State:</strong> {patient.profile_data.Condition}</p>

                            {/* Open Profile Button */}
                            <button
                                onClick={() => router.push(`/patients/${patient.user.id}?name=${encodeURIComponent(patient.profile_data.name)}`)}
                                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md transition-transform hover:scale-105 hover:bg-blue-700 w-full"
                            >
                                Open Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";

interface Doctor {
    id: number;
    user: {
        id: number;
        username: string;
    };
    professional_information: {
        specialization: string;
        experience: string;
    };
    rates: string;
}

export default function ViewProfessionals() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [requestedDoctors, setRequestedDoctors] = useState<{ [key: number]: boolean }>({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<string>("");

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await fetch("${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/list/", {
                headers: {
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDoctors(data);
                checkDoctorRequests(data);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
        setLoading(false);
    };

    const checkDoctorRequests = async (doctors: Doctor[]) => {
        const requestsStatus: { [key: number]: boolean } = {};
        for (let doctor of doctors) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/check-request/${doctor.user.id}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                requestsStatus[doctor.id] = data.requested;
            }
        }
        setRequestedDoctors(requestsStatus);
    };

    const requestDoctor = async (doctorId: number, doctorName: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/request/${doctorId}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
            });

            if (response.ok) {
                setRequestedDoctors((prev) => ({ ...prev, [doctorId]: true }));
                setSelectedDoctor(doctorName);
                setShowModal(true); // Show the confirmation modal
                checkDoctorRequests(doctors); // Refresh request statuses
            }
        } catch (error) {
            console.error("Error requesting doctor:", error);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-8 mt-12">
            {/* Page Header with Motivation */}
            <div className="text-center max-w-2xl mb-8">
                <h1 className="text-4xl font-extrabold text-blue-800">Find Your Psychologist</h1>
                <p className="text-lg text-gray-700 mt-3">
                    You are not alone. The right professional can help you navigate your journey towards 
                    peace and healing. Let's take this step together. 💙
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <p className="text-center text-gray-600 text-lg">Loading professionals...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {doctors.map((doctor) => (
                        <div key={doctor.id} className="p-6 bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                            {/* Doctor's Name */}
                            <h2 className="text-2xl font-semibold text-blue-700">{doctor.user.username}</h2>

                            {/* Specialization & Experience */}
                            <p className="text-gray-600 mt-2">
                                <strong className="text-gray-800">Specialization:</strong> {doctor.professional_information.specialization}
                            </p>
                            <p className="text-gray-600">
                                <strong className="text-gray-800">Experience:</strong> {doctor.professional_information.experience}
                            </p>

                            {/* Rate */}
                            <p className="text-lg font-semibold text-green-700 mt-3">💰 ${doctor.rates}/session</p>

                            {/* Request Button */}
                            {requestedDoctors[doctor.id] ? (
                                <p className="mt-4 text-green-600 font-semibold">✔ Requested</p>
                            ) : (
                                <button
                                    onClick={() => requestDoctor(doctor.user.id, doctor.user.username)}
                                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md transition-transform hover:scale-105 hover:bg-blue-700"
                                >
                                    Request This Psychologist
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Confirmation */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
                        <h2 className="text-2xl font-bold text-blue-800">Request Sent! ✅</h2>
                        <p className="text-gray-700 mt-3">
                            You have successfully requested <strong className="text-blue-700">{selectedDoctor}</strong>.
                            Our team will get back to you shortly.
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md transition-transform hover:scale-105 hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

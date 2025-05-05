"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [sessionData, setSessionData] = useState({ title: "", description: "", date: "" });
    const [successMessage, setSuccessMessage] = useState("");  // ✅ NEW

    const router = useRouter();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/patients/`, {
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

    const openSessionModal = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
        setSuccessMessage("");  // ✅ clear previous success message when opening
    };

    const closeModal = () => {
        setShowModal(false);
        setSessionData({ title: "", description: "", date: "" });  // ✅ clear input fields
        setSuccessMessage("");  // ✅ clear success message
    };

    const createSession = async () => {
        const onlyDate = sessionData.date.split("T")[0];
        const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/create-session/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${localStorage.getItem("session_key")}`,
            },
            body: JSON.stringify({
                patient_id: selectedPatient?.user.id,
                title: sessionData.title,
                description: sessionData.description,
                date: onlyDate,
            }),
        });

        if (response.ok) {
            setSuccessMessage("✅ Session created successfully!");
        } else {
            const err = await response.json();
            setSuccessMessage(`❌ Failed: ${err.error}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-green-900 mb-10 pt-8">
                    My Patients
                </h1>

                {loading ? (
                    <p className="text-center text-gray-600 text-lg">Loading patients...</p>
                ) : patients.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">No patients assigned yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-200 flex flex-col"
                            >
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-blue-800">
                                        {patient.user.username}
                                    </h3>
                                    <p className="text-sm text-gray-500">{patient.user.email}</p>
                                </div>

                                <div className="border-t pt-4 mb-4">
                                    <h4 className="text-lg font-semibold text-blue-700 mb-2">Profile Data</h4>
                                    <p className="text-gray-700 text-sm"><strong>Name:</strong> {patient.profile_data.name}</p>
                                    <p className="text-gray-700 text-sm"><strong>Age:</strong> {patient.profile_data.Age}</p>
                                    <p className="text-gray-700 text-sm"><strong>Gender:</strong> {patient.profile_data.Gender}</p>
                                    <p className="text-gray-700 text-sm"><strong>Medical History:</strong> {patient.profile_data.History}</p>
                                    <p className="text-gray-700 text-sm"><strong>Current State:</strong> {patient.profile_data.Condition}</p>
                                </div>

                                <div className="mt-auto flex space-x-3">
                                    <button
                                        onClick={() =>
                                            router.push(`/patients/${patient.user.id}?name=${encodeURIComponent(patient.profile_data.name)}`)
                                        }
                                        className="flex-1 px-4 py-2 rounded-full bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
                                    >
                                        Open Profile
                                    </button>
                                    <button
                                        onClick={() => openSessionModal(patient)}
                                        className="flex-1 px-4 py-2 rounded-full bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
                                    >
                                        📅 Create Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && selectedPatient && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                            <h2 className="text-xl font-bold mb-4 text-center">
                                Create Session for {selectedPatient.user.username}
                            </h2>
                            <input
                                type="text"
                                placeholder="Session Title"
                                className="w-full border p-3 mb-3 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                value={sessionData.title}
                                onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full border p-3 mb-3 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                value={sessionData.description}
                                onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                            />
                            <input
                                type="datetime-local"
                                className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                value={sessionData.date}
                                onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                            />
                            <div className="flex justify-between">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-full bg-gray-400 text-white hover:bg-gray-500 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createSession}
                                    className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    Create
                                </button>
                            </div>

                            {successMessage && (
                                <div className={`mt-4 text-center p-2 rounded ${
                                    successMessage.startsWith("✅")
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}>
                                    {successMessage}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
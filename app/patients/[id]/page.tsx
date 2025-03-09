"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import for navigation

interface ChatbotProfile {
    id: number;
    collected_data: any;
    session_summary: string;
    important_messages?: string;
    date: string;
}

export default function PatientChatbotProfile({ params }: { params: { id: string } }) {
    const [chatbotProfiles, setChatbotProfiles] = useState<ChatbotProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterImportant, setFilterImportant] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    const router = useRouter(); // Initialize router
    const patientId = params.id; // Extract Patient ID from URL

    useEffect(() => {
        fetchChatbotProfiles();
    }, [filterImportant, selectedDate]);

    const fetchChatbotProfiles = async () => {
        const endpoint = filterImportant
            ? `http://127.0.0.1:8000/users/doctor/chatbot-data/${patientId}/important-messages/`
            : `http://127.0.0.1:8000/users/doctor/chatbot-data/${patientId}/`;

        const url = selectedDate ? `${endpoint}?date=${selectedDate}` : endpoint;

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Token ${localStorage.getItem("session_key")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setChatbotProfiles(data);
            }
        } catch (error) {
            console.error("Error fetching chatbot profiles:", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-8">
            <h1 className="text-4xl font-bold text-green-800 text-center mb-6">Chatbot Insights</h1>

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-4 px-5 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition"
            >
                ← Back to Patients List
            </button>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded-lg"
                />
                <button
                    onClick={() => setFilterImportant(!filterImportant)}
                    className={`p-2 rounded-lg ${filterImportant ? "bg-blue-700 text-white" : "bg-gray-300 text-black"}`}
                >
                    {filterImportant ? "Show All Data" : "Filter Important Messages"}
                </button>
            </div>

            {/* Chatbot Profiles */}
            {loading ? (
                <p className="text-center text-gray-600">Loading chatbot profiles...</p>
            ) : chatbotProfiles.length === 0 ? (
                <p className="text-center text-gray-600">No chatbot data available.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chatbotProfiles.map((profile) => (
                        <div key={profile.id} className="p-6 bg-white rounded-lg shadow-lg border border-gray-300">
                            <h3 className="text-xl font-semibold text-blue-700">Date: {profile.date}</h3>
                            <p className="text-gray-700"><strong>Summary:</strong> {profile.session_summary}</p>
                            {profile.important_messages && (
                                <p className="text-red-500"><strong>Important Message:</strong> {profile.important_messages}</p>
                            )}
                            <p className="text-gray-700"><strong>Data:</strong> {JSON.stringify(profile.collected_data)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

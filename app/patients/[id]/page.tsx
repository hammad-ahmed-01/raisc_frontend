"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Import for navigation
import moment from "moment"; // Import moment.js for better date formatting

interface ChatbotProfile {
    id: number;
    collected_data: any;
    session_summary: string;
    important_messages?: string;
    date: string;
}

export default function PatientChatbotProfile() {
    const params = useParams(); // Get URL params safely
    const patientId = params.id; // Extract patient ID
    const searchParams = useSearchParams();
    const patientName = searchParams.get("name") || "Patient";

    const [chatbotProfiles, setChatbotProfiles] = useState<ChatbotProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterImportant, setFilterImportant] = useState(false);
    const [fromDate, setFromDate] = useState(""); // From Date
    const [toDate, setToDate] = useState(""); // To Date

    const router = useRouter(); // Initialize router

    useEffect(() => {
        fetchChatbotProfiles();
    }, [filterImportant, fromDate, toDate]);

    const fetchChatbotProfiles = async () => {
        let endpoint = filterImportant
            ? `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/chatbot-data/${patientId}/important-messages/`
            : `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/chatbot-data/${patientId}/`;

        if (fromDate && toDate) {
            endpoint += `?from=${fromDate}&to=${toDate}`;
        } else if (fromDate) {
            endpoint += `?from=${fromDate}`;
        } else if (toDate) {
            endpoint += `?to=${toDate}`;
        }

        try {
            const response = await fetch(endpoint, {
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-8 pt-12">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-green-800 text-center mb-6">Chatbot Insights - {patientName}</h1>

            {/* Back Button */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition"
                >
                    ← Back to Patients List
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center space-x-2">
                    <label className="text-gray-700">From:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="p-2 border rounded-lg w-40 text-sm"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-gray-700">To:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="p-2 border rounded-lg w-40 text-sm"
                    />
                </div>
                <button
                    onClick={() => setFilterImportant(!filterImportant)}
                    className={`p-2 rounded-lg text-sm transition-all ${filterImportant ? "bg-blue-700 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}
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
                        <div key={profile.id} className="p-6 bg-white rounded-3xl shadow-lg border border-gray-300 transition-all hover:shadow-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-blue-700">
                                {moment(profile.date).format("Do MMMM, YYYY h:mm A")}
                                </h3>
                            </div>
                            <p className="text-gray-700 mt-2"><strong>Summary:</strong> {profile.session_summary}</p>
                            {profile.important_messages && (
                                <p className="text-red-500 mt-2"><strong>Important Message:</strong> {profile.important_messages}</p>
                            )}
                            <p className="text-gray-700 mt-2"><strong>Data:</strong> {JSON.stringify(profile.collected_data)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

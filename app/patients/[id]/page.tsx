"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import moment from "moment";

interface ChatbotProfile {
    id: number;
    collected_data: any;
    session_summary: string;
    important_messages?: string;
    date: string;
    session_key: string;
    session_start_msg: number;
    session_end_msg: number;
}

interface ChatMessage {
    role: string;
    content: string;
}

export default function PatientChatbotProfile() {
    const params = useParams();
    const patientId = params.id;
    const searchParams = useSearchParams();
    const patientName = searchParams.get("name") || "Patient1";

    const [chatbotProfiles, setChatbotProfiles] = useState<ChatbotProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [modalTitle, setModalTitle] = useState("");
    const [sessionKey, setSessionKey] = useState('abe73788227a0116ca5a2b5fca4f948f70065e8d');

    const router = useRouter();

    useEffect(() => {
        fetchChatbotProfiles();
    }, []);

    const fetchChatbotProfiles = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/chatbot-data/${patientId}/`, {
                headers: { Authorization: `Token ${localStorage.getItem("session_key")}` },
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setChatbotProfiles(data);
            }
        } catch (error) {
            console.error("Error fetching chatbot profiles:", error);
        }
        setLoading(false);
    };

    const fetchChatThread = async (sessionKey: string, startIdx: number, endIdx: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/history/${sessionKey}/${startIdx}/${endIdx}`
            );
            if (response.ok) {
                const data = await response.json();
                setChatMessages(data.chat_history);
                setShowModal(true);
            } else {
                alert("Failed to fetch chat thread.");
            }
        } catch (error) {
            console.error("Error fetching chat thread:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-extrabold text-center text-green-900 mb-8 pt-8">
                    Chatbot Insights <span className="block text-base font-normal text-gray-700">for {patientName}</span>
                </h1>

                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-gray-700 text-white rounded-full shadow hover:bg-gray-800 transition"
                    >
                        ← Back to Patients List
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-600 text-lg">Loading chatbot profiles...</p>
                ) : chatbotProfiles.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">No chatbot data available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chatbotProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition duration-300"
                            >
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    {moment(profile.date).format("Do MMMM, YYYY h:mm A")}
                                </h3>
                                <p className="text-gray-700 mb-2">
                                    <strong>Summary:</strong> {profile.session_summary}
                                </p>
                                {profile.important_messages && (
                                    <p className="text-red-600 font-semibold mb-2">
                                        ⚠ Important: {profile.important_messages}
                                    </p>
                                )}
                                <p className="text-gray-500 text-sm mb-4">
                                    <strong>Data:</strong> {JSON.stringify(profile.collected_data)}
                                </p>
                                <button
                                    onClick={() => {
                                        setModalTitle(`Chat Thread - ${moment(profile.date).format("Do MMM YYYY h:mm A")}`);
                                        fetchChatThread(sessionKey, 0, 4);
                                    }}
                                    className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                >
                                    💬 View Chat Thread
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition text-2xl"
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-4 text-green-800">{modalTitle}</h2>
                            <div className="h-80 overflow-y-auto flex flex-col space-y-3 pr-2">
                                {[...chatMessages].map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl max-w-[75%] ${
                                            msg.role === "user"
                                                ? "bg-blue-100 text-blue-800 self-start"
                                                : "bg-green-100 text-green-800 self-end ml-auto"
                                        }`}
                                    >
                                        <p className="text-sm">
                                            <strong>{msg.role === "user" ? "User:" : "Bot:"}</strong> {msg.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
}
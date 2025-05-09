"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
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
    const patientName = searchParams.get("name") || "Patient";

    const [chatbotProfiles, setChatbotProfiles] = useState<ChatbotProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [modalTitle, setModalTitle] = useState("");
    const [sessionKey, setSessionKey] = useState('6e50625cbd78c706dc5b5f6309b80d68d9f3bc73');

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
                setChatbotProfiles(data);
            }
        } catch (error) {
            console.error("Error fetching chatbot profiles:", error);
        }
        setLoading(false);
    };

    const fetchChatThread = async (sessionKey: string, startIdx: number, endIdx: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL}/api/history/${sessionKey}/${startIdx}/${endIdx}`);
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

    const sentimentData = [...chatbotProfiles]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((profile, index) => {
        const dataString = profile.collected_data || "";
        console.log(dataString);
        const messageMatch = dataString.match(/(\d+) user messages/);
        const avgMatch = dataString.match(/Average compound sentiment score was ([\d\-.]+)/);
        const minMatch = dataString.match(/min: ([\d\-.]+)/);
        const maxMatch = dataString.match(/max: ([\d\-.]+)/);
        const toneMatch = dataString.match(/indicating an overall\s+(\w+)\s+tone/);
        console.log(toneMatch);
        return {
            name: `Session ${index + 1}`,
            messages: Number(messageMatch?.[1] || 0),
            avg: Number(avgMatch?.[1] || 0),
            min: Number(minMatch?.[1] || 0),
            max: Number(maxMatch?.[1] || 0),
            tone: toneMatch?.[1] || "neutral",
            date: profile.date
        };
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 py-10">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-green-900 mb-6 pt-8">
                    Chatbot Insights
                    <span className="block text-lg text-gray-600 font-normal mt-2">
                        for {patientName}
                    </span>
                </h1>

                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded-full bg-gray-700 text-white shadow hover:bg-gray-800 transition"
                    >
                        ← Back to Patients List
                    </button>
                </div>

                {sentimentData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow p-6 mb-12">
                        <h2 className="text-2xl font-semibold text-center text-green-800 mb-4">Session Sentiment Trends</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sentimentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[-1, 1]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avg" name="Average" stroke="#34d399" strokeWidth={2} />
                                <Line type="monotone" dataKey="min" name="Min" stroke="#60a5fa" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="max" name="Max" stroke="#f87171" strokeDasharray="4 4" />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center flex-wrap gap-3 mt-4">
                            {sentimentData.map((item, idx) => (
                                <div key={idx} className="px-4 py-1 rounded-full text-sm font-medium shadow bg-gray-100">
                                    {item.name}: <span className={`capitalize ${item.tone === "positive" ? "text-green-600" : item.tone === "negative" ? "text-red-600" : "text-gray-600"}`}>{item.tone}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-gray-600 text-lg">Loading chatbot profiles...</p>
                ) : chatbotProfiles.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">No chatbot data available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chatbotProfiles.map((profile) => (
                            <div key={profile.id} className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col">
                                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                                    {moment(profile.date).format("Do MMM, YYYY h:mm A")}
                                </h3>
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Summary:</strong> {profile.session_summary}
                                </p>
                                {profile.important_messages && (
                                    <p className="text-sm text-red-600 font-medium mb-2">
                                        ⚠ Important: {profile.important_messages}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mb-4">
                                    <strong>Data:</strong> {JSON.stringify(profile.collected_data)}
                                </p>
                                <button
                                    onClick={() => {
                                        setModalTitle(`Chat Thread - ${moment(profile.date).format("Do MMM YYYY h:mm A")}`);
                                        fetchChatThread(sessionKey, profile.session_start_msg, profile.session_end_msg);
                                    }}
                                    className="mt-auto w-full px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    💬 View Chat Thread
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition text-2xl"
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-4 text-green-800">{modalTitle}</h2>
                            <div className="h-80 overflow-y-auto flex flex-col space-y-3 pr-2">
                                {chatMessages.map((msg, idx) => (
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
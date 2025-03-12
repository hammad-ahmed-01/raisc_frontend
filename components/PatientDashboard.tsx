"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Image from "next/image";

interface TherapySession {
    id: number;
    title: string;
    description: string;
    date: string;
    doctor_name: string;
}

export default function PatientDashboard({ user }: { user: any }) {
    const router = useRouter();
    const [sessions, setSessions] = useState<TherapySession[]>([]);
    const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
    const localizer = momentLocalizer(moment);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/patient/sessions/", {
                headers: { Authorization: `Token ${localStorage.getItem("session_key")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Error fetching therapy sessions:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-6">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-green-800">Welcome, {user.username}!</h1>
                    <p className="text-gray-600 mt-2">This is your personalized mental wellness dashboard.</p>
                </div>
                <Image src="/mental-wellness.jpeg" alt="Mental Wellness" width={120} height={120} />
            </div>

            {/* Grid Layout for Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="flex flex-col space-y-6">

                    {/* Motivational Quote */}
                    <div className="flex justify-center">
                        <div className="bg-blue-100 p-4 md:p-5 rounded-lg shadow-md text-center max-w-md border-l-4 border-blue-500">
                            <p className="text-lg italic text-gray-700">
                                <span className="text-blue-700 font-semibold text-xl">“</span>
                                Healing takes time, and asking for help is a courageous step.
                                <span className="text-blue-700 font-semibold text-xl">”</span>
                            </p>
                            <p className="text-gray-600 mt-2 text-sm">You're not alone in this journey. We’re here for you. 💙</p>
                        </div>
                    </div>

                    {/* Chat with AI Bot */}
                    <button
                        onClick={() => router.push("/chat")}
                        className="flex items-center justify-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
                    >
                        <Image src="/raisc-chatbot.png" alt="RAISC Chatbot" width={60} height={60} />
                        <span className="text-lg font-semibold">Your Personal ChatBot</span>
                    </button>

                    {/* Associated Psychologist */}
                    {user.patient_profile?.associated_psychologist && (
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <h2 className="text-xl font-semibold text-blue-700">Your Psychologist</h2>
                            <p className="text-gray-600 mt-2">
                                You are connected with <strong className="text-green-700">testuser4</strong>.
                            </p>
                        </div>
                    )}

                    {/* Resources Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-green-700">Helpful Resources</h2>
                        <ul className="mt-4 space-y-4">
                            <li className="flex items-center space-x-3">
                                <Image src="/mental-health.png" alt="Mental Health" width={30} height={30} />
                                <a href="https://www.mentalhealth.gov/" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                                    Understanding Mental Health
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Image src="/topics.png" alt="Mental Health Topics" width={30} height={30} />
                                <a href="https://www.nimh.nih.gov/health/topics" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                                    Mental Health Topics
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Image src="/support-group.png" alt="Support Groups" width={30} height={30} />
                                <a href="https://www.psychologytoday.com/us" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                                    Find Support Groups
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column - Calendar */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-green-700">Your Therapy Sessions</h2>
                    <Calendar
                        localizer={localizer}
                        events={sessions.map((session) => ({
                            title: session.title,
                            start: new Date(session.date),
                            end: new Date(session.date),
                            allDay: true,
                        }))}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 400 }}
                        className="mt-4 border rounded-lg shadow-md"
                        onSelectEvent={(event) => {
                            const session = sessions.find(s => s.title === event.title);
                            if (session) setSelectedSession(session);
                        }}
                    />
                </div>
            </div>

            {/* Modal for Session Details */}
            {selectedSession && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg text-center relative">
                        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Session Details</h2>
                        <p className="text-gray-700"><strong>Title:</strong> {selectedSession.title}</p>
                        <p className="text-gray-700"><strong>Description:</strong> {selectedSession.description}</p>
                        <p className="text-gray-700"><strong>Date:</strong> {moment(selectedSession.date).format("Do MMMM, YYYY")}</p>
                        <p className="text-gray-700"><strong>With:</strong> {selectedSession.doctor_name}</p>
                        <button
                            onClick={() => setSelectedSession(null)}
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

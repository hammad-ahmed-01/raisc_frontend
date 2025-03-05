"use client";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Import styles

interface PatientRequest {
    id: number;
    patient: {
        id: number;
        username: string;
        email: string;
        profile_data: {
            age: string;
            name: string;
            gender: string;
            history: string;
            current_state: string;
        };
    };
    status: string;
    requested_at: string;
}

interface Session {
    id: number;
    title: string;
    description: string;
    date: string;
}

export default function DoctorDashboard({ user }: { user: any }) {
    const [requests, setRequests] = useState<PatientRequest[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const localizer = momentLocalizer(moment); // Set the calendar's timezone

    useEffect(() => {
        fetchSessions();
        fetchRequests();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/doctor/sessions/", {
                headers: {
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/users/doctor/requests/", {
                headers: {
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Error fetching patient requests:", error);
        }
        setLoading(false);
    };

    const manageRequest = async (id: number, status: string) => {
        try {
            await fetch(`http://127.0.0.1:8000/users/doctor/manage-request/${id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
                body: JSON.stringify({ status }),
            });
            fetchRequests(); // Refresh request list
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-12">
            <h1 className="text-4xl font-bold text-green-800 text-center mb-8">{user.username} - Personal Dashboard</h1>

            {/* Grid Layout for Better Spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Doctor Info */}
                <div className="bg-white p-6 rounded-lg shadow-lg border lg:col-span-1">
                    <h2 className="text-2xl font-semibold text-green-700">Doctor Information</h2>
                    <p className="text-gray-700 mt-2">
                        <strong>Specialization:</strong> {user.doctor_profile?.professional_information.specialization}
                    </p>
                    <p className="text-gray-700 mt-2">
                        <strong>Experience:</strong> {user.doctor_profile?.professional_information.experience}
                    </p>
                    <p className="text-gray-700">
                        <strong>Nickname:</strong> {user.doctor_profile?.chatgroup_nickname}
                    </p>
                    <p className="text-gray-700">
                        <strong>Rates:</strong> ${user.doctor_profile?.rates}/session
                    </p>
                </div>

                {/* Middle: Calendar */}
                <div className="bg-white p-6 rounded-lg shadow-lg border lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-green-700">Your Sessions</h2>
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
                    />
                </div>
            </div>

            {/* Patient Requests Section */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold text-green-700 text-center">Patient Requests</h2>

                {loading ? (
                    <p className="text-center text-gray-600 text-lg">Loading requests...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {requests.map((request) => (
                            <div key={request.id} className="p-6 bg-white rounded-lg shadow-lg border border-gray-300">
                                <h3 className="text-xl font-semibold text-blue-700">{request.patient.username}</h3>
                                <p className="text-gray-700"><strong>Email:</strong> {request.patient.email}</p>
                                <h4 className="text-xl font-semibold text-blue-700 mb-4 mt-6">Extracted Information</h4>
                                <p className="text-gray-700"><strong>Name:</strong> {request.patient.profile_data.name}</p>
                                <p className="text-gray-700"><strong>Age:</strong> {request.patient.profile_data.age}</p>
                                <p className="text-gray-700"><strong>Gender:</strong> {request.patient.profile_data.gender}</p>
                                <p className="text-gray-700"><strong>Medical History:</strong> {request.patient.profile_data.history}</p>
                                <p className="text-gray-700"><strong>Current State:</strong> {request.patient.profile_data.current_state}</p>

                                <div className="flex mt-4 space-x-4">
                                    <button onClick={() => manageRequest(request.id, "approved")} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md shadow-md transition-transform hover:scale-105">
                                        Accept
                                    </button>
                                    <button onClick={() => manageRequest(request.id, "rejected")} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md shadow-md transition-transform hover:scale-105">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface PatientRequest {
    id: number;
    patient: {
        id: number;
        username: string;
        email: string;
        profile_data: {
            Age: string;
            name: string;
            Gender: string;
            History: string;
            Condition: string;
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
    doctor_summary?: string;
}

export default function DoctorDashboard({ user }: { user: any }) {
    const router = useRouter();
    const [requests, setRequests] = useState<PatientRequest[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [doctorSummary, setDoctorSummary] = useState("");
    const [modalType, setModalType] = useState<"confirm" | "success" | "session-details" | "request-details" | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<PatientRequest | null>(null);
    const [actionStatus, setActionStatus] = useState<string | null>(null);

    const localizer = momentLocalizer(moment);

    useEffect(() => {
        fetchSessions();
        fetchRequests();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/sessions/`, {
                headers: { Authorization: `Token ${localStorage.getItem("session_key")}` },
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/requests/`, {
                headers: { Authorization: `Token ${localStorage.getItem("session_key")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Error fetching patient requests:", error);
        }
    };

    const openConfirmModal = (request: PatientRequest, status: string) => {
        setSelectedRequest(request);
        setActionStatus(status);
        setModalType("confirm");
    };

    const manageRequest = async () => {
        if (!selectedRequest) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/manage-request/${selectedRequest.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
                body: JSON.stringify({ status: actionStatus }),
            });
            fetchRequests();
            setModalType("success");
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };

    const openSessionModal = (session: Session) => {
        setSelectedSession(session);
        setDoctorSummary(session.doctor_summary || "");
        setModalType("session-details");
    };

    const saveDoctorSummary = async () => {
        if (!selectedSession) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/doctor/update-summary/${selectedSession.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("session_key")}`,
                },
                body: JSON.stringify({ doctor_summary: doctorSummary }),
            });
            setModalType(null);
            fetchSessions();
        } catch (error) {
            console.error("Error saving doctor summary:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 p-6 md:p-12">
            <h1 className="text-4xl font-extrabold text-green-800 text-center mb-10 pt-6">
                👨‍⚕️ Doctor Dashboard
            </h1>

            {/* Top Action */}
            <div className="flex justify-center mb-10">
                <button
                    onClick={() => router.push("/view-patients")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full shadow-md hover:scale-105 transition-transform"
                >
                    View My Patients
                </button>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doctor Profile */}
                <div className="bg-white p-6 rounded-xl shadow-lg border">
                    <h2 className="text-2xl font-semibold text-green-700 mb-4">👤 {user.username}</h2>
                    <ul className="text-gray-700 space-y-2">
                        <li><strong>Nickname:</strong> {user.doctor_profile?.chatgroup_nickname}</li>
                        <li><strong>Specialization:</strong> {user.doctor_profile?.professional_information.specialization}</li>
                        <li><strong>Experience:</strong> {user.doctor_profile?.professional_information.experience}</li>
                        <li><strong>Rates:</strong> ${user.doctor_profile?.rates} / session</li>
                    </ul>
                </div>

                {/* Calendar */}
                <div className="bg-white p-6 rounded-xl shadow-lg border lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-green-700 mb-4">📅 Your Sessions</h2>
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
                        className="mt-4 border rounded-lg shadow-sm"
                        onSelectEvent={(event: any) => {
                            const session = sessions.find(s => s.title === event.title);
                            if (session) openSessionModal(session);
                        }}
                    />
                </div>
            </div>

            {/* Patient Requests */}
            <div className="mt-12">
                <h2 className="text-2xl font-semibold text-green-700 text-center mb-6">📩 Patient Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <div key={request.id} className="p-6 bg-white rounded-xl shadow-lg border hover:shadow-2xl transition transform hover:-translate-y-1">
                            <h3 className="text-xl font-bold text-blue-700 mb-2">{request.patient.username}</h3>
                            <p className="text-gray-700"><strong>Email:</strong> {request.patient.email}</p>
                            <div className="mt-3 space-y-1 text-sm">
                                <p><strong>Name:</strong> {request.patient.profile_data.name}</p>
                                <p><strong>Age:</strong> {request.patient.profile_data.Age}</p>
                                <p><strong>Gender:</strong> {request.patient.profile_data.Gender}</p>
                                <p><strong>Family History:</strong> {request.patient.profile_data.History}</p>
                                <p><strong>Condition:</strong> {request.patient.profile_data.Condition}</p>
                            </div>
                            <div className="flex mt-4 space-x-4">
                                <button onClick={() => openConfirmModal(request, "approved")} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:scale-105 transition">
                                    ✅ Accept
                                </button>
                                <button onClick={() => openConfirmModal(request, "rejected")} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:scale-105 transition">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Session Details Modal */}
            {modalType === "session-details" && selectedSession && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4 text-center">📝 Session Details</h2>
                        <p><strong>Title:</strong> {selectedSession.title}</p>
                        <p><strong>Description:</strong> {selectedSession.description}</p>
                        <textarea
                            value={doctorSummary}
                            onChange={(e) => setDoctorSummary(e.target.value)}
                            className="w-full mt-4 p-2 border rounded-md"
                            placeholder="Enter doctor summary..."
                        />
                        <div className="mt-4 flex justify-center space-x-4">
                            <button onClick={saveDoctorSummary} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500 transition">Save</button>
                            <button onClick={() => setModalType(null)} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-400 transition">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {modalType === "confirm" && selectedRequest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h2 className="text-xl font-semibold mb-4">⚠️ Confirm Action</h2>
                        <p className="mb-4">Are you sure you want to <strong>{actionStatus}</strong> this request?</p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={manageRequest} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500 transition">Confirm</button>
                            <button onClick={() => setModalType(null)} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-400 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
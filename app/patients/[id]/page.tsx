"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const generateReport = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const userData = localStorage.getItem("user_data");
  const user = userData ? JSON.parse(userData) : null;

  // Header
  doc.setFontSize(22);
  doc.setTextColor("#1e3a8a");
  doc.text("Chatbot Summary Report", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor("#4b5563");
  doc.text(`Generated On: ${moment().format("Do MMM YYYY, h:mm A")}`, 14, 28);

  // Doctor Info Box
  if (user?.doctor_profile) {
    const d = user.doctor_profile;

    doc.setFillColor(219, 234, 254); // Light blue background
    doc.roundedRect(12, 35, 186, 45, 3, 3, "F");

    doc.setFontSize(12);
    doc.setTextColor("#1e40af");
    doc.text(`Doctor Name:`, 16, 42);
    doc.setTextColor("#111827");
    doc.text(`${user.username}`, 60, 42);

    doc.setTextColor("#1e40af");
    doc.text(`Email:`, 16, 48);
    doc.setTextColor("#111827");
    doc.text(`${user.email}`, 60, 48);

    doc.setTextColor("#1e40af");
    doc.text(`Specialization:`, 16, 54);
    doc.setTextColor("#111827");
    doc.text(`${d.professional_information.specialization}`, 60, 54);

    doc.setTextColor("#1e40af");
    doc.text(`Experience:`, 16, 60);
    doc.setTextColor("#111827");
    doc.text(`${d.professional_information.experience}`, 60, 60);

    doc.setTextColor("#1e40af");
    doc.text(`Qualifications:`, 16, 66);
    doc.setTextColor("#111827");
    doc.text(`${d.professional_information.qualifications}`, 60, 66);
  }

  // Patient Session Insights
  doc.setFontSize(14);
  doc.setTextColor("#1e3a8a");
  doc.text("Patient Session Insights", 14, 85);

  const sessionTableData = chatbotProfiles.map((profile, index) => [
    index + 1,
    moment(profile.date).format("Do MMM, YYYY h:mm A"),
    profile.session_summary,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [["#", "Date", "Summary"]],
    body: sessionTableData,
    styles: {
      fontSize: 10,
      textColor: "#1e293b",
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [191, 219, 254],
      textColor: "#1e3a8a",
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 249, 255],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add Semantic Section right after this table
      const finalY = (data.cursor?.y ?? 0) + 10;

      doc.setFontSize(14);
      doc.setTextColor("#1e3a8a");
      doc.text("Semantic Analysis Summary", 14, finalY);

      const sentimentTableData = sentimentData.map((item, idx) => [
        idx + 1,
        item.name,
        item.messages,
        item.avg.toFixed(2),
        item.min.toFixed(2),
        item.max.toFixed(2),
        item.tone.charAt(0).toUpperCase() + item.tone.slice(1),
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["#", "Session", "Messages", "Avg Sentiment", "Min", "Max", "Tone"]],
        body: sentimentTableData,
        styles: {
          fontSize: 10,
          textColor: "#1e293b",
          lineColor: [203, 213, 225],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [191, 219, 254],
          textColor: "#1e3a8a",
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 249, 255],
        },
        margin: { left: 14, right: 14 },
      });
    },
  });

  doc.save(`Psychologist_Report_${patientName}.pdf`);
};

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-100 py-10">
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <div className="flex justify-end">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gray-700 text-white font-medium rounded-full hover:bg-gray-800 shadow-md transition"
                  >
                    ← Back to Patients List
                  </button>
                </div>
                
                <div className="max-w-4xl mx-auto text-center mb-12">
                  <h1 className="text-4xl font-extrabold text-green-900 mb-2">
                    🧠 Chatbot Insights
                  </h1>
                  <p className="text-lg text-gray-600">
                    for <span className="font-medium text-green-800">{patientName}</span>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <button
                      onClick={generateReport}
                      className="px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 shadow-md transition"
                    >
                      📝 Generate Psychologist Report
                    </button>
                  </div>
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
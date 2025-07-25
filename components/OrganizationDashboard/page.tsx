"use client";
import React from "react";
import TopRightIcons from "./Navigation";
import TodaysSessions from "./components/Calendar/TodaysSessions";
import CalendarView from "./components/Calendar/CalendarView";


interface User {
  username: string;
  organization_profile?: {
    name: string;
    total_psychologists: number;
    total_patients: number;
    sessions_today: number;
    new_join_requests: number;
    todays_sessions: {
      doctor: string;
      therapy_type: string;
      time: string;
    }[];
    rates?: string;
  };
}

const dummyOrg = {
  name: "Pakistan Institute of Mental Health",
  total_psychologists: 10,
  total_patients: 30,
  sessions_today: 4,
  new_join_requests: 2,
  todays_sessions: [
    {
      doctor: "Dr. Ali Hamza",
      therapy_type: "Cognitive Therapy",
      time: "9:00 AM",
    },
    {
      doctor: "Dr. Alisha",
      therapy_type: "Cognitive Therapy",
      time: "11:00 AM",
    },
    {
      doctor: "Dr. Sara Ali",
      therapy_type: "Cognitive Therapy",
      time: "10:00 AM",
    },
    { doctor: "Dr. Zahra", therapy_type: "Cognitive Therapy", time: "3:00 PM" },
  ],
};

const dummyDoctors = [
  {
    name: "Dr. Ali Hamza",
    specialization: "Cognitive Therapy",
    assigned: 4,
    rating: 4.7,
    profile_image: "/doc.png",
  },
  {
    name: "Dr. Alisha",
    specialization: "Cognitive Therapy",
    assigned: 4,
    rating: 4.7,
    profile_image: "/doc.png",
  },
  {
    name: "Dr. Sara Ali",
    specialization: "Cognitive Therapy",
    assigned: 4,
    rating: 4.7,
    profile_image: "/doc.png",
  },
];

const OrganizationDashboard: React.FC<{ user: User }> = ({ user }) => {
  const org = user?.organization_profile || dummyOrg;
  const isBackendConnected =
    process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
  const [doctors, setDoctors] = React.useState(dummyDoctors);

  React.useEffect(() => {
    if (isBackendConnected) {
      fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/doctors/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("session_key") || ""}`,
        },
      })
        .then((res) => (res.ok ? res.json() : Promise.resolve(dummyDoctors)))
        .then((data) => setDoctors(Array.isArray(data) ? data : dummyDoctors))
        .catch(() => setDoctors(dummyDoctors));
    }
  }, [isBackendConnected]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10 px-4 lg:px-0"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      <TopRightIcons />

      <div className="relative ml-32 py-10 px-4 z-10">
        {/* Welcome Heading */}
        <h1
          className="text-3xl font-bold text-[#1E3CA7] text-left mb-8"
          style={{
            fontWeight: 700,
            fontFamily: "Quicksand, Arial, sans-serif",
          }}
        >
          Welcome, {org.name}
        </h1>

        {/* Statistics Cards - full width, start under welcome */}
        <div className="w-full flex justify-between gap-8 mb-12 pr-16">
          <div
            className="flex-1 bg-white rounded-2xl border border-[#2196F3] px-10 py-6 text-center shadow"
            style={{ boxShadow: "0px 4px 12px 0px #D0E3FFC7" }}
          >
            <div
              className="text-base text-[#1E3CA7]"
              style={{ fontWeight: 600 }}
            >
              Total Psychologists
            </div>
            <div
              className="text-2xl font-bold text-[#1E3CA7] mt-2"
              style={{ fontWeight: 700 }}
            >
              {org.total_psychologists}
            </div>
          </div>
          <div
            className="flex-1 bg-white rounded-2xl border border-[#2196F3] px-10 py-6 text-center shadow"
            style={{ boxShadow: "0px 4px 12px 0px #D0E3FFC7" }}
          >
            <div
              className="text-base text-[#1E3CA7]"
              style={{ fontWeight: 600 }}
            >
              Total Patients
            </div>
            <div
              className="text-2xl font-bold text-[#1E3CA7] mt-2"
              style={{ fontWeight: 700 }}
            >
              {org.total_patients}
            </div>
          </div>
          <div
            className="flex-1 bg-white rounded-2xl border border-[#2196F3] px-10 py-6 text-center shadow"
            style={{ boxShadow: "0px 4px 12px 0px #D0E3FFC7" }}
          >
            <div
              className="text-base text-[#1E3CA7]"
              style={{ fontWeight: 600 }}
            >
              Sessions Today
            </div>
            <div
              className="text-2xl font-bold text-[#1E3CA7] mt-2"
              style={{ fontWeight: 700 }}
            >
              {org.sessions_today}
            </div>
          </div>
          <div
            className="flex-1 bg-white rounded-2xl border border-[#2196F3] px-10 py-6 text-center shadow"
            style={{ boxShadow: "0px 4px 12px 0px #D0E3FFC7" }}
          >
            <div
              className="text-base text-[#1E3CA7]"
              style={{ fontWeight: 600 }}
            >
              New Join Request
            </div>
            <div
              className="text-2xl font-bold text-[#1E3CA7] mt-2"
              style={{ fontWeight: 700 }}
            >
              {org.new_join_requests}
            </div>
          </div>
        </div>

        {/* Psychologists Section - under welcome, centered, reduced width */}
        <div className="mb-6 flex flex-col" style={{ width: "100%" }}>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold text-[#1E3CA7]"
              style={{ fontWeight: 700 }}
            >
              Psychologists
            </h2>
            <div className="mr-8">
              <button
                className="bg-[#1E3CA7] text-white font-semibold px-6 py-2 rounded-full shadow hover:opacity-70"
                style={{
                  border: "1px solid #2196F3",
                  fontWeight: 600,
                  boxShadow: "0px 4px 12px 0px #D0E3FFC7",
                }}
              >
                Add Psychologist
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="bg-[#D0E3FFC7] rounded-3xl p-8 flex flex-col items-center mx-auto"
              style={{
                width: "90%",
                overflowY: doctors.length > 3 ? "auto" : "visible",
                maxHeight: doctors.length > 3 ? "420px" : "none",
                boxShadow: "0px 4px 12px 0px #D0E3FFC7",
              }}
            >
              {doctors
                .slice(0, doctors.length > 3 ? doctors.length : 3)
                .map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-2xl mb-6 px-8 py-6 border border-[#2196F3] w-full"
                    style={{
                      fontWeight: 400,
                      boxShadow: "0px 4px 12px 0px #D0E3FFC7",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src="/doc.png"
                        alt={doc.name}
                        className="w-16 h-16 rounded-full border-2 border-[#2196F3] object-cover bg-white"
                        style={{ background: "#fff" }}
                      />
                      <div>
                        <div
                          className="text-lg font-bold text-[#1E3CA7]"
                          style={{ fontWeight: 700 }}
                        >
                          {doc.name}
                        </div>
                        <div
                          className="text-[#1E3CA7] text-base"
                          style={{ fontWeight: 600 }}
                        >
                          {doc.specialization}
                        </div>
                      </div>
                    </div>
                    {/* Stats then button */}
                    <div className="flex items-center gap-6 min-w-[220px] justify-end">
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className="text-[#1E3CA7] text-base"
                          style={{ fontWeight: 600 }}
                        >
                          Patient Assigned: {doc.assigned}
                        </div>
                        <div
                          className="text-[#1E3CA7] text-base flex items-center gap-1"
                          style={{ fontWeight: 400 }}
                        >
                          <span>🌟</span> {doc.rating} Rating
                        </div>
                      </div>
                      <button
                        className="bg-[#1E3CA7] text-white font-semibold px-6 py-2 rounded-full shadow hover:opacity-70"
                        style={{
                          border: "1px solid #2196F3",
                          fontWeight: 600,
                          boxShadow: "0px 4px 12px 0px #D0E3FFC7",
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              {/* Scrollbar for more than 3 psychologists */}
              {doctors.length > 3 && (
                <div className="w-full flex justify-center mt-2">
                  <span
                    className="text-[#1E3CA7] text-sm"
                    style={{ fontWeight: 400 }}
                  >
                    Scroll to see more psychologists...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <CalendarView />
        <TodaysSessions />
      </div>
    </div>
  );
};

export default OrganizationDashboard;

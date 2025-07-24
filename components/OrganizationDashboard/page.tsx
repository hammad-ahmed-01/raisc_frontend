"use client";
import React from 'react';

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
    { doctor: "Dr. Ali Hamza", therapy_type: "Cognitive Therapy", time: "9:00 AM" },
    { doctor: "Dr. Alisha", therapy_type: "Cognitive Therapy", time: "11:00 AM" },
    { doctor: "Dr. Sara Ali", therapy_type: "Cognitive Therapy", time: "10:00 AM" },
    { doctor: "Dr. Zahra", therapy_type: "Cognitive Therapy", time: "3:00 PM" }
  ]
};

const OrganizationDashboard: React.FC<{ user: User }> = ({ user }) => {
  const org = user?.organization_profile || dummyOrg;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#F5F8FF] py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-heading text-center mb-2">
          {org.name}
        </h1>
        <p className="text-heading2 text-center mb-8">
          Organization Dashboard Overview
        </p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-[#E9F5FE] rounded-xl p-6 text-center shadow">
            <div className="text-2xl font-bold text-[#1E3CA7]">{org.total_psychologists}</div>
            <div className="text-heading2 mt-2">Psychologists</div>
          </div>
          <div className="bg-[#FFF8EC] rounded-xl p-6 text-center shadow">
            <div className="text-2xl font-bold text-[#1E3CA7]">{org.total_patients}</div>
            <div className="text-heading2 mt-2">Patients</div>
          </div>
          <div className="bg-[#FFD2DC] rounded-xl p-6 text-center shadow">
            <div className="text-2xl font-bold text-[#1E3CA7]">{org.sessions_today}</div>
            <div className="text-heading2 mt-2">Sessions Today</div>
          </div>
          <div className="bg-[#D7E2FE] rounded-xl p-6 text-center shadow">
            <div className="text-2xl font-bold text-[#1E3CA7]">{org.new_join_requests}</div>
            <div className="text-heading2 mt-2">New Join Requests</div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-heading mb-4">Today's Sessions</h2>
          <table className="w-full border border-[#D7E2FE] rounded-xl overflow-hidden bg-white">
            <thead>
              <tr className="bg-[#E9F5FE] text-heading2">
                <th className="py-2 px-4 text-left">Doctor</th>
                <th className="py-2 px-4 text-left">Therapy Type</th>
                <th className="py-2 px-4 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {org.todays_sessions.map((session: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 px-4">{session.doctor}</td>
                  <td className="py-2 px-4">{session.therapy_type}</td>
                  <td className="py-2 px-4">{session.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-8">
          <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 rounded-full shadow hover:opacity-90">
            View All Psychologists
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
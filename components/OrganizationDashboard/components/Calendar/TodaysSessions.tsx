"use client";

import { format, isSameDay } from "date-fns";
import SessionBadge from "./SessionBadge";
import { useEffect, useState } from "react";

// Match backend event type
interface BackendEvent {
  id: number;
  title: string;
  date: string;
  description?: string;
  details?: string;
  doctor_summary?: string;
  patient_update?: string;
  doctor_id: number;
  patient_id: number;
}

const TodaysSessions = () => {
  const [sessions, setSessions] = useState<
    { doctor: string; therapy: string; time: string; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    Authorization: `Token ${
      typeof window !== "undefined" ? localStorage.getItem("session_key") : ""
    }`,
  });

  useEffect(() => {
    async function fetchTodaySessions() {
      try {
        setLoading(true);
        const res = await fetch("/api/organization/doctor-calendar", {
          headers: getAuthHeader(),
        });
        if (!res.ok) throw new Error("Failed to fetch today's sessions");
        const data: BackendEvent[] = await res.json();

        // Filter only today's events
        const today = new Date();
        const filtered = data
          .filter((ev) => isSameDay(new Date(ev.date), today))
          .map((ev) => ({
            doctor: ev.doctor_summary || `Doctor ${ev.doctor_id}`,
            therapy: ev.title || "Therapy Session",
            time: format(new Date(ev.date), "h:mm a"),
            color: "#1E3CA7",
          }));

        setSessions(filtered);
      } catch (err) {
        console.error("Error loading today's sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTodaySessions();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 px-4 min-h-screen py-10 text-[#1E3CA7] font-semibold">
        Loading today’s sessions...
      </div>
    );
  }

  return (
    <div className="mt-12 px-4 min-h-screen py-10">
      <h2 className="text-2xl font-bold text-[#1E3CA7] mb-6">Today’s Session</h2>
      <div className="bg-white border border-[#2196F3] rounded-3xl p-6 flex flex-wrap gap-y-4 max-w-3xl mx-auto">
        {sessions.length > 0 ? (
          sessions.map((session, i) => (
            <SessionBadge
              key={i}
              doctor={session.doctor}
              therapy={session.therapy}
              time={session.time}
              color={session.color}
            />
          ))
        ) : (
          <p className="text-[#1E3CA7] text-lg font-medium">
            No sessions scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
};

export default TodaysSessions;

"use client";

import { format, isSameDay } from "date-fns";
import SessionBadge from "./SessionBadge";
import { useEffect, useState } from "react";

interface BackendEvent {
  id: number;
  title: string;
  date: string;
  doctor_summary: string | null;
  doctor_id: number;
}

interface DoctorBackend {
  id: number;
  doctor_name: string;
  professional_information: {
    display_name: string;
  };
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
    async function loadData() {
      try {
        setLoading(true);

        const doctorRes = await fetch("/api/organization/view-doctors", {
          headers: getAuthHeader(),
        });
        const doctorData: DoctorBackend[] = await doctorRes.json();

        const doctorMap: Record<number, string> = {};
        doctorData.forEach((doc) => {
          doctorMap[doc.id] =
            doc.professional_information?.display_name || doc.doctor_name;
        });

        const res = await fetch("/api/organization/doctor-calendar", {
          headers: getAuthHeader(),
        });

        const data: BackendEvent[] = await res.json();

        const today = new Date();

        const filtered = data
          .filter((ev) => isSameDay(new Date(ev.date), today))
          .map((ev) => {
            const name =
              ev.doctor_summary ||
              doctorMap[ev.doctor_id] ||
              doctorData[0]?.professional_information?.display_name ||
              doctorData[0]?.doctor_name ||
              "Unknown";

            return {
              doctor: name,
              therapy: ev.title || "Therapy Session",
              time: format(new Date(ev.date), "h:mm a"),
              color: "#1E3CA7",
            };
          });

        setSessions(filtered);
      } catch (err) {
        console.error("Error loading today's sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 px-4 min-h-screen py-10 text-[#1E3CA7] font-semibold text-center">
        Loading today’s sessions...
      </div>
    );
  }

  return (
    <div className="mt-12 px-2 sm:px-4 min-h-screen py-8 sm:py-10">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1E3CA7] mb-6">
        Today’s Session
      </h2>

      <div className="bg-white border border-[#2196F3] rounded-3xl p-4 sm:p-6 flex flex-wrap gap-y-4 max-w-3xl mx-auto">
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
          <p className="text-[#1E3CA7] text-sm sm:text-lg font-medium">
            No sessions scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
};

export default TodaysSessions;

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { NextSessionBox } from "./NextSessionBox";
import { SessionsCalendarBox } from "./SessionsCalendarBox";

interface Session {
  id: string;
  patient_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "video" | "audio" | "in-person";
}

export const SessionCalendar: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_key") : null;
      const res = await fetch("/api/calendar/sessions", {
        headers: { Authorization: token ? `Token ${token}` : "" },
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (e) {
      console.error("Failed to load sessions", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("calendar-events");
      bc.onmessage = (ev) => { if (ev?.data?.type === "refresh-sessions") load(); };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, []);

  const nextSession = useMemo(() => {
    const now = new Date();
    let best: Session | null = null;
    sessions.forEach((s) => {
      const [yyyy, mm, dd] = s.date.split("-").map((n) => parseInt(n, 10));
      const [H, M] = s.time.split(":").map((n) => parseInt(n, 10));
      const when = new Date(yyyy, (mm || 1) - 1, dd || 1, H || 0, M || 0, 0, 0);
      if (when >= now && (!best || when < new Date(`${best.date}T${best.time}`))) best = s;
    });
    return best;
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-2xl p-6 shadow-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-[#FFF8EC] border-2 border-[#2196F3] rounded-2xl p-6 shadow-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="md:col-span-1">
        <NextSessionBox nextSession={nextSession || null} />
      </div>
      <div className="md:col-span-4">
        <SessionsCalendarBox sessions={sessions} />
      </div>
    </div>
  );
};

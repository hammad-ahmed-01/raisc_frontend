"use client";
import { format } from "date-fns";
import SessionBadge from "./SessionBadge";
import { events } from "./sessionEvents";

const TodaysSessions = () => {
  const sessions = events.map((event) => ({
    doctor: event.title,
    therapy: event.therapy,
    time: format(new Date(event.start), "h:mm a"),
    color: event.color,
  }));

  return (
    <div className="mt-12 px-4 min-h-screen py-10">
      <h2 className="text-2xl font-bold text-[#1E3CA7] mb-6">Today’s Session</h2>
      <div className="bg-white border border-[#2196F3] rounded-3xl p-6 flex flex-wrap gap-y-4 max-w-3xl mx-auto">
        {sessions.map((session, i) => (
          <SessionBadge
            key={i}
            doctor={session.doctor}
            therapy={session.therapy}
            time={session.time}
            color={session.color || "#ccc"}
          />
        ))}
      </div>
    </div>
  );
};

export default TodaysSessions;

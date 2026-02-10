"use client";
import React, { useState } from "react";
import Reschedule, { Session as RescheduleSession } from "./Reschedule";

interface Session extends RescheduleSession {}

interface NextSessionBoxProps {
  nextSession: Session | null;
}

function prettyDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function prettyTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const dt = new Date();
  dt.setHours(h, m || 0, 0, 0);
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function sessionTypeFromTitle(title?: string): string | null {
  if (!title) return null;
  const t = title.toLowerCase();
  const norm = t.replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
  if (norm.includes("follow up") || norm.includes("followup")) return "Follow-up";
  if (norm.includes("initial")) return "Initial";
  if (norm.includes("emergency")) return "Emergency";
  return null;
}

function prettyTransportType(transport?: Session["type"]): string {
  if (!transport) return "Session";
  if (transport === "in-person") return "In person";
  return transport.charAt(0).toUpperCase() + transport.slice(1);
}

function resolveSessionTypeLabel(s: Session): string {
  if (s.session_type && s.session_type.trim()) return s.session_type.trim();
  const fromTitle = sessionTypeFromTitle(s.title);
  if (fromTitle) return fromTitle;
  return prettyTransportType(s.type);
}

export const NextSessionBox: React.FC<NextSessionBoxProps> = ({ nextSession }) => {
  const [open, setOpen] = useState(false);
  const typeLabel = nextSession ? resolveSessionTypeLabel(nextSession) : "";

  return (
    <>
      <div
        className="bg-white border-2 border-[#2196F3] rounded-[24px] p-4 sm:p-6 shadow-sm h-full flex flex-col"
        style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-[#1E3CA7] mb-2 text-center">
          Next Session
        </h3>

        <div
          className="w-full mb-6"
          style={{ height: "5px", backgroundColor: "#D0E3FFC7", borderRadius: "2px" }}
        />

        {nextSession ? (
          <>
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-center">
                <span className="text-lg sm:text-xl text-[#1E3CA7] font-bold">
                  • {prettyDate(nextSession.date)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-lg sm:text-xl text-[#1E3CA7] font-bold">
                  • At {prettyTime(nextSession.time)}
                </span>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
              <p className="text-base sm:text-xl text-[#1E3CA7]">
                <span className="font-bold">Patient:</span> {nextSession.patient_name}
              </p>
              <p className="text-base sm:text-xl text-[#1E3CA7]">
                <span className="font-bold">Session Type:</span> {typeLabel}
              </p>
            </div>

            <div className="mt-auto">
              <button
                className="w-full bg-[#D0E9FF] border border-[#2196F3] text-[#1E3CA7] px-5 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl hover:bg-[#2196F3] hover:text-white transition rounded-[50px]"
                style={{ fontWeight: 700, boxShadow: "0px 4px 4px 0px #00000040" }}
                onClick={() => setOpen(true)}
              >
                Reschedule
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#1E3CA7] text-base sm:text-lg">No upcoming sessions scheduled</p>
          </div>
        )}
      </div>

      <Reschedule open={open} session={nextSession as any} onClose={() => setOpen(false)} onSaved={() => {}} />
    </>
  );
};

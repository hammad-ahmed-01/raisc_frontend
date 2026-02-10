"use client";
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";

import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./custom-calendar.css";

import SessionSummary, { SessionSummaryData } from "./SessionSummary";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export interface Session {
  id: string;
  patient_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "video" | "audio" | "in-person";
  session_type?: string | null;
  doctor_summary?: string;
  title?: string;
}

interface SessionsCalendarBoxProps {
  sessions: Session[];
}

export const SessionsCalendarBox: React.FC<SessionsCalendarBoxProps> = ({ sessions }) => {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const [openSummary, setOpenSummary] = useState(false);
  const [selected, setSelected] = useState<SessionSummaryData | null>(null);

  const events = sessions.map((s) => {
    const [hourStr, minuteStr] = s.time.split(":");
    const start = new Date(s.date);
    start.setHours(parseInt(hourStr, 10) || 0, parseInt(minuteStr, 10) || 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    return {
      title: `${s.patient_name} (${s.session_type || s.type})`,
      start,
      end,
      allDay: false,
      resource: s,
    };
  });

  const handleNext = () => {
    const d = new Date(date);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week" || view === "agenda") d.setDate(d.getDate() + 7);
    else if (view === "day") d.setDate(d.getDate() + 1);
    setDate(d);
  };
  const handleBack = () => {
    const d = new Date(date);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week" || view === "agenda") d.setDate(d.getDate() - 7);
    else if (view === "day") d.setDate(d.getDate() - 1);
    setDate(d);
  };
  const handleToday = () => setDate(new Date());

  function toYmd(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <>
      <div className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-2xl p-4 shadow-md">
        <h3 className="text-xl sm:text-2xl font-bold text-[#1E3CA7] text-center mb-4">Your sessions</h3>

        {/* -------- Mobile toolbar: prevents overflow -------- */}
        <div className="mb-4 sm:hidden">
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={handleToday}
              className="col-span-1 w-full px-3 py-2 bg-[#56A8FF] text-white font-bold rounded border border-[#2196F3]"
            >
              Today
            </button>
            <button
              onClick={handleBack}
              className="col-span-1 w-full px-3 py-2 bg-[#F6E9F9] text-[#1E3CA7] font-bold rounded border border-[#2196F3]"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="col-span-1 w-full px-3 py-2 bg-[#F6E9F9] text-[#1E3CA7] font-bold rounded border border-[#2196F3]"
            >
              Next
            </button>

            {/* Full-width row for the view selector so it never sticks out */}
            <select
              value={view}
              onChange={(e) => setView(e.target.value as View)}
              className="col-span-3 mt-2 w-full border border-[#2196F3] rounded px-3 py-2 text-[#1E3CA7] bg-white"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>
        </div>

        {/* -------- Desktop/Tablet toolbar (unchanged) -------- */}
        <div className="mb-4 hidden sm:grid grid-cols-9 border-2 border-[#2196F3] rounded-lg overflow-hidden">
          <button onClick={handleToday} className="px-4 py-2 bg-[#F6E9F9] text-[#1E3CA7] font-bold border-r border-[#2196F3] hover:bg-[#2196F3] hover:text-white transition">
            Today
          </button>
          <button onClick={handleBack} className="px-4 py-2 bg-[#F6E9F9] text-[#1E3CA7] font-bold border-r border-[#2196F3] hover:bg-[#2196F3] hover:text-white transition">
            Back
          </button>
          <button onClick={handleNext} className="px-4 py-2 bg-[#F6E9F9] text-[#1E3CA7] font-bold border-r border-[#2196F3] hover:bg-[#2196F3] hover:text-white transition">
            Next
          </button>
          <div className="col-span-2 px-4 py-2 text-xl font-bold text-[#1E3CA7] bg-[#D0E9FF] border-r border-[#2196F3] flex items-center justify-center">
            {format(date, "MMMM yyyy")}
          </div>
          <button onClick={() => setView("month")} className={`px-4 py-2 font-bold hover:bg-[#2196F3] hover:text-white border-r border-[#2196F3] transition ${view === "month" ? "bg-[#2196F3] text-white" : "bg-[#F6E9F9] text-[#1E3CA7]"}`}>
            Month
          </button>
          <button onClick={() => setView("week")} className={`px-4 py-2 font-bold hover:bg-[#2196F3] hover:text-white border-r border-[#2196F3] transition ${view === "week" ? "bg-[#2196F3] text-white" : "bg-[#F6E9F9] text-[#1E3CA7]"}`}>
            Week
          </button>
          <button onClick={() => setView("day")} className={`px-4 py-2 font-bold hover:bg-[#2196F3] hover:text-white border-r border-[#2196F3] transition ${view === "day" ? "bg-[#2196F3] text-white" : "bg-[#F6E9F9] text-[#1E3CA7]"}`}>
            Day
          </button>
          <button onClick={() => setView("agenda")} className={`px-4 py-2 font-bold hover:bg-[#2196F3] hover:text-white transition ${view === "agenda" ? "bg-[#2196F3] text-white" : "bg-[#F6E9F9] text-[#1E3CA7]"}`}>
            Agenda
          </button>
        </div>

        {/* Calendar */}
        <div className="h-[460px] md:h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day", "agenda"]}
            view={view}
            date={date}
            onView={(v) => setView(v)}
            onNavigate={(d) => setDate(d)}
            toolbar={false}
            style={{ height: "100%" }}
            className="custom-calendar"
            onSelectEvent={(ev: any) => {
              const s = ev?.resource as Session | undefined;
              if (!s) return;
              setSelected({
                id: s.id,
                patient_display_name: s.patient_name,
                patient_name: s.patient_name,
                date: toYmd(ev.start as Date),
                doctor_summary: s.doctor_summary || "",
              });
              setOpenSummary(true);
            }}
          />
        </div>
      </div>

      <SessionSummary open={openSummary} session={selected} onClose={() => setOpenSummary(false)} onSaved={() => {}} />
    </>
  );
};

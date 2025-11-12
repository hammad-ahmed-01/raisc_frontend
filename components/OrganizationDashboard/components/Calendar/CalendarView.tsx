"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useState, useEffect } from "react";
import { CustomToolbar, dayPropGetter } from "./CalendarUtils";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface BackendEvent {
  id: number;
  title: string;
  date: string;
  doctor_summary: string;
  description?: string;
  details?: string;
  patient_update?: string;
  doctor_id: number;
  patient_id: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  doctor: string;
}

export default function CalendarWrapper() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getAuthHeader = () => ({
    Authorization: `Token ${
      typeof window !== "undefined" ? localStorage.getItem("session_key") : ""
    }`,
  });

  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true);
        const res = await fetch("/api/organization/doctor-calendar", {
          headers: getAuthHeader(),
        });
        if (!res.ok) throw new Error("Failed to load calendar data");
        const data: BackendEvent[] = await res.json();

        const formatted: CalendarEvent[] = data.map((ev) => ({
          id: ev.id,
          title: ev.title || "Session",
          start: new Date(ev.date),
          end: new Date(ev.date),
          doctor: ev.doctor_summary || `Doctor ${ev.doctor_id}`,
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Calendar fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, []);

  const doctorList = Array.from(new Set(events.map((e) => e.doctor)));
  const filteredEvents = selectedDoctor
    ? events.filter((e) => e.doctor === selectedDoctor)
    : events;

  if (loading) {
    return (
      <div className="p-4 text-[#1E3CA7] font-semibold text-lg text-center">
        Loading calendar...
      </div>
    );
  }

  return (
    <div id="3" className="mt-12 sm:mt-16 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1E3CA7] text-center sm:text-left">
          Calendar
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-2 sm:mt-0">
          <label
            htmlFor="doctor-filter"
            className="text-heading2 font-medium text-sm sm:text-base"
          >
            Filter By:
          </label>
          <select
            id="doctor-filter"
            className="h-10 px-4 rounded-full bg-white border border-gray-300 shadow-sm text-heading2 text-sm sm:text-base"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctorList.map((doctor) => (
              <option key={doctor} value={doctor}>
                {doctor}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-2 sm:p-4 text-heading2">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={["month", "week", "day"]}
          view={view}
          date={currentDate}
          onView={(v) => {
            if (v === "month" || v === "week" || v === "day") setView(v);
          }}
          onNavigate={setCurrentDate}
          components={{
            toolbar: (props) => <CustomToolbar {...props} setView={setView} />,
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: "#1E3CA7",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              padding: "4px 6px",
            },
          })}
          dayPropGetter={(date) => dayPropGetter(date, currentDate)}
        />
      </div>
    </div>
  );
}

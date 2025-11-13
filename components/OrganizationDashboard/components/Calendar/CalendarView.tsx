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
  doctor_summary: string | null;
  doctor_id: number;
  patient_id: number;
}

interface DoctorBackend {
  id: number;
  doctor_name: string;
  professional_information: {
    display_name: string;
  };
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
    async function loadData() {
      try {
        setLoading(true);

        const doctorRes = await fetch("/api/organization/view-doctors", {
          headers: getAuthHeader(),
        });
        const doctorData: DoctorBackend[] = await doctorRes.json();

        // Build doctor map
        const doctorMap: Record<number, string> = {};
        doctorData.forEach((doc) => {
          const finalName =
            doc.professional_information?.display_name || doc.doctor_name;
          doctorMap[doc.id] = finalName;
        });

        const calRes = await fetch("/api/organization/doctor-calendar", {
          headers: getAuthHeader(),
        });
        const calData: BackendEvent[] = await calRes.json();

        const formatted: CalendarEvent[] = calData.map((ev) => {
          const bySummary = ev.doctor_summary;
          const byId = doctorMap[ev.doctor_id];
          const firstDoctorFallback =
            doctorData.find((d) => d.id === ev.doctor_id)?.doctor_name ||
            doctorData[0]?.doctor_name ||
            "Unknown";

          return {
            id: ev.id,
            title: ev.title || "Session",
            start: new Date(ev.date),
            end: new Date(ev.date),
            doctor: bySummary || byId || firstDoctorFallback,
          };
        });

        setEvents(formatted);
      } catch (err) {
        console.error("Calendar error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
        <h2 className="text-xl sm:text-2xl font-bold text-[#1E3CA7]">
          Calendar
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="text-heading2 font-medium text-sm sm:text-base">
            Filter By:
          </label>

          <select
            className="h-10 px-4 rounded-full bg-white border border-gray-300 shadow-sm"
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

      <div className="p-2 sm:p-4">
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
            if (v === "month" || v === "week" || v === "day") {
              setView(v);
            }
          }}
          onNavigate={setCurrentDate}
          components={{
            toolbar: (props) => <CustomToolbar {...props} setView={setView} />,
          }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#1E3CA7",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
            },
          })}
          dayPropGetter={(date) => dayPropGetter(date, currentDate)}
        />
      </div>
    </div>
  );
}

"use client";

import {
  Calendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

import {
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";

import { selectedDate, events, sessionColors } from "./sessionEvents";
import {
  CustomToolbar,
  eventPropGetter,
  dayPropGetter,
} from "./CalendarUtils";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function CalendarWrapper() {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [view, setView] = useState<Views>("month");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");

  const filteredEvents = selectedDoctor
    ? events.filter((e) => e.doctor === selectedDoctor)
    : events;

  return (
    <div className="mt-16 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#1E3CA7]">Calendar</h2>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <label htmlFor="doctor-filter" className="text-heading2 font-medium">Filter By:</label>
          <select
            id="doctor-filter"
            className="h-10 px-4 rounded-full bg-white border border-gray-300 shadow-sm text-heading2"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {Object.keys(sessionColors).map((doctor) => (
              <option key={doctor} value={doctor}>
                {doctor}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 text-heading2">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={["month", "week", "day"]}
          view={view}
          date={currentDate}
          onView={setView}
          onNavigate={setCurrentDate}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                setView={setView}
              />
            ),
          }}
          eventPropGetter={eventPropGetter}
          dayPropGetter={(date) => dayPropGetter(date, currentDate)}
        />
      </div>
    </div>
  );
}

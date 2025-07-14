'use client';
import { useState } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  View,
} from 'react-big-calendar';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './custom-calendar.css'; // You’ll create this file below

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Session {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'in-person';
}

interface SessionsCalendarBoxProps {
  sessions: Session[];
}

export const SessionsCalendarBox: React.FC<SessionsCalendarBoxProps> = ({ sessions }) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const events = sessions.map((s) => {
    const [hour, minute] = s.time.split(':');
    const start = new Date(s.date);
    start.setHours(parseInt(hour), parseInt(minute));
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    return {
      title: `${s.patient_name} (${s.type})`,
      start,
      end,
      allDay: false,
    };
  });

  const handleNext = () => {
    const newDate = new Date(date);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week' || view === 'agenda') newDate.setDate(newDate.getDate() + 7);
    else if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };

  const handleBack = () => {
    const newDate = new Date(date);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week' || view === 'agenda') newDate.setDate(newDate.getDate() - 7);
    else if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  return (
    <div className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-2xl p-4 shadow-md">
      <h3 className="text-2xl font-bold text-[#1E3CA7] text-center mb-4">Your sessions</h3>

      {/* Custom Top Bar */}
      <div className="grid grid-cols-9 border-2 border-[#2196F3] rounded-lg overflow-hidden mb-4">
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
          {format(date, 'MMMM yyyy')}
        </div>
        <button onClick={() => setView('month')} className={`px-4 py-2 font-bold border-r border-[#2196F3] transition ${view === 'month' ? 'bg-[#2196F3] text-white' : 'bg-[#F6E9F9] text-[#1E3CA7]'}`}>
          Month
        </button>
        <button onClick={() => setView('week')} className={`px-4 py-2 font-bold border-r border-[#2196F3] transition ${view === 'week' ? 'bg-[#2196F3] text-white' : 'bg-[#F6E9F9] text-[#1E3CA7]'}`}>
          Week
        </button>
        <button onClick={() => setView('day')} className={`px-4 py-2 font-bold border-r border-[#2196F3] transition ${view === 'day' ? 'bg-[#2196F3] text-white' : 'bg-[#F6E9F9] text-[#1E3CA7]'}`}>
          Day
        </button>
        <button onClick={() => setView('agenda')} className={`px-4 py-2 font-bold transition ${view === 'agenda' ? 'bg-[#2196F3] text-white' : 'bg-[#F6E9F9] text-[#1E3CA7]'}`}>
          Agenda
        </button>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day', 'agenda']}
        view={view}
        date={date}
        onView={(newView) => setView(newView)}
        onNavigate={(newDate) => setDate(newDate)}
        toolbar={false} 
        style={{ height: '600px' }}
        className="custom-calendar"
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { NextSessionBox } from './NextSessionBox';
import { SessionsCalendarBox } from './SessionsCalendarBox';

interface Session {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'in-person';
}

export const SessionCalendar: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockSessions: Session[] = [
      {
        id: '1',
        patient_name: 'Sarah Malik',
        date: '2025-06-24',
        time: '11:00 AM',
        type: 'video'
      },
      {
        id: '2',
        patient_name: 'Ahmed Khan',
        date: '2025-06-25',
        time: '2:00 PM',
        type: 'audio'
      }
    ];
    
    setSessions(mockSessions);
    setNextSession(mockSessions[0]);
  }, []);

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
    <div className="grid grid-cols-5 gap-4">
      {/* Next Session Box - Takes 1/5 of the width */}
      <div className="col-span-1">
        <NextSessionBox nextSession={nextSession} />
      </div>
      
      {/* Sessions Calendar Box - Takes 4/5 of the width */}
      <div className="col-span-4">
        <SessionsCalendarBox sessions={sessions} />
      </div>
    </div>
  );
};
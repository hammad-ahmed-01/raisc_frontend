import React, { useState } from 'react';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('Month');
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate June 2025 calendar
  const generateJuneCalendar = () => {
    const days = [];
    // June 2025 starts on Sunday
    const startDay = 0;
    
    // Add empty cells for days before June 1st
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add June days (1-30)
    for (let day = 1; day <= 30; day++) {
      days.push(day);
    }
    
    // Add July days to complete the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(`july-${day}`);
    }
    
    return days;
  };

  const calendarDays = generateJuneCalendar();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-2xl p-6 shadow-sm">
      <h3 className="text-2xl font-bold text-[#1E3CA7] text-center mb-4">
        Your sessions
      </h3>

      {/* Combined navigation row styled like the picture */}
      <div className="grid grid-cols-8 border-2 border-[#2196F3] rounded-lg overflow-hidden mb-0">
        {/* Navigation buttons - with borders between cells */}
        <button className="px-4 py-2 text-base bg-[#F6E9F9] text-[#1E3CA7] font-bold hover:bg-[#2196F3] hover:text-white transition border-r border-[#2196F3]">
          Today
        </button>
        <button className="px-4 py-2 text-base bg-[#F6E9F9] text-[#1E3CA7] font-bold hover:bg-[#2196F3] hover:text-white transition border-r border-[#2196F3]">
          Back
        </button>
        <button className="px-4 py-2 text-base bg-[#F6E9F9] text-[#1E3CA7] font-bold hover:bg-[#2196F3] hover:text-white transition border-r border-[#2196F3]">
          Next
        </button>
        
        {/* Month display in the center with more width - span 2 columns */}
        <div className="px-4 py-2 text-xl font-bold text-[#1E3CA7] bg-[#D0E9FF] col-span-2 flex items-center justify-center border-r border-[#2196F3]">
          June 2025
        </div>
        
        {/* View options */}
        <button className="px-4 py-2 text-base bg-[#F6E9F9] text-[#1E3CA7] font-bold hover:bg-[#2196F3] hover:text-white transition border-r border-[#2196F3]">
          Month
        </button>
        <button className="px-4 py-2 text-base bg-[#F6E9F9] text-[#1E3CA7] font-bold hover:bg-[#2196F3] hover:text-white transition border-r border-[#2196F3]">
          Week
        </button>
        <button className="px-4 py-2 text-base bg-[#F6E9F9] text-[#1E3CA7] font-bold hover:bg-[#2196F3] hover:text-white transition">
          Day
        </button>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 flex flex-col">
        {/* Week days header - white background, no vertical gap */}
        <div className="grid grid-cols-7 gap-x-1 gap-y-0 border-t-0">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-base font-bold text-[#1E3CA7] py-3 bg-white border border-[#2196F3]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid - no vertical gap */}
        <div className="grid grid-cols-7 gap-x-1 gap-y-0">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day !== null && typeof day === 'number';
            const isNextMonth = typeof day === 'string' && day.includes('july');
            const displayDay = isNextMonth ? day.split('-')[1] : day;
            
            // Check if this day has sessions (days 9 and 16 based on your example)
            const hasSession = [9, 16].includes(day as number);
            
            return (
              <div
                key={index}
                className={`
                  relative text-center py-2 text-base border border-[#2196F3] min-h-[40px] flex items-center justify-center
                  ${isCurrentMonth && !hasSession && day !== 24 ? 'bg-white text-[#1E3CA7] font-normal' : ''}
                  ${isNextMonth ? 'bg-[#7A8BA0] text-white font-normal' : ''}
                  ${day === 24 ? 'bg-[#2196F3] text-white font-bold' : ''}
                  ${hasSession ? 'bg-[#D7E2FE] text-[#1E3CA7] font-bold' : ''}
                `}
              >
                {displayDay}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* View Full Schedule Button with box shadow */}
      <div className="flex justify-center mt-6">
        <button 
          className="bg-[#D0E9FF] border-2 border-[#2196F3] text-[#1E3CA7] px-10 py-3 text-base font-bold hover:bg-[#2196F3] hover:text-white transition rounded-full"
          style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
        >
          View Full Schedule
        </button>
      </div>
    </div>
  );
};
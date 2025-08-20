import React from 'react';

interface Session {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'in-person';
}

interface NextSessionBoxProps {
  nextSession: Session | null;
}

export const NextSessionBox: React.FC<NextSessionBoxProps> = ({ nextSession }) => {
  return (
    <div 
      className="bg-white border-2 border-[#2196F3] rounded-[24px] p-6 shadow-sm h-full flex flex-col"
      style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
    >
      <h3 className="text-3xl font-bold text-[#1E3CA7] mb-2 text-center" style={{ fontWeight: 700 }}>
        Next Session
      </h3>
      
      {/* Horizontal line with the specified styling */}
      <div 
        className="w-full mb-6"
        style={{ 
          height: '5px', 
          backgroundColor: '#D0E3FFC7',
          borderRadius: '2px'
        }}
      ></div>
      
      {nextSession ? (
        <>
          <div className="space-y-3 mb-8">
            <div className="flex items-center">
              <span className="text-xl text-[#1E3CA7]" style={{ fontWeight: 700 }}>• June 24, 2025</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl text-[#1E3CA7]" style={{ fontWeight: 700 }}>• At 11:00 AM</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            <p className="text-xl text-[#1E3CA7]">
              <span style={{ fontWeight: 700 }}>Patient:</span> Sarah Malik
            </p>
            <p className="text-xl text-[#1E3CA7]">
              <span style={{ fontWeight: 700 }}>Session Type:</span> Video
            </p>
          </div>
          
          <div className="mt-auto">
            <button 
              className="w-full bg-[#D0E9FF] border border-[#2196F3] text-[#1E3CA7] px-6 py-4 text-2xl hover:bg-[#2196F3] hover:text-white transition rounded-[50px]"
              style={{ 
                fontWeight: 700,
                boxShadow: '0px 4px 4px 0px #00000040'
              }}
            >
              Reschedule
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#1E3CA7] text-lg" style={{ fontWeight: 400 }}>No upcoming sessions scheduled</p>
        </div>
      )}
    </div>
  );
};
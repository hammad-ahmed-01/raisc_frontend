"use client";
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { DoctorProfileCard } from './components/DoctorProfileCard';
import { QuoteSection } from './components/QuoteSection';
import { SessionCalendar } from './components/SessionCalendar';
import TopRightIcons from "@/components/TopRightIcons";

interface User {
  username: string;
  doctor_profile?: {
    professional_information?: {
      specialization: string;
      experience: string;
      qualifications: string;
    };
    rates?: string;
  };
}

const DoctorDashboard: React.FC<{ user: User}> = ({ user }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    // If user is passed as prop, use it
    if (user) {
      setCurrentUser(user);
      return;
    }
    
    // Otherwise fetch from localStorage
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen flex">
      <div 
        className="flex-1 bg-cover bg-center bg-no-repeat pb-16 px-8"
        style={{ backgroundImage: "url('/doctordashboard/bg.png')" }}
      >
        <TopRightIcons />

        {/* Header */}
        <div className="ml-20">
          <Header name={currentUser?.username || "Dr. Ali Hamza"} />
        </div>

        {/* Main Content - positioned to align with background */}
        <div className="mt-48 ml-20">
          {/* Doctor Profile Card - Full Width */}
          <div className="mb-6">
            <DoctorProfileCard 
              doctor={{
                name: currentUser?.username || "Dr. Ali Hamza",
                specialization: currentUser?.doctor_profile?.professional_information?.specialization || "Cognitive Therapy",
                rating: 4.7,
                experience: currentUser?.doctor_profile?.professional_information?.experience || "5 years",
                rates: currentUser?.doctor_profile?.rates || "$100/hr/session",
                organization: "Pakistan Institute of Mental Health(PIMH)",
                location: "Rawalpindi, Pakistan"
              }}
            />
          </div>

          {/* Quote Section - Not full width */}
          <div className="mb-6 max-w-4xl mx-auto">
            <QuoteSection />
          </div>

          {/* Session Calendar Section */}
          <div className="mb-6">
            <SessionCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
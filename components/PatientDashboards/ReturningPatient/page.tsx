"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './components/Header';
import { QuoteCarousel } from './components/QuoteCarousel';
import { Resources } from './components/Resources';
import { TherapistCard } from './components/TherapistCard';
import TopRightIcons from "@/components/TopRightIcons";
import { ChatBot } from './components/ChatBot';

interface User {
  username: string;
  patient_profile?: {
    associated_psychologist: string | null;
    associated_psychologist_name: string | null;
    sent_requests?: string[];
  };
}

const Dashboard: React.FC<{ user?: any }> = ({ user }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requestedDoctor, setRequestedDoctor] = useState<any>(null);
  
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

  useEffect(() => {
    // First check for a selected doctor directly from localStorage
    const selectedDoctorData = localStorage.getItem('selectedDoctor');
    if (selectedDoctorData) {
      try {
        const doctor = JSON.parse(selectedDoctorData);
        if (doctor.requestStatus === 'pending' || doctor.requestStatus === 'accepted') {
          setRequestedDoctor(doctor);
          return;
        }
      } catch (error) {
        console.error("Error parsing selected doctor data:", error);
      }
    }
    
    // If no doctor from localStorage or not pending/accepted, check user's sent_requests
    if (currentUser?.patient_profile?.sent_requests?.length) {
      // If user has sent requests but no selected doctor is found,
      // we could implement additional logic here to fetch doctor data from another source
      // For now, we'll rely on the selectedDoctor in localStorage
    }
  }, [currentUser]);

  // Navigate to doctors page
  const handleViewMoreClick = () => {
    router.push('/Doctors');
  };
  
  return (
    <div
      className="flex min-h-screen bg-cover bg-center ml-8 px-2 sm:px-4 lg:px-0"
      style={{ backgroundImage: "url('/bg/returningbg.png')" }}
    >
      <div className="flex-1 px-1 sm:px-2 lg:px-6 py-4 sm:py-6">
        {/* Header */}
      <TopRightIcons />

        <Header name={currentUser?.username || "Hira"} />

        {/* Three Column Layout */}
        <div className="mb-8 sm:mb-16 grid grid-cols-1 lg:grid-cols-3 mt-8 sm:mt-12 lg:mt-24 gap-3 sm:gap-4 lg:gap-6">
          {/* Column 1: Quote + Resources */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-6 order-2 lg:order-1">
            <QuoteCarousel />
            <Resources />
          </div>

          {/* Column 2: Therapist Card */}
          <div className="mb-8 sm:mb-16 flex justify-center order-1 lg:order-2">
            <TherapistCard 
              doctor={requestedDoctor}
              hasRequest={!!requestedDoctor}
              requestStatus={requestedDoctor?.requestStatus || 'none'}
              onViewMoreClick={handleViewMoreClick}
            />
          </div>

          {/* Column 3: ChatBot */}
          <div className="flex justify-center items-end order-3 mb-8 sm:mb-16">
            <ChatBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

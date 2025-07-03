"use client"

import TopRightIcons from "./components/Navigation";
import Psychologist from "./components/Psychologist";
import Association from "./components/Association";
import { useEffect, useState } from 'react';

export default function NewPatientHome() {
  const [userName, setUserName] = useState("Patient");
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/user/current`);
          if (response.ok) {
            const data = await response.json();
            setUserName(data.name || "Patient");
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-6 sm:py-10 px-2 sm:px-4"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      {/* Reusable top-right icons component */}
      <TopRightIcons />

      <div className="relative min-h-screen py-6 sm:py-10 px-2 sm:px-4 z-10 pt-12 sm:pt-16">
        <h1 className="text-heading text-xl sm:text-4xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)] text-center">
          Welcome back, {userName}
        </h1>
        <p className="text-center text-sm sm:text-xl text-heading2 mt-2 px-2">
          "Healing takes time, asking for help is a courageous step"
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-6 sm:mt-10 ml-0 sm:ml-20">
          <Psychologist />
          <Association />
        </div>
      </div>
    </div>
  );
}

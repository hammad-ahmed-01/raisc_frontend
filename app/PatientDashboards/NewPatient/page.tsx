"use client"

// NewPatientHome.tsx
import Quote from "./components/Quote";
import AIChat from "./components/AIChat";
import TopRightIcons from "./components/Navigation";
import { useEffect, useState } from 'react';

export default function NewPatientHome() {
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/user/current`);
          if (response.ok) {
            const data = await response.json();
            setUserName(data.name || "");
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
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      {/* Reusable top-right icons component */}
      <TopRightIcons />

      <div className="relative min-h-screen py-10 px-4 z-10">
        <h1 className="text-heading text-4xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
          Welcome {userName ? `${userName}, ` : ''}to RAISC
        </h1>
        <p className="text-center text-xl text-heading2 mt-2">
          The journey of thousand miles begin with one step
        </p>

        <Quote />
        <AIChat />
      </div>
    </div>
  );
}

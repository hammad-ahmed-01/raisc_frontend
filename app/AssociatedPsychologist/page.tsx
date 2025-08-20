"use client"

import TopRightIcons from "./components/Navigation";
import Psychologist from "./components/Psychologist";
import Association from "./components/Association";
import { useEffect, useState } from 'react';
import { checkAuth, redirectToLogin } from "@/lib/auth";

export default function NewPatientHome() {
  const [userName, setUserName] = useState("Patient");
  const [authError, setAuthError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }
      
      // Check if user is a doctor (not allowed to access this page)
      if (authResult.user?.user_type === 'doctor') {
        setAuthError("Doctors cannot access the Associated Psychologist page");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
        return;
      }
      
      setUserName(authResult.user?.username || "Patient");
      setIsLoading(false);
    };

    performAuthCheck();
  }, []);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

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
          {"Healing takes time, asking for help is a courageous step"}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-6 sm:mt-10 ml-0 sm:ml-20">
          <Psychologist />
          <Association />
        </div>
      </div>
    </div>
  );
}

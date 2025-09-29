"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { DoctorProfileCard } from "./components/DoctorProfileCard";
import { QuoteSection } from "./components/QuoteSection";
import { SessionCalendar } from "./components/SessionCalendar";
import TopRightIcons from "@/components/TopRightIcons";

interface User {
  username: string;
  profile_image?: string; // sometimes on top-level
  avatar?: string;
  doctor_profile?: {
    profile_image?: string; // some serializers put it here
    location?: string;
    professional_information?: {
      specialization?: string;
      experience?: string;
      qualifications?: string;
      profile_image?: string; // most common place
      location?: string;
      rating?: number;
    };
    rates?: string;
  };
}

const DoctorDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }
    try {
      const raw = localStorage.getItem("user_data");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }
  }, [user]);

  const name =
    currentUser?.username
      ? `Dr. ${currentUser.username}`
      : "Dr. Ali Hamza";

  const specialization =
    currentUser?.doctor_profile?.professional_information?.specialization ||
    "Cognitive Therapy";

  const experience =
    currentUser?.doctor_profile?.professional_information?.experience ||
    "5 years";

  const rates =
    currentUser?.doctor_profile?.rates || "$100/hr/session";

  // Uniform image (same as Account/Edit-Profile mapping)
  const imageUrl = useMemo(() => {
    return (
      currentUser?.doctor_profile?.professional_information?.profile_image ||
      currentUser?.doctor_profile?.profile_image ||
      currentUser?.profile_image ||
      currentUser?.avatar ||
      ""
    );
  }, [currentUser]);

  // Location from backend (prefer professional_information → doctor_profile)
  const locationText =
    currentUser?.doctor_profile?.professional_information?.location ||
    currentUser?.doctor_profile?.location ||
    "—";

  // Backend rating on profile, fallback to null (stats will refine in the card)
  const backendRating =
    currentUser?.doctor_profile?.professional_information?.rating;

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-top bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/doctordashboard/bg.png')" }}
        aria-hidden
      />

      {/* Content */}
      <div className="min-h-screen px-4 sm:px-8 pb-16">
        <div className="pt-4 sm:pt-6">
          <TopRightIcons />
        </div>

        <div className="mt-2 sm:mt-3 sm:ml-20">
          <Header name={name} />
        </div>

        <main className="mt-12 sm:mt-24 sm:ml-20 space-y-6 sm:space-y-8">
          <section>
            <DoctorProfileCard
              doctor={{
                name,
                specialization,
                rating: backendRating, // stats in card may override with fresher value
                experience,
                rates,
                organization: "Pakistan Institute of Mental Health(PIMH)",
                location: locationText,
                imageUrl, // NEW: uniform image from backend
              }}
            />
          </section>

          <section className="max-w-4xl mx-auto w-full">
            <QuoteSection />
          </section>

          <section>
            <SessionCalendar />
          </section>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;

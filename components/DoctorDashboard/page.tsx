"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./components/Header";
import { DoctorProfileCard } from "./components/DoctorProfileCard";
import { QuoteSection } from "./components/QuoteSection";
import { SessionCalendar } from "./components/SessionCalendar";
import TopRightIcons from "../TopRightIcons";

interface User {
  username: string;
  profile_image?: string;
  avatar?: string;
  doctor_profile?: {
    profile_image?: string;
    location?: string;
    organization_id?: number;
    organization?: number;
    professional_information?: {
      specialization?: string;
      experience?: string;
      qualifications?: string;
      profile_image?: string;
      location?: string;
      rating?: number;
      organization_id?: number;
    };
    rates?: string;
  };
}

interface OrganizationDetails {
  id?: number;
  name?: string;
  location?: string;
  description?: string;
  logo?: string;
  contact_email?: string;
  contact_phone?: string;
  user_id?: number;
}

const DoctorDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

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

  // Fetch organization details based on doctor's organization_id
  useEffect(() => {
    const fetchOrganizationProfile = async () => {
      // Get organization_id from doctor profile
      const organizationId =
        currentUser?.doctor_profile?.organization_id ||
        currentUser?.doctor_profile?.organization ||
        currentUser?.doctor_profile?.professional_information?.organization_id;

      if (!organizationId) {
        console.warn("No organization_id found in doctor profile");
        return;
      }

      setIsLoadingOrg(true);
      try {
        const response = await fetch(
          `/api/organization/profile?organization_id=${organizationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrganizationDetails(data);
          
          // Store organization_user_id in localStorage for organization-details page
          if (data.user_id) {
            localStorage.setItem("organization_user_id", String(data.user_id));
          }
        } else {
          console.error("Failed to fetch organization profile:", response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error("Error details:", errorData);
        }
      } catch (error) {
        console.error("Error fetching organization profile:", error);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    if (currentUser) {
      fetchOrganizationProfile();
    }
  }, [currentUser]);

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

  // Location from backend (prefer professional_information → doctor_profile → organization)
  const locationText =
    currentUser?.doctor_profile?.professional_information?.location ||
    currentUser?.doctor_profile?.location ||
    organizationDetails?.location ||
    "—";

  // Backend rating on profile, fallback to null (stats will refine in the card)
  const backendRating =
    currentUser?.doctor_profile?.professional_information?.rating;

  // Organization name from fetched details or fallback
  const organizationName =
    organizationDetails?.name ||
    "Pakistan Institute of Mental Health(PIMH)";

  // Handler for "View More" button
  const handleViewOrganization = () => {
    const organizationUserId = organizationDetails?.user_id;
    
    if (organizationUserId) {
      // Store in localStorage for the organization-details page
      localStorage.setItem("organization_user_id", String(organizationUserId));
      // Navigate to organization details page
      router.push("/organization-details");
    } else {
      console.warn("No organization user_id available");
      // Still navigate but the page will show appropriate error
      router.push("/organization-details");
    }
  };

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
                rating: backendRating,
                experience,
                rates,
                organization: organizationName,
                location: locationText,
                imageUrl,
              }}
              onViewOrganization={handleViewOrganization}
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
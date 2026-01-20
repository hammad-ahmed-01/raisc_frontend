// app/organization-details/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import OrganizationHeader from "./components/OrganizationHeader";
import OrganizationInfo from "./components/OrganizationInfo";
import AffiliatedDoctors from "./components/AffiliatedDoctors";
import type { Organization } from "./types";

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        // Get organization_user_id from localStorage (set from Association component)
        const orgUserId = localStorage.getItem("organization_user_id");
        
        if (!orgUserId || orgUserId === "null" || orgUserId === "undefined") {
          setError("Organization information not found. This doctor may not be affiliated with any organization.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/organization/profile?organization_id=${orgUserId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch organization details");
        }

        const data: Organization = await response.json();
        console.log("Fetched organization data:", data);  // Debug log
        console.log("Doctors array:", data.doctors);  // Debug log
        console.log("Number of doctors:", data.doctors?.length || 0);  // Debug log
        setOrganization(data);
      } catch (err) {
        console.error("Error fetching organization:", err);
        setError(err instanceof Error ? err.message : "Failed to load organization details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-gray-700 mb-6">{error || "Organization not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-heading2 text-white rounded-full font-semibold hover:bg-heading transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/patientbg.png')" }}
    >
      {/* Fixed Background Overlay */}
      <div className="fixed inset-0 bg-white/30 -z-10" />

      {/* Content */}
      <div className="relative z-10 min-h-screen py-6 sm:py-10 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-4 sm:mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition text-heading2 font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>

          {/* Organization Header */}
          <div className="mb-6 sm:mb-8">
            <OrganizationHeader organization={organization} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Organization Info */}
            <div className="lg:col-span-1">
              <OrganizationInfo organization={organization} />
            </div>

            {/* Right Column - Affiliated Doctors */}
            <div className="lg:col-span-2">
              <AffiliatedDoctors doctors={organization.doctors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
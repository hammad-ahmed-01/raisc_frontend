"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface DoctorProfileCardProps {
  doctor: {
    name: string;
    specialization: string;
    rating?: number;     // now optional; we’ll also use stats/backend
    experience: string;
    rates: string;
    organization: string;
    location?: string;   // can come from backend
    imageUrl?: string;   // NEW: uniform avatar from backend
  };
}

interface DoctorStats {
  total_patients: number;
  total_sessions: number;
  rating: number;
  reviews_count: number;
}

const isBackendConnected =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

const DJANGO_BASE =
  (typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_DJANGO_BASE_URL
    : ""
  )?.replace(/\/+$/, "") || "";

// Shared auth header builder used across the app
const buildAuthHeader = (): HeadersInit => {
  const raw =
    localStorage.getItem("session_key") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    "";
  const v = raw.trim();
  if (!v) return {};
  // Your backend expects "Token <key>"
  return { Authorization: /^token\s+/i.test(v) ? v : `Token ${v}` };
};

export const DoctorProfileCard: React.FC<DoctorProfileCardProps> = ({ doctor }) => {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prefer stats.rating if present, else doctor.rating
  const effectiveRating = useMemo(() => {
    if (stats?.rating && stats.rating > 0) return stats.rating;
    if (typeof doctor.rating === "number") return doctor.rating;
    return undefined;
  }, [stats?.rating, doctor.rating]);

  useEffect(() => {
    fetchDoctorStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDoctorStats = async () => {
    setIsLoading(true);

    if (!isBackendConnected || !DJANGO_BASE) {
      setStats({
        total_patients: 45,
        total_sessions: 120,
        rating: doctor.rating ?? 4.7,
        reviews_count: 28,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${DJANGO_BASE}/doctor/stats/`, {
        headers: {
          ...buildAuthHeader(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        // Expecting { stats: { total_patients, total_sessions, rating, reviews_count } }
        setStats(data.stats ?? null);
      } else {
        setStats({
          total_patients: 0,
          total_sessions: 0,
          rating: doctor.rating ?? 0,
          reviews_count: 0,
        });
      }
    } catch {
      setStats({
        total_patients: 0,
        total_sessions: 0,
        rating: doctor.rating ?? 0,
        reviews_count: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className="bg-white border border-[#2196F3] rounded-[24px] p-4 sm:p-6"
      style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
    >
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* LEFT COL skeleton (50%) */}
          <div className="md:basis-1/2 flex flex-col items-center gap-4">
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-200 rounded-full" />
            <div className="w-full max-w-xs">
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-2/3" />
            </div>
          </div>

          {/* RIGHT COL skeleton (50%) */}
          <div className="md:basis-1/2">
            <div className="h-10 bg-gray-200 rounded-[24px] mb-3" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Desktop: equal columns. Mobile: stacked with avatar on top and centered text. */}
      <div className="flex flex-col md:flex-row md:items-start">
        {/* LEFT COLUMN (50%)) */}
        <div className="md:basis-1/2 md:pr-6 flex flex-col md:flex-row items-center md:items-center gap-6">
          {/* Avatar (TOP on mobile) */}
          <div className="shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-[#2196F3] overflow-hidden flex items-center justify-center">
              <Image
                src={doctor.imageUrl?.trim() || "/doctordashboard/doctor.png"}
                width={144}
                height={144}
                alt="Doctor Avatar"
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Info (center on mobile, left on desktop) */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-[28px] text-[#1E3CA7] mb-1 font-bold">
              {doctor.name}
            </h3>
            <p className="text-lg md:text-xl text-[#1E3CA7] mb-2">
              {doctor.specialization}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="text-xl md:text-2xl text-yellow-400">⭐</span>
              <span className="text-lg md:text-xl text-[#1E3CA7]">
                {(effectiveRating ?? "—").toString()} Rating
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              <p className="text-base md:text-xl text-[#1E3CA7]">
                <span className="font-bold">Experience:</span>
                <span className="font-normal"> {doctor.experience}</span>
              </p>
              <p className="text-base md:text-xl text-[#1E3CA7]">
                <span className="font-bold">Rates:</span>
                <span className="font-normal"> {doctor.rates}</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (50%) */}
        <div className="md:basis-1/2 md:pl-6 w-full mt-6 md:mt-0">
          <div className="bg-[#E9F5FE] border border-[#2196F3] rounded-[24px] px-4 py-2 mb-3">
            <h4 className="text-lg sm:text-xl md:text-2xl text-[#1E3CA7] text-center font-bold">
              Affiliated Organization
            </h4>
          </div>

          <p className="text-base md:text-lg text-[#1E3CA7] text-center mb-2">
            {doctor.organization}
          </p>

          <div className="flex items-center justify-center gap-1 mb-4">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#1E3CA7]" />
            <span className="text-base md:text-lg text-[#1E3CA7]">
              {doctor.location || "—"}
            </span>
          </div>

          <div className="text-center">
            <a
              href="#"
              className="text-lg md:text-xl text-[#0004F6] underline hover:no-underline font-bold"
            >
              View More
            </a>
          </div>
        </div>
      </div>
    </Shell>
  );
};

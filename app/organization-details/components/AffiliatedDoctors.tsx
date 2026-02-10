// app/organization-details/components/AffiliatedDoctors.tsx
"use client";

import { Users } from "lucide-react";
import DoctorCard from "./DoctorCard";
import type { Doctor } from "../types";

interface Props {
  doctors: Doctor[];
}

export default function AffiliatedDoctors({ doctors }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
            Affiliated Doctors
          </h2>
          <p className="text-sm text-gray-600">
            {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"} available
          </p>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            No doctors currently affiliated with this organization
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
// app/organization-details/components/OrganizationHeader.tsx
"use client";

import { Building2 } from "lucide-react";
import type { Organization } from "../types";

interface Props {
  organization: Organization;
}

export default function OrganizationHeader({ organization }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border-2 border-blue-100">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Logo */}
        <div className="rounded-full overflow-hidden w-20 h-20 sm:w-28 sm:h-28 border-4 border-blue-200 flex-shrink-0 bg-blue-50 flex items-center justify-center">
          <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
        </div>

        {/* Organization Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-bold text-heading mb-2">
            {organization.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-red-500">📍</span>
              <span className="text-sm sm:text-base">{organization.location}</span>
            </div>
            {organization.details?.established_year && (
              <div className="flex items-center gap-2">
                <span className="text-heading2">📅</span>
                <span className="text-sm sm:text-base">
                  Est. {organization.details.established_year}
                </span>
              </div>
            )}
          </div>

          {/* Specialties */}
          {organization.details?.specialties && organization.details.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              {organization.details.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-heading2 rounded-full text-xs sm:text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
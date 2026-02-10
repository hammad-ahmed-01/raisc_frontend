// app/organization-details/components/OrganizationInfo.tsx
"use client";

import { Phone, Globe, FileText, Building } from "lucide-react";
import type { Organization } from "../types";

interface Props {
  organization: Organization;
}

export default function OrganizationInfo({ organization }: Props) {
  const { details } = organization;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-heading2 mb-4 sm:mb-6">
        Organization Information
      </h2>

      <div className="space-y-4">
        {/* Phone */}
        {details?.phone && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Phone</h3>
              <p className="text-gray-900">{details.phone}</p>
            </div>
          </div>
        )}

        {/* Website */}
        {details?.website && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Website</h3>
              <a
                href={details.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {details.website}
              </a>
            </div>
          </div>
        )}

        {/* License Number */}
        {details?.license_number && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                License Number
              </h3>
              <p className="text-gray-900">{details.license_number}</p>
            </div>
          </div>
        )}

        {/* Additional Details */}
        {Object.keys(details || {}).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Additional Information
            </h3>
            <div className="text-sm text-gray-600">
              {Object.entries(details)
                .filter(
                  ([key]) =>
                    !["phone", "website", "specialties", "license_number", "established_year"].includes(
                      key
                    )
                )
                .map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <strong className="capitalize">
                      {key.replace(/_/g, " ")}:
                    </strong>{" "}
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
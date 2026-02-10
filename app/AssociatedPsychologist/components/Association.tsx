// Association.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Phone, Globe, Clock } from "lucide-react";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

type AnyDoc = {
  id?: number;
  username?: string;
  name?: string;
  location?: string;
  phone?: string;
  affiliated_organization?: string;
  professional_information?: Record<string, any>;
  organization_id?: number | null;
};

type Organization = {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
};

export default function Association() {
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [association, setAssociation] = useState<Organization>({
    name: "Loading...",
    description: "",
    address: "Not Specified, Pakistan",
    phone: "Not Provided",
    website: "Not Added",
    hours: "Not Specified",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedDoctor");
      if (!raw) throw new Error("No doctor data found");

      const doc: AnyDoc = JSON.parse(raw);
      const orgId = doc?.organization_id ?? null;

      setOrganizationId(orgId);
      const hasOrg = orgId !== null && orgId !== undefined;
      setHasOrganization(hasOrg);

      if (hasOrg) {
        setLoadingOrg(true);
        setError(null);

        fetch(`/api/organization/profile?organization_id=${orgId}`, {
          cache: "no-store",
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch organization: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            setAssociation({
              name: data.name || "Organization",
              description: data.details?.description || "",
              address: data.location
                ? `${data.location}, Pakistan`
                : "Not Specified, Pakistan",
              phone: data.details?.phone || "Not Provided",
              website: data.details?.website || "Not Added",
              hours: data.details?.hours || "Not Specified",
            });
          })
          .catch((err) => {
            console.error("Error fetching organization:", err);
            setError("Failed to load organization details");
            setAssociation({
              name: "Organization",
              description: "",
              address: "Not Specified, Pakistan",
              phone: "Not Provided",
              website: "Not Added",
              hours: "Not Specified",
            });
          })
          .finally(() => setLoadingOrg(false));
      }
    } catch (err) {
      console.error("Failed to read selected doctor:", err);
      setHasOrganization(false);
      setError("No doctor data available");
    }
  }, []);

  const handleViewProfile = () => {
    if (organizationId) {
      // Recommended: Use query param for clean navigation (better than localStorage)
      router.push(`/organization/profile?organization_id=${organizationId}`);

      // Alternative (if you must keep old behavior):
      // localStorage.setItem("organization_user_id", String(organizationId));
      // router.push("/organization-details");
    } else {
      alert("This doctor is not affiliated with any organization.");
    }
  };

  return (
    <div className="bg-[#FEF9E7] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#0039A6]/10">
      <h2 className="text-[#0039A6] text-base sm:text-xl font-bold text-center mb-4">
        Affiliated Organization
      </h2>

      {!hasOrganization ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-[#0039A6] text-lg font-semibold mb-2">
            No Organization Affiliation
          </h3>
          <p className="text-gray-600 text-sm max-w-xs">
            This doctor is currently practicing independently.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {loadingOrg ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0039A6] border-t-transparent mb-3"></div>
              <p className="text-gray-600">Loading organization details...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="rounded-full overflow-hidden w-16 h-16 bg-blue-50 flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-[#0039A6]" />
                </div>
              </div>

              <h3 className="text-[#0039A6] text-xl font-bold text-center mb-3">
                {association.name}
              </h3>

              {association.description && (
                <p className="text-gray-700 text-sm text-center mb-5 max-w-md">
                  {association.description}
                </p>
              )}

              <div className="w-full space-y-3 text-[#0039A6] text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{association.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span>{association.hours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span>{association.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  {association.website !== "Not Added" ? (
                    <a
                      href={
                        association.website.startsWith("http")
                          ? association.website
                          : `https://${association.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {association.website}
                    </a>
                  ) : (
                    <span>Not Added</span>
                  )}
                </div>
              </div>

              <div className="mt-6 w-full flex justify-center">
                <SecondaryButton
                  onClick={handleViewProfile}
                  text="View Organization Profile"
                  className="font-semibold px-6 py-3 rounded-full w-full max-w-xs text-sm sm:text-base"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
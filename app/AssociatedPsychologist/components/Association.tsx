// Association.tsx (Updated to fetch real organization data)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
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

export default function Association() {
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [association, setAssociation] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    hours: "",
  });
  const [loadingOrg, setLoadingOrg] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedDoctor");
      console.log("Raw localStorage data:", raw);
      
      const doc: AnyDoc = raw ? JSON.parse(raw) : null;
      console.log("Parsed doctor data:", doc);

      const orgId = doc?.organization_id ?? null;
      console.log("Extracted organization_id:", orgId);
      console.log("Type of organization_id:", typeof orgId);
      
      setOrganizationId(orgId);
      const hasOrg = orgId !== null && orgId !== undefined;
      console.log("Has organization:", hasOrg);
      setHasOrganization(hasOrg);

      if (hasOrg) {
        setLoadingOrg(true);
        const fetchOrg = async () => {
          try {
            const response = await fetch(
              `/api/organization/profile?organization_id=${orgId}`,
              { cache: "no-store" }
            );
            if (!response.ok) throw new Error("Failed to fetch organization");
            const data = await response.json();
            console.log("Fetched organization:", data);
            setAssociation({
              name: data.name || "Organization",
              description: data.details?.description || "Leading healthcare provider offering comprehensive services.",
              address: `${data.location || "Not Specified"}, Pakistan`,
              phone: data.details?.phone || "No number",
              website: data.details?.website || "Not added",
              hours: data.details?.hours || "Not added",
            });
          } catch (err) {
            console.error("Error fetching org:", err);
            setAssociation({
              name: "Organization",
              description: "",
              address: "Not Specified, Pakistan",
              phone: "No number",
              website: "Not added",
              hours: "Not added",
            });
          } finally {
            setLoadingOrg(false);
          }
        };
        fetchOrg();
      }
    } catch (err) {
      console.error("Failed to read selected doctor", err);
      setHasOrganization(false);
    }
  }, []);

  const handleClick = () => {
    if (organizationId) {
      localStorage.setItem("organization_user_id", String(organizationId));
      router.push("/organization-details");
    } else {
      alert("Organization information is not available. This doctor may not be affiliated with any organization.");
    }
  };

  return (
    <div className="bg-[#FEF9E7] rounded-2xl p-3 sm:p-6 shadow-sm">
      <h2 className="text-[#0039A6] text-sm sm:text-xl font-bold text-center mb-2 sm:mb-3">
        Affiliated Organization
      </h2>

      {!hasOrganization ? (
        <div className="flex flex-col items-center py-6 sm:py-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl">🏢</span>
          </div>
          <h3 className="text-[#0039A6] text-base sm:text-lg font-semibold text-center mb-2">
            No Organization Affiliation
          </h3>
          <p className="text-[#0039A6] text-xs sm:text-sm text-center max-w-xs">
            This doctor is currently practicing independently and is not affiliated with any organization in our system.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {loadingOrg ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Loading organization...</p>
            </div>
          ) : (
            <>
              <div className="mb-1 sm:mb-2">
                <div className="rounded-full overflow-hidden w-10 h-10 bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <h3 className="text-[#0039A6] text-sm sm:text-lg font-bold text-center">
                {association.name}
              </h3>

              {association.description && (
                <p className="text-[#0039A6] text-xs sm:text-sm text-center my-2 sm:my-3">
                  {association.description}
                </p>
              )}

              <div className="w-full text-[#0039A6] mt-2 sm:mt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-red-500">📍</span>
                  <span>{association.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-gray-600">🕑</span>
                  <span>{association.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-gray-600">📞</span>
                  <span>{association.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-blue-500">🌐</span>
                  <span>{association.website}</span>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 sm:mt-6 w-full flex justify-center">
            <SecondaryButton
              onClick={handleClick}
              text="View Organization Profile"
              className="font-semibold px-3 sm:px-5 py-2 sm:py-3 rounded-full w-full max-w-xs text-center text-xs sm:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
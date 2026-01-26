"use client";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Organization {
  organization_name: string;
  description: string;
  logo_url?: string;
  contact_email: string;
  contact_numbers: string[];
  location: string;
  linkedin?: string;
}

export default function MyAccount() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    try {
      const token =
        localStorage.getItem("session_key") ||
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token") ||
        "";

      if (!token) {
        setError("Authentication required");
        return;
      }

      const res = await fetch("/api/organization/organization_details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Token") ? token : `Token ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch organization: ${res.status}`);
      }

      const data = await res.json();

      // Map backend response to expected shape
      // Make sure logo_url is a full valid URL
      let logoUrl = data.logo;
      if (logoUrl && !logoUrl.startsWith("http")) {
        // If Django returns relative path, prepend base URL
        const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "";
        logoUrl = `${base.replace(/\/+$/, "")}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`;
      }

      setOrganization({
        organization_name: data.name || data.organization_name || "—",
        description: data.details?.description || "",
        logo_url: logoUrl || undefined,
        contact_email: data.details?.contact_email || data.email || "",
        contact_numbers: Array.isArray(data.details?.contact_numbers)
          ? data.details.contact_numbers
          : data.details?.contact_numbers
            ? [String(data.details.contact_numbers)]
            : [],
        location: data.location || "",
        linkedin: data.details?.linkedin || "",
      });
    } catch (err: any) {
      console.error("Failed to load organization profile:", err);
      setError("Failed to load organization information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();

    // Listen for profile updates (triggered after save in EditProfile)
    const handleProfileUpdate = () => {
      fetchOrganization();
    };

    window.addEventListener("profile:updated", handleProfileUpdate);

    // Also listen to BroadcastChannel for cross-tab updates
    const channel = new BroadcastChannel("profile-sync");
    channel.onmessage = (event) => {
      if (event.data?.type === "profile-updated") {
        fetchOrganization();
      }
    };

    return () => {
      window.removeEventListener("profile:updated", handleProfileUpdate);
      channel.close();
    };
  }, []);

  // Optional: Refresh when coming back to this page (focus/blur)
  useEffect(() => {
    const handleFocus = () => {
      fetchOrganization();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">
          Loading organization details...
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-xl text-red-600">
          {error || "Failed to load organization data"}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-6 py-0 overflow-hidden">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-[28px] text-left font-bold text-[#1E3CA7] mb-0 mt-8">
          My Account
        </h1>

        <div className="flex flex-row justify-between p-0 h-full gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col justify-start pt-8 flex-1">
            {[
              {
                label: "Organization Name",
                value: organization.organization_name,
              },
              {
                label: "Contact Email",
                value: organization.contact_email || "—",
              },
              {
                label: "Contact Numbers",
                value:
                  organization.contact_numbers?.length > 0
                    ? organization.contact_numbers.join(", ")
                    : "—",
              },
              { label: "Location", value: organization.location || "—" },
              { label: "LinkedIn", value: organization.linkedin || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="mb-6">
                <div className="text-[22px] font-bold text-[#1E3CA7]">
                  {label}
                </div>
                <div className="text-[20px] text-[#444444] font-normal mt-1">
                  {label === "Contact Numbers" &&
                  Array.isArray(organization.contact_numbers)
                    ? organization.contact_numbers.map((num, i) => (
                        <div key={i}>{num}</div>
                      ))
                    : value}
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-6">
              <PrimaryButton
                text="Edit Info"
                onClick={() => router.push("/settings/edit-profile")}
                className="text-[20px] font-bold rounded-[32px] px-5 py-3"
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Logo */}
          <div className="flex flex-col items-center justify-start min-w-[400px] pt-8">
            <div className="w-[300px] h-[210px] bg-[#A6B6CC66] rounded-[24px] flex items-center justify-center mb-2 overflow-hidden">
              {organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt="Organization Logo"
                  className="w-full h-full object-contain p-4"
                  width={300}
                  height={210}
                  priority
                  onError={(e) => {
                    e.currentTarget.src = "/fallback-logo.png"; // optional
                  }}
                />
              ) : (
                <div className="text-[#999] text-center">
                  <div className="text-4xl mb-2">🏢</div>
                  <div>No Logo Uploaded</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

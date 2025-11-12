"use client";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Organization {
  organization_name: string;
  description: string;
  logo_url?: string;
  contact_email: string;
  contact_numbers: string[];
  location: string;
  linkedin?: string;
}

interface OrganizationProps {
  organization: Organization;
}

export default function MyAccount({ organization }: OrganizationProps) {
  const router = useRouter();

  return (
    <div className="h-full px-0 py-0 overflow-hidden">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-[28px] text-left font-bold text-[#1E3CA7] mb-0 mt-8">
          My Account
        </h1>

        <div className="flex flex-row justify-between p-0 h-full">
          {/* LEFT COLUMN */}
          <div className="flex flex-col justify-start pt-8 flex-1">
            {[
              { label: "Organization Name", field: "organization_name" },
              { label: "Contact Email", field: "contact_email" },
              { label: "Contact Numbers", field: "contact_numbers" },
              { label: "Location", field: "location" },
              { label: "LinkedIn", field: "linkedin" },
            ].map(({ label, field }) => (
              <div key={field} className="mb-6">
                <div className="text-[22px] font-bold text-[#1E3CA7]">
                  {label}
                </div>
                <div className="text-[20px] text-[#444444] font-normal mt-1">
                  {field === "contact_numbers"
                    ? organization.contact_numbers.map((num, i) => (
                        <div key={i}>{num}</div>
                      ))
                    : (organization as any)[field]}
                </div>
              </div>
            ))}

            {/* Redirect to Edit Profile Page */}
            <div className="flex gap-4 mt-6">
              <PrimaryButton
                text="Edit Info"
                onClick={() => router.push("/settings/edit-profile")}
                className="text-[20px] font-bold rounded-[32px] px-5 py-3"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col items-center justify-start min-w-[400px] pt-8 pl-8">
            <div className="w-[300px] h-[210px] bg-[#A6B6CC66] rounded-[24px] flex items-center justify-center mb-2">
              <Image
                src={organization.logo_url || "/org-logo.png"}
                alt="Organization Logo"
                className="w-[140px] h-[140px] object-contain opacity-60"
                width={140}
                height={140}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

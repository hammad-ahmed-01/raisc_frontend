import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";

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
  return (
    <div className="h-full px-0 py-0 overflow-hidden">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-[28px] text-left font-bold text-[#1E3CA7] mb-0 mt-8">
          My Account
        </h1>
        {/* Main Row: Info & Logo */}
        <div className="flex flex-row justify-between bg-transparent rounded-none shadow-none border-none p-0 h-full">
          {/* Left Column: Info */}
          <div className="flex flex-col justify-start pt-8 flex-1">
            {/* Organization Name */}
            <div className="flex flex-col mb-7">
              <div className="text-[22px] font-bold text-[#1E3CA7] mb-0 leading-tight">
                Organization Name
              </div>
              <div className="text-[20px] text-[#444444] font-normal mt-1">
                {organization.organization_name}
              </div>
            </div>
            {/* Other Info */}
            <div className="mb-5">
              <div className="text-[22px] font-bold text-[#1E3CA7] mb-0 leading-tight">
                Contact Email
              </div>
              <div className="text-[20px] text-[#444444] font-normal mt-1">
                {organization.contact_email}
              </div>
            </div>
            <div className="mb-5">
              <div className="text-[22px] font-bold text-[#1E3CA7] mb-0 leading-tight">
                Contact Number
              </div>
              <div className="text-[20px] text-[#444444] font-normal mt-1">
                {organization.contact_numbers?.map((num, idx) => (
                  <div key={idx}>{num}</div>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <div className="text-[22px] font-bold text-[#1E3CA7] mb-0 leading-tight">
                Location
              </div>
              <div className="text-[20px] text-[#444444] font-normal mt-1">
                {organization.location}
              </div>
            </div>
            <div className="mb-5">
              <a
                href={
                  organization.linkedin?.startsWith("http")
                    ? organization.linkedin
                    : `https://${organization.linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-[22px] font-bold text-[#1E3CA7] mb-0 block"
                style={{ textDecoration: "none", fontWeight: 700 }}
              >
                {organization.linkedin}
              </a>
            </div>
            <PrimaryButton 
              text="Edit Info"
              onClick={() => window.location.href = "/settings/edit-profile"}
              className="mt-auto mb-4 text-[20px] font-bold rounded-[32px] max-w-[180px] px-4 py-3"
              />
          </div>
          {/* Right Column: Logo */}
          <div className="flex flex-col items-center justify-start min-w-[400px] pt-8 pl-8">
            <div className="w-[300px] h-[210px] bg-[#A6B6CC66] rounded-[24px] flex items-center justify-center mb-2 border-none">
              <Image

                src={organization.logo_url || "/org-logo.png"}
                alt="Organization Logo"
                className="w-[140px] h-[140px] object-contain opacity-60"
                style={{ filter: "grayscale(100%)" }}
                width={140}
                height={140}
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="org-logo-upload"
                className="bg-[#D9D9D9] border-none text-black font-bold px-8 py-3 rounded-[24px] cursor-pointer text-[20px] shadow-none hover:opacity-70"
                style={{ width: "220px", textAlign: "center" }}
              >
                Choose File <span className="text-red-600">*</span>
              </label>
              <input id="org-logo-upload" type="file" className="hidden" />
              <span className="text-[#444444] text-[20px] font-normal ml-2">
                No File Chosen
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
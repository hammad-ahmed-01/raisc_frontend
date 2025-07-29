import { Doctor } from "@/app/settings/account/page";

interface DoctorProps {
  doctor: Doctor;
}

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

export default function MyAccount({
  organization
}: OrganizationProps) {
  return (
    <div className="h-full overflow-hidden p-5">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-left text-[#1E3CA7] mb-16">
          My Account
        </h1>

        {/* Organization Detail Section */}
        <div
          className="bg-[#E9F5FE] rounded-3xl p-5 relative flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Organization Header */}
          <div
            className="bg-white rounded-2xl p-5 mb-5 absolute top-0 -translate-y-1/2 w-[calc(100%-2.5rem)]"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-14 h-14 rounded-full overflow-hidden"
                style={{ border: "2px solid #1E3CA7" }}
              >
                <img
                  src={organization.logo_url || "/org-logo.png"}
                  alt="Organization"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3CA7] mb-1">
                  {organization.organization_name}
                </h2>
                <p className="text-base text-[#1E3CA7] font-normal">
                  {organization.location}
                </p>
              </div>
            </div>
          </div>

          {/* Organization Info */}
          <div className="flex flex-col gap-5 pt-16">
            <div
              className="bg-white rounded-xl p-4 space-y-4"
              style={{ border: "1px solid #2196F3" }}
            >
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Organization Name
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {organization.organization_name}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Description
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {organization.description}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Contact Email
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {organization.contact_email}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Contact Numbers
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {organization.contact_numbers?.join(", ")}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Location
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {organization.location}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  LinkedIn
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {organization.linkedin}
                </p>
              </div>
            </div>
          </div>

          {/* Update Profile Link */}
          <div className="text-center mt-8">
            <p className="text-md font-normal text-[#1E3CA7]">
              Want to update your details?{" "}
              <a
                href="/settings/edit-profile"
                className="underline font-semibold"
              >
                Go to Edit Profile
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
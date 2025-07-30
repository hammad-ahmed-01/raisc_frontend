import { FaRegEdit } from "react-icons/fa";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

interface OrganizationProfileData {
  organization_name?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_numbers?: string[];
  location?: string;
  linkedin?: string;
}

interface EditOrganizationProfileProps {
  profile: OrganizationProfileData;
  editingField: string | null;
  tempValue: string;
  message: string;
  handleEdit: (field: string, currentValue: string) => void;
  handleSave: (field: string) => Promise<void>;
  handleCancel: () => void;
  setTempValue: (value: string) => void;
}

export default function EditOrganizationProfile({
  profile,
  editingField,
  tempValue,
  message,
  handleEdit,
  handleSave,
  handleCancel,
  setTempValue
}: EditOrganizationProfileProps) {
  return (
    <div className="h-full flex flex-col justify-center px-2 py-2">
        {/* Header */}
        <h1 className="text-[24px] font-bold text-[#1E3CA7] mb-6 text-left">
          Edit Profile
        </h1>
        {/* Top Row: Org Info & Logo */}
        <div className="flex flex-row gap-12 mb-4">
          {/* Left: Org Info */}
          <div className="flex flex-col w-[50%]">
            {/* Organization Name */}
            <div className="mb-6">
              <div className="text-[20px] font-bold text-[#1E3CA7] mb-0">
                Organization Name
              </div>
                <div className="flex items-center">
                  <div className="text-[18px] text-[#444444] font-normal mt-1 mb-0 flex-1">
                    {profile.organization_name || ""}
                  </div>
                </div>
            </div>
            {/* Description */}
            <div className="mb-6">
              <div className="text-[20px] font-bold text-[#1E3CA7] mb-0">
                Description
              </div>
              {editingField === "description" ? (
                <div className="flex items-center space-x-2 mt-2">
                  <textarea
                    className="w-full h-[140px] rounded-[18px] border border-[#1E3CA7] px-4 py-2 text-[16px] text-[#444444] resize-none focus:outline-none"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                  <button
                    onClick={() => handleSave("description")}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="relative mt-2 flex items-center">
                  <textarea
                    className="w-full h-[140px] rounded-[18px] border border-[#2196F3] px-4 py-2 text-[16px] text-[#444444] resize-none focus:outline-none"
                    value={profile.description || ""}
                    readOnly
                  />
                  <button
                    onClick={() => handleEdit("description", profile.description || "")}
                    className="absolute top-2 right-4 text-[#1E3CA7] cursor-pointer"
                  >
                    <FaRegEdit size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Right: Logo Section */}
          <div className="flex flex-col items-center w-[50%] min-w-[400px] h-full justify-between">
            <div>
              <div className="w-[300px] h-[210px] bg-[#A6B6CC66] rounded-[24px] flex items-center justify-center border-none">
                <img
                  src={profile.logo_url || "/org-logo.png"}
                  alt="Organization Logo"
                  className="w-[90px] h-[90px] object-contain"
                  style={{ filter: "grayscale(100%)" }}
                />
              </div>
            </div>
            <button
              className="bg-[#D9D9D9] text-black font-bold px-8 py-2 rounded-[14px] shadow-none border border-[#A6B6CC] hover:opacity-70"
              style={{ width: "180px" }}
            >
              Change Logo
            </button>
          </div>
        </div>
        {/* Divider */}
        <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full my-4" />
        {/* Contact Details */}
        <div className="max-w-[70vw]">
          <div className="text-[20px] font-bold text-[#1E3CA7] mb-2">
            Contact Details
          </div>
          <div className="flex flex-row gap-8 items-center mb-2">
            <div className="flex-1">
              <div className="text-[16px] font-bold text-[#1E3CA7] mb-0">
                Contact Email
              </div>
              {editingField === "contact_email" ? (
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="email"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="px-2 py-1 border border-[#1E3CA7] rounded text-md w-full"
                  />
                  <button
                    onClick={() => handleSave("contact_email")}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="text-[16px] text-[#444444] font-normal mt-1 flex-1">
                    {profile.contact_email || ""}
                  </div>
                  <PrimaryButton
                    text="Edit"
                    onClick={() => handleEdit("contact_email", profile.contact_email || "")}
                    className="ml-2 px-6 py-1.5 rounded-full text-md font-semibold"
                  />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-bold text-[#1E3CA7] mb-0">
                Contact Number
              </div>
              {editingField === "contact_number" ? (
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="px-2 py-1 border border-[#1E3CA7] rounded text-md w-full"
                  />
                  <button
                    onClick={() => handleSave("contact_number")}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="text-[16px] text-[#444444] font-normal mt-1 flex-1">
                    {(profile.contact_numbers && profile.contact_numbers.length > 0)
                      ? profile.contact_numbers.join(", ")
                      : ""}
                  </div>
                  <PrimaryButton
                    text="Edit"
                    onClick={() =>
                      handleEdit(
                        "contact_number",
                        (profile.contact_numbers && profile.contact_numbers.length > 0)
                          ? profile.contact_numbers.join(", ")
                          : ""
                      )
                    }
                    className="ml-2 px-6 py-1.5 rounded-full text-md font-semibold"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Divider */}
        <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full my-4" />
        {/* Location */}
        <div className="flex flex-row items-center mb-2 max-w-[70vw]">
          <div className="flex-1">
            <div className="text-[20px] font-bold text-[#1E3CA7] mb-0">
              Location
            </div>
            {editingField === "location" ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="px-2 py-1 border border-[#1E3CA7] rounded text-md w-full"
                />
                <button
                  onClick={() => handleSave("location")}
                  className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="text-[16px] text-[#444444] font-normal mt-1 flex-1">
                  {profile.location || ""}
                </div>
                <PrimaryButton
                  text="Edit"
                  onClick={() => handleEdit("location", profile.location || "")}
                  className="ml-2 px-6 py-1.5 rounded-full text-md font-semibold"
                />
              </div>
            )}
          </div>
        </div>
        {/* Divider */}
        <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full mb-8" />
        {/* Action Buttons */}
        <div className="flex flex-row gap-6 justify-center">
          <PrimaryButton
            text="Save Changes"
            className="min-w-[180px] px-10 py-3 rounded-[32px] text-[16px] font-bold"
          />
          <SecondaryButton
            text="Cancel"
            onClick={handleCancel}
            className="min-w-[180px] px-10 py-3 rounded-[32px] text-[16px] font-bold"
          />
        </div>
        {message && (
          <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-lg text-center text-md">
            {message}
          </div>
        )}
    </div>
  );
}
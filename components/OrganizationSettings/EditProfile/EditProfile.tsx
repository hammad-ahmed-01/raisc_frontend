"use client";

import { useState, useEffect } from "react";
import { FaRegEdit } from "react-icons/fa";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface OrganizationProfileData {
  organization_name?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_numbers?: string[];
  location?: string;
  linkedin?: string;
}

export default function EditOrganizationProfile() {
  const router = useRouter();

  const [orgProfile, setOrgProfile] = useState<OrganizationProfileData>({
    organization_name: "",
    description: "",
    logo_url: "",
    contact_email: "",
    contact_numbers: [],
    location: "",
    linkedin: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch organization info from backend ---------------- */
  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("session_key") ||
          "";
        const res = await fetch("/api/organization/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Token ${token}` : "",
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch organization details");
        const data = await res.json();

        setOrgProfile({
          organization_name: data.name || "",
          description: data.details?.description || "",
          logo_url: data.details?.logo_url || "",
          contact_email: data.details?.contact_email || "",
          contact_numbers: data.details?.contact_numbers || [],
          location: data.location || "",
          linkedin: data.details?.linkedin || "",
        });
      } catch (err) {
        console.error("Failed to load organization:", err);
        setMessage("❌ Failed to load organization info.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, []);

  /* ---------------------- Editing Handlers ---------------------- */
  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  /* ---------------------- Save Updates ---------------------- */
  const handleSave = async (field: string) => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("session_key") ||
        "";

      const updatedProfile = { ...orgProfile };

      if (field === "organization_name")
        updatedProfile.organization_name = tempValue;
      else if (field === "description") updatedProfile.description = tempValue;
      else if (field === "contact_email")
        updatedProfile.contact_email = tempValue;
      else if (field === "contact_number")
        updatedProfile.contact_numbers = tempValue
          .split(",")
          .map((num) => num.trim())
          .filter(Boolean);
      else if (field === "location") updatedProfile.location = tempValue;
      else if (field === "linkedin") updatedProfile.linkedin = tempValue;

      const res = await fetch("/api/organization/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Token ${token}` : "",
        },
        body: JSON.stringify({
          name: updatedProfile.organization_name,
          location: updatedProfile.location,
          details: {
            description: updatedProfile.description,
            contact_email: updatedProfile.contact_email,
            contact_numbers: updatedProfile.contact_numbers,
            linkedin: updatedProfile.linkedin,
            logo_url: updatedProfile.logo_url,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Update failed (${res.status})`);
      }

      const data = await res.json();

      setOrgProfile({
        organization_name: data.name || updatedProfile.organization_name,
        description: data.details?.description || updatedProfile.description,
        contact_email: data.details?.contact_email || updatedProfile.contact_email,
        contact_numbers:
          data.details?.contact_numbers || updatedProfile.contact_numbers,
        location: data.location || updatedProfile.location,
        linkedin: data.details?.linkedin || updatedProfile.linkedin,
        logo_url: data.details?.logo_url || updatedProfile.logo_url,
      });

      setEditingField(null);
      setTempValue("");
      setMessage("✅ Changes saved successfully!");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("❌ Failed to save changes. Please try again.");
    }
  };

  /* ---------------------- Loading State ---------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  /* ---------------------- UI ---------------------- */
  return (
    <div className="h-full flex flex-col justify-center px-4 py-4">
      <h1 className="text-[26px] font-bold text-[#1E3CA7] mb-6 text-left">
        Edit Profile
      </h1>

      {/* Top Row */}
      <div className="flex flex-row gap-12 mb-4">
        {/* Left Column */}
        <div className="flex flex-col w-[50%]">
          {/* Organization Name */}
          <div className="mb-6">
            <div className="text-[20px] font-bold text-[#1E3CA7] mb-0">
              Organization Name
            </div>
            {editingField === "organization_name" ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="px-3 py-2 border border-[#1E3CA7] rounded text-md w-full"
                />
                <button
                  onClick={() => handleSave("organization_name")}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center mt-2">
                <div className="text-[18px] text-[#444444] flex-1">
                  {orgProfile.organization_name || ""}
                </div>
                <button
                  onClick={() =>
                    handleEdit("organization_name", orgProfile.organization_name || "")
                  }
                  className="text-[#1E3CA7] ml-3"
                >
                  <FaRegEdit size={20} />
                </button>
              </div>
            )}
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
                  value={orgProfile.description || ""}
                  readOnly
                />
                <button
                  onClick={() =>
                    handleEdit("description", orgProfile.description || "")
                  }
                  className="absolute top-2 right-4 text-[#1E3CA7] cursor-pointer"
                >
                  <FaRegEdit size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center w-[50%] min-w-[400px] h-full justify-between">
          <div>
            <div className="w-[300px] h-[210px] bg-[#A6B6CC66] rounded-[24px] flex items-center justify-center border-none">
              <Image
                src={orgProfile.logo_url || "/org-logo.png"}
                alt="Organization Logo"
                className="w-[90px] h-[90px] object-contain"
                style={{ filter: "grayscale(100%)" }}
                width={90}
                height={90}
              />
            </div>
          </div>
          <button
            className="bg-[#D9D9D9] text-black font-bold px-8 py-2 rounded-[14px] border border-[#A6B6CC] hover:opacity-70"
            style={{ width: "180px" }}
          >
            Change Logo
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full my-4" />

      {/* Contact Info Section */}
      <div className="max-w-[70vw]">
        <div className="text-[20px] font-bold text-[#1E3CA7] mb-3">
          Contact Details
        </div>

        {/* Contact Email */}
        <EditableField
          label="Contact Email"
          value={orgProfile.contact_email || ""}
          field="contact_email"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValue}
          tempValue={tempValue}
        />

        {/* Contact Numbers */}
        <EditableField
          label="Contact Number"
          value={orgProfile.contact_numbers?.join(", ") || ""}
          field="contact_number"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValue}
          tempValue={tempValue}
        />

        {/* LinkedIn */}
        <EditableField
          label="LinkedIn"
          value={orgProfile.linkedin || ""}
          field="linkedin"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValue}
          tempValue={tempValue}
        />

        {/* Location */}
        <EditableField
          label="Location"
          value={orgProfile.location || ""}
          field="location"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValue}
          tempValue={tempValue}
        />
      </div>

      {/* Divider */}
      <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full mb-8" />

      {/* Buttons */}
      <div className="flex flex-row gap-6 justify-center">
        <PrimaryButton
          text="Back to Account"
          onClick={() => router.push("/settings/account")}
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

/* ---------------- Editable Field Component ---------------- */
function EditableField({
  label,
  value,
  field,
  editingField,
  handleEdit,
  handleSave,
  handleCancel,
  setTempValue,
  tempValue,
}: any) {
  return (
    <div className="flex flex-row items-center mb-3">
      <div className="flex-1">
        <div className="text-[16px] font-bold text-[#1E3CA7] mb-0">{label}</div>
        {editingField === field ? (
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="px-2 py-1 border border-[#1E3CA7] rounded text-md w-full"
            />
            <button
              onClick={() => handleSave(field)}
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
            <div className="text-[16px] text-[#444444] flex-1">{value}</div>
            <PrimaryButton
              text="Edit"
              onClick={() => handleEdit(field, value)}
              className="ml-2 px-6 py-1.5 rounded-full text-md font-semibold"
            />
          </div>
        )}
      </div>
    </div>
  );
}

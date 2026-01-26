"use client";

import { useState, useEffect, useRef } from "react";
import { FaRegEdit } from "react-icons/fa";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
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

interface EditOrganizationProfileProps {
  profile?: OrganizationProfileData;
  editingField?: string | null;
  tempValue?: string;
  message?: string;
  handleEdit?: (field: string, currentValue: string) => void;
  handleSave?: (field: string) => Promise<void>;
  handleCancel?: () => void;
  setTempValue?: (value: string) => void;
}

export default function EditOrganizationProfile(props?: EditOrganizationProfileProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orgProfile, setOrgProfile] = useState<OrganizationProfileData>(
    props?.profile || {
      organization_name: "",
      description: "",
      logo_url: "",
      contact_email: "",
      contact_numbers: [],
      location: "",
      linkedin: "",
    }
  );
  const [editingField, setEditingField] = useState<string | null>(props?.editingField ?? null);
  const [tempValue, setTempValue] = useState(props?.tempValue ?? "");
  const [message, setMessage] = useState(props?.message ?? "");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const getAuthToken = () => {
    return (
      localStorage.getItem("session_key") ||
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token") ||
      ""
    );
  };

  // Convert relative path → full URL
  const getFullLogoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    const baseUrl = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "http://localhost:8000";
    return `${baseUrl.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    if (props?.profile) {
      setOrgProfile(props.profile);
      setLogoPreview(getFullLogoUrl(props.profile.logo_url));
      setLoading(false);
      return;
    }

    const fetchOrg = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        const res = await fetch("/api/organization/organization_details", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch organization details: ${res.status}`);
        }

        const data = await res.json();

        const serverLogoUrl = data.logo || "";

        const profile: OrganizationProfileData = {
          organization_name: data.name || "",
          description: data.details?.description || "",
          logo_url: serverLogoUrl,
          contact_email: data.details?.contact_email || "",
          contact_numbers: Array.isArray(data.details?.contact_numbers)
            ? data.details.contact_numbers
            : data.details?.contact_numbers
            ? [String(data.details.contact_numbers)]
            : [],
          location: data.location || "",
          linkedin: data.details?.linkedin || "",
        };

        setOrgProfile(profile);
        setLogoPreview(getFullLogoUrl(serverLogoUrl));
      } catch (err) {
        console.error("Failed to load organization:", err);
        setMessage("❌ Failed to load organization information");
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [props?.profile]);

  // Sync controlled props
  useEffect(() => {
    if (props?.editingField !== undefined) setEditingField(props.editingField);
    if (props?.tempValue !== undefined) setTempValue(props.tempValue);
    if (props?.message !== undefined) setMessage(props.message);
  }, [props?.editingField, props?.tempValue, props?.message]);

  const handleEditInternal = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleCancelInternal = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleEdit = props?.handleEdit || handleEditInternal;
  const handleCancel = props?.handleCancel || handleCancelInternal;
  const setTempValueHandler = props?.setTempValue || setTempValue;

  // ── SAVE TEXT FIELDS ───────────────────────────────────────────
  const handleSaveInternal = async (field: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token");

      const updatedProfile = { ...orgProfile };

      if (field === "organization_name") updatedProfile.organization_name = tempValue;
      else if (field === "description") updatedProfile.description = tempValue;
      else if (field === "contact_email") updatedProfile.contact_email = tempValue;
      else if (field === "contact_numbers") {
        updatedProfile.contact_numbers = tempValue
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);
      } else if (field === "location") updatedProfile.location = tempValue;
      else if (field === "linkedin") updatedProfile.linkedin = tempValue;

      const payload = {
        name: updatedProfile.organization_name,
        location: updatedProfile.location,
        details: {
          description: updatedProfile.description,
          contact_email: updatedProfile.contact_email,
          contact_numbers: updatedProfile.contact_numbers,
          linkedin: updatedProfile.linkedin,
        },
      };

      const res = await fetch("/api/organization/organization_details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Update failed (${res.status})`);
      }

      const data = await res.json();

      // Update local state with server response
      setOrgProfile({
        organization_name: data.name || updatedProfile.organization_name,
        description: data.details?.description || updatedProfile.description,
        contact_email: data.details?.contact_email || updatedProfile.contact_email,
        contact_numbers: data.details?.contact_numbers || updatedProfile.contact_numbers,
        location: data.location || updatedProfile.location,
        linkedin: data.details?.linkedin || updatedProfile.linkedin,
        logo_url: data.logo || orgProfile.logo_url,
      });

      setEditingField(null);
      setTempValue("");
      setMessage("✅ Changes saved successfully!");
      setTimeout(() => setMessage(""), 3000);

      // Notify other components/tabs
      window.dispatchEvent(new Event("profile:updated"));
      new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
    } catch (error: any) {
      console.error("Save failed:", error);
      setMessage("❌ Failed to save changes: " + (error.message || "Unknown error"));
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleSave = props?.handleSave || handleSaveInternal;

  // ── LOGO UPLOAD ────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      setMessage("❌ Please select a valid image file (jpg, png, etc.)");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ Image size should be less than 5MB");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // Instant local preview
      const localPreview = URL.createObjectURL(file);
      setLogoPreview(localPreview);

      const token = getAuthToken();
      if (!token) throw new Error("No authentication token");

      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/organization/organization_details", {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          // IMPORTANT: Do NOT set Content-Type manually for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const serverLogoUrl = data.logo || "";

      // Update with real server URL
      const fullServerUrl = getFullLogoUrl(serverLogoUrl);
      setOrgProfile((prev) => ({ ...prev, logo_url: serverLogoUrl }));
      setLogoPreview(fullServerUrl || localPreview);

      setMessage("✅ Logo uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);

      // Notify other components
      window.dispatchEvent(new Event("profile:updated"));
      new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
    } catch (error: any) {
      console.error("Logo upload failed:", error);
      setMessage("❌ Failed to upload logo: " + (error.message || "Unknown error"));
      setTimeout(() => setMessage(""), 5000);
      // Revert to previous logo
      setLogoPreview(getFullLogoUrl(orgProfile.logo_url));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-gray-600">Loading organization profile...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-start px-6 py-4 overflow-y-auto">
      <h1 className="text-[26px] font-bold text-[#1E3CA7] mb-6 text-left">
        Edit Organization Profile
      </h1>

      <div className="flex flex-row gap-12 mb-8">
        {/* LEFT COLUMN - Fields */}
        <div className="flex flex-col w-[50%]">
          {/* Organization Name */}
          <div className="mb-6">
            <div className="text-[20px] font-bold text-[#1E3CA7] mb-2">
              Organization Name
            </div>
            {editingField === "organization_name" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValueHandler(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#1E3CA7] rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-[#1E3CA7]"
                  placeholder="Enter organization name"
                />
                <button
                  onClick={() => handleSave("organization_name")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 text-[18px] text-[#444444]">
                  {orgProfile.organization_name || "—"}
                </div>
                <button
                  onClick={() =>
                    handleEdit("organization_name", orgProfile.organization_name || "")
                  }
                  className="text-[#1E3CA7] hover:text-[#153080] transition-colors"
                >
                  <FaRegEdit size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="text-[20px] font-bold text-[#1E3CA7] mb-2">
              Description
            </div>
            {editingField === "description" ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full h-[140px] rounded-lg border border-[#1E3CA7] px-4 py-2 text-[16px] text-[#444444] resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3CA7]"
                  value={tempValue}
                  onChange={(e) => setTempValueHandler(e.target.value)}
                  placeholder="Enter organization description..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave("description")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  className="w-full h-[140px] rounded-lg border border-[#2196F3] px-4 py-2 text-[16px] text-[#444444] resize-none focus:outline-none bg-white"
                  value={orgProfile.description || ""}
                  readOnly
                  placeholder="No description provided"
                />
                <button
                  onClick={() => handleEdit("description", orgProfile.description || "")}
                  className="absolute top-2 right-3 text-[#1E3CA7] hover:text-[#153080] transition-colors"
                >
                  <FaRegEdit size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Logo */}
        <div className="flex flex-col items-center w-[50%] min-w-[400px] gap-4">
          <div className="w-[300px] h-[210px] bg-[#A6B6CC66] rounded-[24px] flex items-center justify-center border-2 border-dashed border-[#1E3CA7] overflow-hidden">
            {uploading ? (
              <div className="text-[#1E3CA7] text-center">
                <div className="text-3xl mb-2">⏳</div>
                <div>Uploading...</div>
              </div>
            ) : logoPreview ? (
              <Image
                src={logoPreview}
                alt="Organization Logo"
                className="w-full h-full object-contain p-4"
                width={300}
                height={210}
                priority
                onError={() => setLogoPreview(null)}
              />
            ) : (
              <div className="text-[#999] text-center">
                <div className="text-4xl mb-2">🏢</div>
                <div>No Logo Uploaded</div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`bg-[#1E3CA7] text-white font-bold px-8 py-2 rounded-[14px] hover:bg-[#153080] transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ width: "180px" }}
          >
            {uploading ? "Uploading..." : "Change Logo"}
          </button>
        </div>
      </div>

      <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full my-6" />

      {/* Contact Details */}
      <div className="max-w-[70vw]">
        <div className="text-[20px] font-bold text-[#1E3CA7] mb-4">Contact Details</div>

        <EditableField
          label="Contact Email"
          value={orgProfile.contact_email || ""}
          field="contact_email"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValueHandler}
          tempValue={tempValue}
          placeholder="contact@example.com"
        />

        <EditableField
          label="Contact Numbers"
          value={orgProfile.contact_numbers?.join(", ") || ""}
          field="contact_numbers"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValueHandler}
          tempValue={tempValue}
          placeholder="+92 300 1234567, +92 300 7654321"
        />

        <EditableField
          label="LinkedIn"
          value={orgProfile.linkedin || ""}
          field="linkedin"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValueHandler}
          tempValue={tempValue}
          placeholder="https://linkedin.com/company/your-org"
        />

        <EditableField
          label="Location"
          value={orgProfile.location || ""}
          field="location"
          editingField={editingField}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          setTempValue={setTempValueHandler}
          tempValue={tempValue}
          placeholder="City, Country"
        />
      </div>

      <div style={{ border: "2px solid #D0E3FFC7" }} className="w-full my-6" />

      <div className="flex flex-row gap-6 justify-center mb-6">
        <PrimaryButton
          text="Back to Account"
          onClick={() => router.push("/settings/account")}
          className="min-w-[180px] px-10 py-3 rounded-[32px] text-[16px] font-bold"
        />
      </div>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg text-center text-md font-semibold ${
            message.includes("❌") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

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
  placeholder,
}: any) {
  return (
    <div className="flex flex-col mb-5">
      <div className="text-[18px] font-bold text-[#1E3CA7] mb-2">{label}</div>
      {editingField === field ? (
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#1E3CA7] rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-[#1E3CA7]"
            placeholder={placeholder}
          />
          <button
            onClick={() => handleSave(field)}
            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 min-w-[80px]"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 min-w-[80px]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 text-[16px] text-[#444444] break-words">
            {value || "—"}
          </div>
          <PrimaryButton
            text="Edit"
            onClick={() => handleEdit(field, value)}
            className="px-6 py-1.5 rounded-full text-sm font-semibold"
          />
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";

interface ProfileData {
  display_name: string;
  email: string;
  phone: string;
  age?: string;
  gender?: string;
  condition?: string;
  emergency_contact?: string;
  location: string;
  therapyFocus?: string;
  bio: string;
  profile_image?: string;
}

interface EditPatientProfileProps {
  profile: ProfileData;
  editingField: string | null;
  tempValue: string;
  message: string;
  handleEdit: (field: string, currentValue: string) => void;
  handleSave: (field: string) => Promise<void>;
  handleCancel: () => void;
  setTempValue: (value: string) => void;
}

export default function EditPatientProfile({
  profile,
  editingField,
  tempValue,
  message,
  handleEdit,
  handleSave,
  handleCancel,
  setTempValue,
}: EditPatientProfileProps) {
  const [loading, setLoading] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState(
    profile.profile_image || ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("session_key") ||
        "";

      const formData = new FormData();
      formData.append("profile_image", file);

      const res = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: {
          Authorization: token ? `Token ${token}` : "",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload profile image");

      const data = await res.json();
      setLocalProfileImage(data.profile_image);
    } catch (err) {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <h1 className="text-xl md:text-2xl font-bold text-left text-[#1E3CA7] mb-6 md:mb-16">
        Edit Profile
      </h1>

      <div
        className="relative bg-[#E9F5FE] rounded-3xl p-4 flex-1"
        style={{ border: "1px solid #2196F3" }}
      >
        {/* Profile Header */}
        <div
          className="w-full md:w-[calc(100%-2rem)] bg-white rounded-2xl p-4
                     static md:absolute md:top-0 md:-translate-y-1/2"
          style={{ border: "1px solid #2196F3" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full overflow-hidden"
                style={{ border: "2px solid #1E3CA7" }}
              >
                <Image
                  src={
                    localProfileImage
                      ? `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}${localProfileImage}`
                      : "/patient.png"
                  }
                  alt="Patient"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-lg font-bold text-[#1E3CA7]">
                {profile.display_name}
              </h2>
            </div>

            <PrimaryButton
              text="Edit Profile Picture"
              className="px-4 md:px-6 py-1.5 rounded-full text-sm md:text-md font-semibold"
              onClick={handleProfileImageChange}
            />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={handleProfileImageUpload}
        />

        {/* Profile Fields */}
        <div
          className="bg-white rounded-2xl mt-4 md:mt-10 px-4 py-2 mb-2"
          style={{ border: "1px solid #2196F3" }}
        >
          <Row
            label="Display Name"
            field="display_name"
            value={profile.display_name}
            editingField={editingField}
            tempValue={tempValue}
            setTempValue={setTempValue}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />

          <Row
            label="Age"
            field="age"
            value={`${profile.age ?? ""}`}
            type="number"
            suffix=" years"
            editingField={editingField}
            tempValue={tempValue}
            setTempValue={setTempValue}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />

          <Row
            label="Gender"
            field="gender"
            value={profile.gender ?? ""}
            placeholder="e.g., Female / Male / Non-binary"
            editingField={editingField}
            tempValue={tempValue}
            setTempValue={setTempValue}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />

          <Row
            label="Email"
            field="email"
            value={profile.email}
            type="email"
            editingField={editingField}
            tempValue={tempValue}
            setTempValue={setTempValue}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />

          <Row
            label="Phone Number"
            field="phone"
            value={profile.phone}
            type="tel"
            placeholder="Add a phone number"
            editingField={editingField}
            tempValue={tempValue}
            setTempValue={setTempValue}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

function Row(props: {
  label: string;
  field: string;
  value: string;
  type?: string;
  placeholder?: string;
  suffix?: string;
  editingField: string | null;
  tempValue: string;
  setTempValue: (v: string) => void;
  handleEdit: (field: string, currentValue: string) => void;
  handleSave: (field: string) => Promise<void>;
  handleCancel: () => void;
}) {
  const {
    label,
    field,
    value,
    type,
    placeholder,
    suffix,
    editingField,
    tempValue,
    setTempValue,
    handleEdit,
    handleSave,
    handleCancel,
  } = props;

  const isEditing = editingField === field;

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center py-2 border-b-[3px] border-[#A6B6CC66] gap-2">
      <div>
        <label className="text-base font-bold text-[#444444]">{label}</label>

        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <input
              type={type || "text"}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="px-2 py-1 border border-gray-300 rounded text-md"
            />
            <button
              onClick={() => handleSave(field)}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-md text-[#444444] mt-1">
            {value || "—"} {suffix ?? ""}
          </p>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={() => handleEdit(field, value)}
          className="bg-[#1E3CA7] text-white px-5 py-1.5 rounded-full text-sm font-semibold hover:opacity-70"
        >
          Edit
        </button>
      )}
    </div>
  );
}

"use client";

import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";

interface ProfileData {
  display_name: string;
  email: string;
  phone: string;
  age?: string;
  condition?: string;
  emergency_contact?: string;
  location: string;
  therapyFocus?: string;
  bio: string;
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
  setTempValue
}: EditPatientProfileProps) {
  return (
    <div className="max-h-[1200px] overflow-y-auto p-3">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold text-left text-[#1E3CA7] mb-6 md:mb-16">
          Edit Profile
        </h1>

        {/* Main Container */}
        <div
          className="relative bg-[#E9F5FE] rounded-3xl p-4 flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Patient Profile Picture Section */}
          <div
            className="
              w-full md:w-[calc(100%-2rem)] bg-white rounded-2xl p-4
              static md:absolute md:top-0 md:-translate-y-1/2
            "
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <Image
                    src="/patient.png"
                    alt="Patient"
                    className="w-full h-full object-cover"
                    width={90}
                    height={90}
                  />
                </div>
                <div>
                  <h2 className="text-lg md:text-lg font-bold text-[#1E3CA7] mb-0.5">
                    {profile.display_name}
                  </h2>
                </div>
              </div>
              <PrimaryButton
                text="Edit Profile Picture"
                className="px-4 md:px-6 py-1.5 rounded-full text-sm md:text-md font-semibold self-start md:self-auto"
              />
            </div>
          </div>

          {/* Patient Profile Fields */}
          <div
            className="bg-white rounded-2xl mt-4 md:mt-10 px-4 py-2 mb-2"
            style={{ border: "1px solid #2196F3" }}
          >
            {/* Display Name */}
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

            {/* Age */}
            <Row
              label="Age"
              field="age"
              value={`${profile.age ?? ""}`}
              type="number"
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              suffix=" years"
            />

            {/* Email */}
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

            {/* Phone Number */}
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

          {/* Therapy Focus Section */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
              <h3 className="text-lg font-bold text-[#444444]">Therapy Focus</h3>
              {editingField !== "therapyFocus" && (
                <button
                  onClick={() => handleEdit("therapyFocus", profile.therapyFocus || "")}
                  className="bg-[#1E3CA7] text-white px-5 md:px-6 py-1.5 rounded-full text-sm md:text-md font-semibold hover:opacity-70 self-start md:self-auto"
                >
                  Edit
                </button>
              )}
            </div>

            {editingField === "therapyFocus" ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-md w-full"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave("therapyFocus")}
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
              </div>
            ) : (
              <p className="text-md text-[#444444]">
                {profile.therapyFocus || "No therapy focus specified"}
              </p>
            )}
          </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <input
              type={type || "text"}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-md w-full sm:w-[300px] max-w-full"
              placeholder={placeholder}
            />
            <div className="flex gap-2">
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
          </div>
        ) : (
          <p className="text-md text-[#444444] mt-1 break-words">
            {value || "—"} {suffix ?? ""}
          </p>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={() => handleEdit(field, value)}
          className="bg-[#1E3CA7] text-white px-5 md:px-6 py-1.5 rounded-full text-sm md:text-md font-semibold hover:opacity-70 self-start md:self-auto"
        >
          Edit
        </button>
      )}
    </div>
  );
}

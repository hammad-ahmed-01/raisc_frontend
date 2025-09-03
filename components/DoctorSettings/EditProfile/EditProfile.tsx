// components/DoctorSettings/EditProfile/EditProfile.tsx
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";
import { useMemo } from "react";

interface ProfileData {
  username?: string;
  display_name: string;
  email: string;
  phone: string;

  specialization?: string;
  experience?: string | number;

  // UPDATED: use expertise + description, remove qualifications/bio
  expertise?: string[] | string;
  description?: string;

  organization?: string;
  location: string;

  // NEW/kept
  education?: string;
  profile_image?: string;
  rates?: string | number;
}

interface EditDoctorProfileProps {
  profile: ProfileData;
  editingField: string | null;
  tempValue: string;
  message: string;
  handleEdit: (field: string, currentValue: string) => void;
  handleSave: (field: string) => Promise<void>;
  handleCancel: () => void;
  setTempValue: (value: string) => void;
}

export default function EditDoctorProfile({
  profile,
  editingField,
  tempValue,
  message,
  handleEdit,
  handleSave,
  handleCancel,
  setTempValue,
}: EditDoctorProfileProps) {
  // Normalize expertise for display: accept array OR string (split by commas/pipes/newlines)
  const expertiseList = useMemo(() => {
    const e = profile.expertise;
    if (!e) return [];
    if (Array.isArray(e)) {
      return e.map((s) => String(s).trim()).filter(Boolean);
    }
    return String(e)
      .split(/\r?\n/)
      .flatMap((line) => line.split(/[,\|]/g))
      .map((s) => s.trim())
      .filter(Boolean);
  }, [profile.expertise]);

  const handleEditExpertise = () => {
    const currentText = Array.isArray(profile.expertise)
      ? profile.expertise.join(", ")
      : String(profile.expertise ?? "");
    handleEdit("expertise", currentText);
  };

  const handleEditDescription = () => {
    handleEdit("description", String(profile.description ?? ""));
  };

  return (
    <div className="max-h-[1200px] overflow-y-auto p-3">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-xl font-bold text-left text-[#1E3CA7] mb-16">Edit Profile</h1>

        {/* Main Container */}
        <div
          className="relative bg-[#E9F5FE] rounded-3xl p-4 flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Profile Picture Section */}
          <div
            className="absolute top-0 -translate-y-1/2 w-[calc(100%-2rem)] bg-white rounded-2xl p-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <Image
                    src={profile.profile_image || "/doc.png"}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E3CA7] mb-1">
                    {profile.display_name}
                  </h2>
                  <p className="text-md text-[#1E3CA7]">{profile.specialization}</p>
                </div>
              </div>
              <PrimaryButton
                text="Edit Profile Picture"
                onClick={() => handleEdit("profile_image", profile.profile_image || "")}
                className="px-6 py-1.5 rounded-full text-md font-semibold flex items-center gap-2"
              ></PrimaryButton>
            </div>
          </div>

          {/* Profile Fields */}
          <div
            className="bg-white rounded-2xl mt-10 px-4 py-2 mb-2"
            style={{ border: "1px solid #2196F3" }}
          >
            {/* Display Name */}
            <EditableRow
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

            {/* Email */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">Email</label>
                <p className="text-md text-[#444444] mt-1">{profile.email}</p>
              </div>
              <button
                onClick={() => handleEdit("email", profile.email)}
                className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
              >
                Edit
              </button>
            </div>

            {/* Phone */}
            <EditableRow
              label="Phone Number"
              field="phone"
              value={profile.phone || ""}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />

            {/* Specialization */}
            <EditableRow
              label="Specialization"
              field="specialization"
              value={profile.specialization || ""}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />

            {/* Experience */}
            <EditableRow
              label="Experience"
              field="experience"
              value={String(profile.experience ?? "")}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              placeholder='e.g., "10 yrs"'
            />

            {/* Education */}
            <EditableRow
              label="Education"
              field="education"
              value={profile.education || ""}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />

            {/* Location */}
            <EditableRow
              label="Location"
              field="location"
              value={profile.location || ""}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />

            {/* Profile Image URL */}
            <EditableRow
              label="Profile Image URL"
              field="profile_image"
              value={profile.profile_image || ""}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              placeholder="https://…/image.jpg"
            />

            {/* Rates */}
            <EditableRow
              label="Rates"
              field="rates"
              value={String(profile.rates ?? "")}
              editingField={editingField}
              tempValue={tempValue}
              setTempValue={setTempValue}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              placeholder='e.g., "480.00"'
            />
          </div>

          {/* Expertise + About me Section */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #2196F3" }}
          >
            {/* Expertise */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-[#444444]">Expertise</h3>
                {editingField !== "expertise" && (
                  <button
                    onClick={handleEditExpertise}
                    className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingField === "expertise" ? (
                <div className="space-y-2">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-md"
                    placeholder="Comma or newline separated, e.g. CBT, Anxiety, Trauma"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave("expertise")}
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
                </div>
              ) : (
                <div className="space-y-1">
                  {expertiseList.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {expertiseList.map((q, idx) => (
                        <li key={idx} className="text-md text-[#444444]">
                          {q}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-md text-[#444444]">No expertise added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* About me */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-[#444444]">About me</h3>
                {editingField !== "description" && (
                  <button
                    onClick={handleEditDescription}
                    className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingField === "description" ? (
                <div className="space-y-2">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-md"
                    placeholder="Briefly describe your approach, training, and what clients can expect."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave("description")}
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
                </div>
              ) : (
                <p className="text-md text-[#444444]">
                  {profile.description?.trim() ? profile.description : "—"}
                </p>
              )}
            </div>
          </div>

          {message && (
            <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-lg text-center text-md">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditableRow(props: {
  label: string;
  field: string;
  value: string;
  editingField: string | null;
  tempValue: string;
  setTempValue: (v: string) => void;
  handleEdit: (field: string, currentValue: string) => void;
  handleSave: (field: string) => Promise<void>;
  handleCancel: () => void;
  placeholder?: string;
}) {
  const {
    label,
    field,
    value,
    editingField,
    tempValue,
    setTempValue,
    handleEdit,
    handleSave,
    handleCancel,
    placeholder,
  } = props;
  const isEditing = editingField === field;
  return (
    <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
      <div>
        <label className="text-base font-bold text-[#444444]">{label}</label>
        {isEditing ? (
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-md w-[300px] max-w-full"
              placeholder={placeholder}
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
          <p className="text-md text-[#444444] mt-1">{value || "—"}</p>
        )}
      </div>
      {!isEditing && (
        <button
          onClick={() => handleEdit(field, value)}
          className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
        >
          Edit
        </button>
      )}
    </div>
  );
}

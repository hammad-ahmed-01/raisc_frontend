import PrimaryButton from "@/components/Buttons/PrimaryButton";
import Image from "next/image";
import { useMemo } from "react";

interface ProfileData {
  username?: string;
  display_name: string;
  email: string;
  phone: string;
  specialization?: string;
  experience?: string;
  /** May arrive as a string ("A\nB, C") or string[] from backend */
  qualifications?: string | string[];
  bio: string;
  organization?: string;
  location: string;
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
  // Normalize quals for display: accept array OR string (split by newlines/commas)
  const qualificationsList = useMemo(() => {
    const q = profile.qualifications;
    if (!q) return [];
    if (Array.isArray(q)) {
      return q.map((s) => String(s).trim()).filter(Boolean);
    }
    // string: split by newline first, then by commas for any remaining
    const lines = String(q)
      .split(/\r?\n/)
      .flatMap((line) => line.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
    return lines;
  }, [profile.qualifications]);

  // When entering edit mode for qualifications, prefill textarea with 1-per-line
  const handleEditQualifications = () => {
    const currentText =
      Array.isArray(profile.qualifications)
        ? profile.qualifications.join("\n")
        : String(profile.qualifications ?? "");
    handleEdit("qualifications", currentText);
  };

  return (
    <div className="max-h-[1200px] overflow-y-auto p-3">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-xl font-bold text-left text-[#1E3CA7] mb-16">
          Edit Profile
        </h1>

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
                    src="/doc.png"
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
                  <p className="text-md text-[#1E3CA7]">
                    {profile.specialization}
                  </p>
                </div>
              </div>
              <PrimaryButton
                text="Edit Profile Picture"
                className="px-6 py-1.5 rounded-full text-md font-semibold"
              />
            </div>
          </div>

          {/* Profile Fields */}
          <div
            className="bg-white rounded-2xl mt-10 px-4 py-2 mb-2"
            style={{ border: "1px solid #2196F3" }}
          >
            {/* Display Name */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">
                  Display Name
                </label>
                {editingField === "display_name" ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-md"
                    />
                    <button
                      onClick={() => handleSave("display_name")}
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
                  <p className="text-md text-[#444444] mt-1">
                    {profile.display_name}
                  </p>
                )}
              </div>
              {editingField !== "display_name" && (
                <button
                  onClick={() => handleEdit("display_name", profile.display_name)}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Email (redirects to Change Email page; kept readonly here) */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">
                  Email
                </label>
                <p className="text-md text-[#444444] mt-1">{profile.email}</p>
              </div>
              <button
                onClick={() => handleEdit("email", profile.email)}
                className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
              >
                Edit
              </button>
            </div>

            {/* Phone Number */}
            <div className="flex justify-between items-center py-2 border-b-[3px] border-[#A6B6CC66]">
              <div>
                <label className="text-base font-bold text-[#444444]">
                  Phone Number
                </label>
                {editingField === "phone" ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="tel"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-md"
                      placeholder="Add a phone number"
                    />
                    <button
                      onClick={() => handleSave("phone")}
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
                  <p className="text-md text-gray-500 mt-1">
                    {profile.phone || "You haven't added a phone number yet."}
                  </p>
                )}
              </div>
              {editingField !== "phone" && (
                <button
                  onClick={() => handleEdit("phone", profile.phone)}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Qualification Section (robust display of existing values) */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-[#444444]">Qualification</h3>
              {editingField !== "qualifications" && (
                <button
                  onClick={handleEditQualifications}
                  className="bg-[#1E3CA7] text-white px-6 py-1.5 rounded-full text-md font-semibold hover:opacity-70"
                >
                  Edit
                </button>
              )}
            </div>

            {editingField === "qualifications" ? (
              <div className="space-y-2">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-md"
                  placeholder="One qualification per line (e.g., 'MSc in Clinical Psychology')"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave("qualifications")}
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
                {qualificationsList.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {qualificationsList.map((q, idx) => (
                      <li key={idx} className="text-md text-[#444444]">
                        {q}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-md text-[#444444]">
                    No qualifications added yet.
                  </p>
                )}
              </div>
            )}
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

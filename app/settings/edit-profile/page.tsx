"use client";
import { useState, useEffect } from "react";

interface ProfileData {
  display_name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  qualifications: string;
  bio: string;
  organization: string;
  location: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    qualifications: "",
    bio: "",
    organization: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [message, setMessage] = useState("");

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const fetchProfile = async () => {
      if (isBackendConnected) {
        try {
          const sessionKey = localStorage.getItem("session_key");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/profile/`,
            {
              headers: {
                Authorization: `Token ${sessionKey}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setDummyProfile();
        }
      } else {
        setDummyProfile();
      }
      setLoading(false);
    };

    fetchProfile();
  }, [isBackendConnected]);

  const setDummyProfile = () => {
    setProfile({
      display_name: "Dr. Ali Hamza",
      email: "AliHamza123@gmail.com",
      phone: "",
      specialization: "Cognitive Therapy",
      experience: "5 years",
      qualifications: "MSc in Clinical Psychology, Certified CBT Therapist",
      bio: "Experienced mental health professional dedicated to helping patients achieve their goals.",
      organization: "Pakistan Institute of Mental Health (PIMH)",
      location: "Rawalpindi, Pakistan",
    });
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = async (field: string) => {
    const updatedProfile = { ...profile, [field]: tempValue };
    setProfile(updatedProfile);
    setEditingField(null);
    
    if (isBackendConnected) {
      try {
        const sessionKey = localStorage.getItem("session_key");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/profile/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${sessionKey}`,
            },
            body: JSON.stringify({ [field]: tempValue }),
          }
        );

        if (response.ok) {
          setMessage("Profile updated successfully!");
          setTimeout(() => setMessage(""), 3000);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-xl font-bold text-left text-[#1E3CA7] mb-8">
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
                  <img
                    src="/doc.png"
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E3CA7] mb-1">
                    {profile.display_name}
                  </h2>
                  <p className="text-sm text-[#1E3CA7]">
                    {profile.specialization}
                  </p>
                </div>
              </div>
              <button className="bg-[#1E3CA7] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700">
                Edit Profile Picture
              </button>
            </div>
          </div>

          {/* Profile Fields */}
          <div
            className="bg-white rounded-2xl mt-6 px-4 py-2 mb-4"
            style={{ border: "1px solid #2196F3" }}
          >
            {/* Display Name */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <label className="text-base font-bold text-[#444444]">Display Name</label>
                {editingField === 'display_name' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => handleSave('display_name')}
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
                  <p className="text-sm text-[#444444] mt-1">{profile.display_name}</p>
                )}
              </div>
              {editingField !== 'display_name' && (
                <button
                  onClick={() => handleEdit('display_name', profile.display_name)}
                  className="bg-[#1E3CA7] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Username */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <label className="text-base font-bold text-[#444444]">Username</label>
                <p className="text-sm text-[#444444] mt-1">Ali_Hamza123</p>
              </div>
              <button className="bg-[#1E3CA7] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700">
                Edit
              </button>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <label className="text-base font-bold text-[#444444]">Email</label>
                {editingField === 'email' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="email"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => handleSave('email')}
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
                  <p className="text-sm text-[#444444] mt-1">{profile.email}</p>
                )}
              </div>
              {editingField !== 'email' && (
                <button
                  onClick={() => handleEdit('email', profile.email)}
                  className="bg-[#1E3CA7] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex justify-between items-center py-2">
              <div>
                <label className="text-base font-bold text-[#444444]">Phone Number</label>
                {editingField === 'phone' ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="tel"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Add a phone number"
                    />
                    <button
                      onClick={() => handleSave('phone')}
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
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.phone || "You haven't added a phone number yet."}
                  </p>
                )}
              </div>
              {editingField !== 'phone' && (
                <button
                  onClick={() => handleEdit('phone', profile.phone)}
                  className="bg-[#1E3CA7] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Qualification Section */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-[#444444]">Qualification</h3>
              <button className="bg-[#1E3CA7] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700">
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-[#444444]">MSc in Clinical Psychology</p>
                <p className="text-sm text-[#444444]">Certified CBT Therapist</p>
              </div>

              <div className="text-right space-y-1">
                <p className="text-sm font-semibold text-[#444444]">
                  University of XYZ: 2021-2023
                </p>
                <p className="text-sm font-semibold text-[#444444]">
                  University of XYZ: 2024
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-lg text-center text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

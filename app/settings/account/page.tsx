"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  display_name?: string;
  phone?: string;
  last_login?: string;
  member_since?: string;
  rating?: number;
  organization?: string;
  location?: string;
  patients_assigned?: number;
  qualifications?: string[];
  university?: string;
  graduation_year?: string;
  emailVerified?: string; // Added email verification status
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isBackendConnected =
    process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      if (isBackendConnected) {
        try {
          const sessionKey = localStorage.getItem("session_key");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/profile/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${sessionKey}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to dummy data on error
          setUser(getDummyUserData());
        }
      } else {
        // Use dummy data when backend is not connected
        setUser(getDummyUserData());
      }

      setLoading(false);
    };

    fetchUserData();
  }, [isBackendConnected]);

  const getDummyUserData = (): User => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsed = JSON.parse(userData);
      // Always return doctor data for settings
      return {
        id: 1,
        username: "Ali_Hamza123",
        email: "AliHamza123@gmail.com",
        emailVerified: "✓ Verified",
        display_name: "Dr. Ali Hamza",
        user_type: "doctor",
        phone: "+92 300 1234567",
        last_login: "17 July, 2025",
        member_since: "Mar, 2024",
        rating: 4.7,
        organization: "Pakistan Institute of Mental Health (PIMH)",
        location: "Rawalpindi, Pakistan",
        patients_assigned: 8,
        qualifications: [
          "MSc in Clinical Psychology",
          "Certified CBT Therapist",
        ],
        university: "University of XYZ",
        graduation_year: "2021-2023",
      };
    }

    // Default fallback - always doctor
    return {
      id: 1,
      username: "Ali_Hamza123",
      email: "AliHamza123@gmail.com",
      emailVerified: "✓ Verified",
      display_name: "Dr. Ali Hamza",
      user_type: "doctor",
      phone: "+92 300 1234567",
      last_login: "17 July, 2025",
      member_since: "Mar, 2024",
      rating: 4.7,
      organization: "Pakistan Institute of Mental Health (PIMH)",
      location: "Rawalpindi, Pakistan",
      patients_assigned: 8,
      qualifications: ["MSc in Clinical Psychology", "Certified CBT Therapist"],
      university: "University of XYZ",
      graduation_year: "2021-2023",
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">Error loading user data</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden p-5">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-left text-[#1E3CA7] mb-16">
          My Account
        </h1>

        {/* Account Detail Section - Single container */}
        <div
          className="bg-[#E9F5FE] rounded-3xl p-5 relative flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Doctor Profile Header - Inside Account Detail */}
          <div
            className="bg-white rounded-2xl p-5 mb-5 absolute top-0 -translate-y-1/2 w-[calc(100%-2.5rem)]"
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <img
                    src="/doc.png"
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E3CA7] mb-1">
                    {user.display_name || user.username}
                  </h2>
                  <p className="text-base text-[#1E3CA7] font-normal">
                    Cognitive Therapy
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">⭐</span>
                  <span className="text-base font-bold text-[#1E3CA7]">
                    {user.rating} Rating
                  </span>
                </div>
                <p className="text-md font-normal text-[#444444]">
                  Member Since {user.member_since}
                </p>
              </div>
            </div>
          </div>

          {/* Account Detail Header */}
          <div className="flex items-center justify-between pt-10 mb-4">
            <h3 className="text-xl font-bold text-[#1E3CA7]">Account Detail</h3>
            <span className="text-md font-normal text-[#444444]">
              Last Login: {user.last_login}
            </span>
          </div>

          <div className="flex gap-5 mb-5">
            {/* Left Column - Takes 60% width with all fields */}
            <div
              className="w-[60%] bg-white rounded-xl p-4 space-y-4"
              style={{ border: "1px solid #2196F3" }}
            >
              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Display Name
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {user.display_name || user.username}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Username
                </label>
                <p className="text-base font-normal text-[#444444]">
                  {user.username}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-md font-bold text-[#444444]">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-base font-normal mb-0 text-[#444444]">
                    {user.email}
                  </p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {user.emailVerified}
                  </span>
                </div>
              </div>

              {/* Add Phone Number */}
              <div className="flex justify-start">
                <button className="text-[#1E3CA7] p-0 text-md bg-transparent text-left font-semibold hover:underline">
                  Add a phone number
                </button>
              </div>
            </div>

            {/* Right Column - Takes 40% width and matches left column height */}
            <div className="w-[40%] flex flex-col gap-4">
              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-md font-semibold text-[#444444] block mb-3 text-center">
                  Affiliated Organization
                </label>
                <div className="text-center">
                  <p className="text-base font-normal text-[#444444] mb-1">
                    {user.organization}
                  </p>
                  <p className="text-md font-normal text-[#444444]">
                    {user.location}
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-md font-semibold text-[#444444] text-center">
                  Patients Assigned: {user.patients_assigned}
                </label>
              </div>
            </div>
          </div>

          {/* Qualification Section */}
          <div
            className="bg-white rounded-xl p-4 mb-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <h3 className="text-xl font-bold text-[#444444] mb-4">
              Qualification
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                {user.qualifications?.map((qual, index) => (
                  <p key={index} className="text-base font-normal text-[#444444]">
                    {qual}
                  </p>
                ))}
              </div>

              <div className="text-right space-y-1">
                <p className="text-base font-semibold text-[#444444]">
                  {user.university}: {user.graduation_year}
                </p>
                <p className="text-base font-semibold text-[#444444]">
                  {user.university}: 2024
                </p>
              </div>
            </div>
          </div>

          {/* Update Profile Link */}
          <div className="text-center">
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
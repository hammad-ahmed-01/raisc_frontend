"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditPatientProfile from "@/components/PatientSettings/EditProfile/EditProfile";
import EditDoctorProfile from "@/components/DoctorSettings/EditProfile/EditProfile";
import EditOrganizationProfile from "@/components/OrganizationSettings/EditProfile/EditProfile";
import { checkAuth, redirectToLogin } from "@/lib/auth";

interface ProfileData {
  // NEW: username supported for Doctor UI row
  username?: string;

  display_name: string;
  email: string;
  phone: string;
  specialization?: string;
  experience?: string;
  qualifications?: string;
  bio: string;
  organization?: string;
  location: string;

  // Patient specific fields
  age?: string;
  condition?: string;
  emergency_contact?: string;
  user_type?: string;
  therapyFocus?: string;

  // Organization specific fields
  organization_name?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_numbers?: string[];
  linkedin?: string;
}

export default function EditProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData>({
    username: "",
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

  const [userType, setUserType] = useState<string>("doctor");
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [message, setMessage] = useState("");
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
  const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");
  const CHANGE_EMAIL_ROUTE = "/settings/change-email";

  const setDummyProfile = (type: string) => {
    if (type === "patient") {
      setProfile({
        username: "john_doe",
        display_name: "John Doe",
        email: "patient@example.com",
        phone: "+92 300 9876543",
        age: "28",
        condition: "Anxiety, Depression",
        emergency_contact: "+92 300 1111111",
        therapyFocus: "Managing Stress and Anxiety",
        location: "Islamabad, Pakistan",
        bio: "Patient seeking mental health support.",
        user_type: "patient",
      });
    } else if (type === "organization") {
      setProfile({
        username: "org_admin",
        display_name: "",
        email: "",
        phone: "",
        bio: "",
        location: "Rawalpindi, Pakistan",
        organization_name: "Pakistan Institute Of Mental Health",
        description: "Pakistan Institute Of Mental Health",
        logo_url: "/PIMH.jpeg",
        contact_email: "info@pimh.org",
        contact_numbers: ["+92300-xxxxxxx", "+92300-xxxxxxx"],
        linkedin: "linkedin.com",
      });
    } else {
      setProfile({
        username: "Ali_Hamza123",
        display_name: "Dr. Ali Hamza",
        email: "AliHamza123@gmail.com",
        phone: "",
        specialization: "Cognitive Therapy",
        experience: "5 years",
        qualifications: "MSc in Clinical Psychology, Certified CBT Therapist",
        bio: "Experienced mental health professional dedicated to helping patients achieve their goals.",
        organization: "Pakistan Institute of Mental Health (PIMH)",
        location: "Rawalpindi, Pakistan",
        user_type: "doctor",
      });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        // role + current username from localStorage
        let currentUserType = "doctor";
        let currentUsername = "";
        try {
          const userData = localStorage.getItem("user_data");
          if (userData) {
            const parsed = JSON.parse(userData);
            currentUserType = parsed.user_type || "doctor";
            currentUsername = parsed.username || "";
            setUserType(currentUserType);
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }

        if (isBackendConnected && BASE) {
          try {
            const sessionKey = localStorage.getItem("session_key");
            if (!sessionKey) throw new Error("No session key found");

            const response = await fetch(
              `${BASE}/users/${currentUserType}/profile/`,
              { headers: { Authorization: `Token ${sessionKey}` } }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Merge canonical username into profile so Username row uses real value
            setProfile((prev) => ({ ...prev, ...data, username: currentUsername }));
          } catch (error) {
            console.error("Error fetching profile:", error);
            setDummyProfile(currentUserType);
          }
        } else {
          setDummyProfile(currentUserType);
        }
      } catch (error) {
        console.error("General error in fetchProfile:", error);
        setDummyProfile("doctor");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isBackendConnected, BASE]);

  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        const authResult = await checkAuth();
        if (!authResult.isAuthenticated) {
          setAuthError(authResult.error || "Authentication required");
          setTimeout(() => {
            redirectToLogin();
          }, 2000);
          return;
        }
        setAuthVerified(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("Authentication check failed");
      }
    };

    if (typeof window !== "undefined") {
      performAuthCheck();
    }
  }, []);

  const handleEdit = (field: string, currentValue: string) => {
    // Email is edited on its own page
    if (field === "email") {
      router.push(CHANGE_EMAIL_ROUTE);
      return;
    }
    setEditingField(field);
    setTempValue(currentValue ?? "");
  };

  const handleSave = async (field: string) => {
    try {
      // Email not saved here
      if (field === "email") {
        router.push(CHANGE_EMAIL_ROUTE);
        return;
      }

      // Optimistic update
      const updatedProfile = { ...profile, [field]: tempValue };
      setProfile(updatedProfile);
      setEditingField(null);

      if (isBackendConnected && BASE) {
        const sessionKey = localStorage.getItem("session_key");
        if (!sessionKey) throw new Error("No session key found");

        const response = await fetch(`${BASE}/users/profile/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${sessionKey}`,
          },
          body: JSON.stringify({ [field]: tempValue }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Optionally, refresh from server if your view returns updated profile
        // const serverProfile = await response.json();
        // setProfile((prev) => ({ ...prev, ...serverProfile }));

        // Notify dashboards/tabs
        window.dispatchEvent(new Event("profile:updated"));
        new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });

        // If username changed, also refresh local user_data.username for consistency
        if (field === "username") {
          try {
            const raw = localStorage.getItem("user_data");
            const parsed = raw ? JSON.parse(raw) : {};
            parsed.username = tempValue;
            localStorage.setItem("user_data", JSON.stringify(parsed));
          } catch {}
        }

        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  if (!authVerified || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (userType === "patient") {
    return (
      <EditPatientProfile
        profile={profile}
        editingField={editingField}
        tempValue={tempValue}
        message={message}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleCancel={handleCancel}
        setTempValue={setTempValue}
      />
    );
  }

  if (userType === "organization") {
    return (
      <EditOrganizationProfile
        profile={profile}
        editingField={editingField}
        tempValue={tempValue}
        message={message}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleCancel={handleCancel}
        setTempValue={setTempValue}
      />
    );
  }

  return (
    <EditDoctorProfile
      profile={profile}
      editingField={editingField}
      tempValue={tempValue}
      message={message}
      handleEdit={handleEdit}
      handleSave={handleSave}
      handleCancel={handleCancel}
      setTempValue={setTempValue}
    />
  );
}

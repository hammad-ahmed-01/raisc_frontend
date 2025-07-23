"use client";
import { useState, useEffect } from "react";
import EditPatientProfile from "@/components/PatientSettings/EditProfile/EditProfile";
import EditDoctorProfile from "@/components/DoctorSettings/EditProfile/EditProfile";
import { checkAuth, redirectToLogin } from "@/lib/auth";

interface ProfileData {
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

  const [userType, setUserType] = useState<string>('doctor');
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [message, setMessage] = useState("");
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    // Get user type from localStorage
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserType(parsed.user_type || 'doctor');
    }

    const fetchProfile = async () => {
      if (isBackendConnected) {
        try {
          const sessionKey = localStorage.getItem("session_key");
          const userData = localStorage.getItem("user_data");
          const userType = userData ? JSON.parse(userData).user_type : "doctor";
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/${userType}/profile/`,
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
  }, [isBackendConnected, userType]);

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication required");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }
      setAuthVerified(true);
    };
    performAuthCheck();
  }, []);

  const setDummyProfile = () => {
    if (userType === 'patient') {
      setProfile({
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
    } else {
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
        user_type: "doctor",
      });
    }
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

  // Render Patient Edit Profile
  if (userType === 'patient') {
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

  // Render Doctor Edit Profile 
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

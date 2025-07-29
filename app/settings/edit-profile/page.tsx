"use client";
import { useState, useEffect } from "react";
import EditPatientProfile from "@/components/PatientSettings/EditProfile/EditProfile";
import EditDoctorProfile from "@/components/DoctorSettings/EditProfile/EditProfile";
import EditOrganizationProfile from "@/components/OrganizationSettings/EditProfile/EditProfile";
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
  // Organization specific fields
  organization_name?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_numbers?: string[];
  linkedin?: string;
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

  // Move setDummyProfile outside useEffect to avoid dependency issues
  const setDummyProfile = (type: string) => {
    if (type === 'patient') {
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
    } else if (type === 'organization') {
      setProfile({
        display_name: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        organization_name: "Pakistan Institute Of Mental Health",
        description: "Pakistan Institute Of Mental Health",
        logo_url: "/org-logo.png",
        contact_email: "info@pimh.org",
        contact_numbers: ["+92300-xxxxxxx", "+92300-xxxxxxx"],
        linkedin: "linkedin.com",
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if window object exists (client-side only)
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Get user type from localStorage with error handling
        let currentUserType = 'doctor';
        try {
          const userData = localStorage.getItem("user_data");
          if (userData) {
            const parsed = JSON.parse(userData);
            currentUserType = parsed.user_type || 'doctor';
            setUserType(currentUserType);
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }

        if (isBackendConnected) {
          try {
            const sessionKey = localStorage.getItem("session_key");
            
            if (!sessionKey) {
              throw new Error("No session key found");
            }

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/${currentUserType}/profile/`,
              {
                headers: {
                  Authorization: `Token ${sessionKey}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              setProfile(data);
            } else {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            setDummyProfile(currentUserType);
          }
        } else {
          setDummyProfile(currentUserType);
        }
      } catch (error) {
        console.error("General error in fetchProfile:", error);
        setDummyProfile('doctor');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isBackendConnected]); // Removed userType from dependencies to prevent infinite loop

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
    
    // Only run auth check on client side
    if (typeof window !== 'undefined') {
      performAuthCheck();
    }
  }, []);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = async (field: string) => {
    try {
      const updatedProfile = { ...profile, [field]: tempValue };
      setProfile(updatedProfile);
      setEditingField(null);
      
      if (isBackendConnected) {
        const sessionKey = localStorage.getItem("session_key");
        
        if (!sessionKey) {
          throw new Error("No session key found");
        }

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
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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

  // Show error state
  if (authError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  // Show loading state
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

  // Render Organization Edit Profile
  if (userType === 'organization') {
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

  // Render Doctor Edit Profile (default)
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
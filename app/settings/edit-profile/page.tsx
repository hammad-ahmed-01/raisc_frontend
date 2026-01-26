"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import EditPatientProfile from "@/components/PatientSettings/EditProfile/EditProfile";
import EditDoctorProfile from "@/components/DoctorSettings/EditProfile/EditProfile";
import EditOrganizationProfile from "@/components/OrganizationSettings/EditProfile/EditProfile";
import { checkAuth, redirectToLogin } from "@/lib/auth";

interface ProfileData {
  username?: string;
  display_name: string;
  email: string;
  phone: string;

  specialization?: string;
  experience?: string | number;
  qualifications?: string | string[];
  bio: string;
  organization?: string;
  location: string;
  education?: string;
  profile_image?: string;
  rates?: string | number;

  chatgroup_nickname?: string;

  // Patient fields
  age?: string;
  gender?: string;
  condition?: string;
  emergency_contact?: string;
  user_type?: string;
  therapyFocus?: string;

  // Organization fields
  organization_name?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_numbers?: string[];
  linkedin?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const pictureSectionRef = useRef<HTMLDivElement | null>(null);

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
    education: "",
    profile_image: "",
    rates: "",
    chatgroup_nickname: "",
    age: "",
    gender: "",
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
        gender: "Male",
        condition: "Anxiety, Depression",
        emergency_contact: "+92 300 1111111",
        therapyFocus: "Managing Stress and Anxiety",
        chatgroup_nickname: "John's Group",
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
        chatgroup_nickname: "PIMH Group",
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
        education: "MSc Clinical Psych",
        profile_image: "/doc.png",
        rates: "480.00",
        chatgroup_nickname: "Dr Ali's Group",
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

        let currentUserType = "doctor";
        try {
          const ud = localStorage.getItem("user_data");
          if (ud) {
            const parsed = JSON.parse(ud);
            currentUserType = parsed.user_type || "doctor";
            setUserType(currentUserType);
          }
        } catch {}

        if (isBackendConnected && BASE) {
          const token =
            localStorage.getItem("session_key") ||
            localStorage.getItem("token") ||
            "";

          if (!token) {
            setDummyProfile(currentUserType);
            setLoading(false);
            return;
          }

          // For organization, fetch from organization endpoint
          if (currentUserType === "organization") {
            const resp = await fetch(`${BASE}/organization/organization_details`, {
              headers: { 
                Authorization: `Token ${token}`,
                "Content-Type": "application/json"
              },
              cache: "no-store"
            });
            
            if (resp.ok) {
              const data = await resp.json();
              setProfile({
                username: "",
                display_name: "",
                email: "",
                phone: "",
                bio: "",
                location: data.location || "",
                organization_name: data.name || "",
                description: data.details?.description || "",
                logo_url: data.logo || data.details?.logo_url || "",
                contact_email: data.details?.contact_email || "",
                contact_numbers: data.details?.contact_numbers || [],
                linkedin: data.details?.linkedin || "",
              });
            } else {
              setDummyProfile(currentUserType);
            }
          } else {
            // For doctor/patient, fetch from users/profile
            const resp = await fetch(`${BASE}/users/profile/`, {
              headers: { Authorization: `Token ${token}` },
            });
            
            if (resp.ok) {
              const data = await resp.json();
              try {
                const raw = localStorage.getItem("user_data");
                const userData = raw ? JSON.parse(raw) : {};
                userData.username = data.username ?? userData.username;
                userData.display_name = data.display_name ?? userData.display_name;
                localStorage.setItem("user_data", JSON.stringify(userData));
              } catch {}
              setProfile((prev) => ({ ...prev, ...data }));
            } else {
              setDummyProfile(currentUserType);
            }
          }
        } else {
          setDummyProfile(currentUserType);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
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
          setTimeout(() => redirectToLogin(), 2000);
          return;
        }
        setAuthVerified(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("Authentication check failed");
      }
    };

    if (typeof window !== "undefined") performAuthCheck();
  }, []);

  const handleEdit = (field: string, currentValue: string) => {
    if (field === "email") {
      router.push(CHANGE_EMAIL_ROUTE);
      return;
    }

    if ((field === "profile_image" || field === "logo_url") && pictureSectionRef.current) {
      pictureSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setEditingField(field);
    setTempValue(currentValue ?? "");
  };

  const handleSave = async (field: string) => {
    try {
      if (field === "email") {
        router.push(CHANGE_EMAIL_ROUTE);
        return;
      }

      const updated = { ...profile, [field]: tempValue };
      setProfile(updated);
      setEditingField(null);

      if (isBackendConnected && BASE) {
        const token =
          localStorage.getItem("session_key") ||
          localStorage.getItem("token") ||
          "";

        if (!token) throw new Error("No session key found");

        let endpoint = `${BASE}/users/profile/`;
        let payload: any = { [field]: tempValue };

        // For organization, use different endpoint and payload structure
        if (userType === "organization") {
          endpoint = `${BASE}/organization/organization_details`;
          payload = {
            name: field === "organization_name" ? tempValue : profile.organization_name,
            location: field === "location" ? tempValue : profile.location,
            details: {
              description: field === "description" ? tempValue : profile.description,
              contact_email: field === "contact_email" ? tempValue : profile.contact_email,
              contact_numbers: field === "contact_numbers" 
                ? tempValue.split(",").map(n => n.trim()).filter(Boolean)
                : profile.contact_numbers,
              linkedin: field === "linkedin" ? tempValue : profile.linkedin,
            },
          };
        }

        const resp = await fetch(endpoint, {
          method: userType === "organization" ? "PUT" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

        const serverProfile = await resp.json();
        
        if (userType === "organization") {
          setProfile((prev) => ({
            ...prev,
            organization_name: serverProfile.name || prev.organization_name,
            location: serverProfile.location || prev.location,
            description: serverProfile.details?.description || prev.description,
            contact_email: serverProfile.details?.contact_email || prev.contact_email,
            contact_numbers: serverProfile.details?.contact_numbers || prev.contact_numbers,
            linkedin: serverProfile.details?.linkedin || prev.linkedin,
            logo_url: serverProfile.logo || prev.logo_url,
          }));
        } else {
          setProfile((prev) => ({ ...prev, ...serverProfile }));

          try {
            const raw = localStorage.getItem("user_data");
            const userData = raw ? JSON.parse(raw) : {};
            if (field === "username") userData.username = serverProfile.username;
            if (serverProfile.display_name)
              userData.display_name = serverProfile.display_name;
            localStorage.setItem("user_data", JSON.stringify(userData));
          } catch {}
        }

        window.dispatchEvent(new Event("profile:updated"));
        new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });

        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
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
      <div className="flex items-center justify-center h-full px-4 md:px-0">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  if (!authVerified || loading) {
    return (
      <div className="flex items-center justify-center h-full px-4 md:px-0">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (userType === "patient") {
    return (
      <div ref={pictureSectionRef}>
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
      </div>
    );
  }

  if (userType === "organization") {
    return (
      <div ref={pictureSectionRef}>
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
      </div>
    );
  }

  return (
    <div ref={pictureSectionRef}>
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
    </div>
  );
}
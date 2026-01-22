"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorMyAccount from "@/components/DoctorSettings/Account/MyAccount";
import PatientMyAccount from "@/components/PatientSettings/Account/MyAccount";
import OrganizationMyAccount from "@/components/OrganizationSettings/Account/MyAccount";
import { checkAuth, redirectToLogin } from "@/lib/auth";

/* ------------------------------- types ------------------------------- */
export interface Doctor {
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
  organization_id?: number;
  location?: string;
  patients_assigned?: number;
  qualifications?: string[];
  university?: string;
  graduation_year?: string;
  specialization?: string;
  emailVerified?: string;
  imageUrl?: string;
  chatgroup_nickname?: string;
  education?: string;
  expertise?: string[];
}

export interface Patient {
  displayName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  lastLogin: string;
  therapyFocus: string;
  sessionsCompleted: number;
  lastSession: string;
  age?: string;
  gender?: string;
  phone?: string;
  imageUrl?: string;
  chatgroup_nickname?: string;
}

export interface Organization {
  organization_name: string;
  description: string;
  logo_url?: string;
  contact_email: string;
  contact_numbers: string[];
  location: string;
  linkedin?: string;
}

/* ------------------------------ helpers ------------------------------ */
const safe = (v: unknown) => (v == null ? "" : String(v));

const toDate = (d: unknown) => {
  const s = safe(d);
  const dt = s ? new Date(s) : null;
  return dt && !isNaN(dt.getTime()) ? dt : null;
};

const fmtDate = (d: unknown) => {
  const dt = toDate(d);
  return dt ? dt.toLocaleDateString() : "";
};

const fmtDateTime = (d: unknown) => {
  const dt = toDate(d);
  return dt ? `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}` : "";
};

const splitToList = (text?: string): string[] => {
  const s = safe(text).trim();
  if (!s) return [];
  return s
    .split(/\r?\n|,|\|/g)
    .map((x) => x.trim())
    .filter(Boolean);
};

const buildAuthHeader = (): HeadersInit => {
  const token =
    localStorage.getItem("session_key") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    "";
  const v = token.trim();
  if (!v) return {};
  return { Authorization: /^token\s+/i.test(v) ? v : `Token ${v}` };
};

/* ----------------------------- mappers ------------------------------- */
function mapMeToDoctor(me: any): Doctor {
  console.log("Raw backend data:", me); // Debug log

  const dp = me?.doctor_profile || me?.doctor || {};
  const pi = dp?.professional_information || {};

  console.log("Doctor profile:", dp); // Debug log
  console.log("Professional info:", pi); // Debug log

  const username = safe(me?.username);
  const email = safe(me?.email);
  const emailVerified =
    me?.email_verified === true || me?.is_email_verified === true
      ? "✓ Verified"
      : "Unverified";

  const display_name =
    safe(pi?.display_name || me?.display_name || me?.name) || username;

  const education = safe(pi?.education);
  const qualifications = splitToList(education);

  const imageUrl =
    safe(
      pi?.profile_image ||
        dp?.profile_image ||
        me?.profile_image ||
        me?.avatar ||
        ""
    ) || "";

  // ✅ CRITICAL: Get organization from serializer fields FIRST
  const organizationName = 
    safe(dp?.organization_name) ||           // ← Serializer field (highest priority)
    safe(pi?.organization) ||                 // ← Professional info
    safe(me?.organization_profile?.name) ||   // ← Nested profile
    safe(me?.organization?.name) ||           // ← Direct organization
    "";

  const organizationId = 
    dp?.organization_id ||                    // ← Serializer field (highest priority)
    me?.organization_profile?.id ||
    me?.organization?.id ||
    null;

  // ✅ CRITICAL: Get patients_assigned from serializer field
  const patientsAssigned = Number(dp?.patients_assigned ?? 0);

  console.log("Extracted organization:", organizationName, organizationId); // Debug
  console.log("Extracted patients_assigned:", patientsAssigned); // Debug

  return {
    id: Number(me?.id ?? 0),
    username,
    email,
    user_type: "doctor",
    display_name,
    phone: safe(pi?.phone || me?.phone),
    last_login: fmtDateTime(me?.last_login),
    member_since: fmtDate(me?.date_joined || me?.joined_at),
    rating: Number(pi?.rating ?? dp?.rating ?? 0),
    organization: organizationName || "—",
    organization_id: organizationId,
    patients_assigned: patientsAssigned,
    qualifications,
    university: safe(pi?.university),
    graduation_year: safe(pi?.graduation_year),
    specialization: safe(pi?.specialization),
    emailVerified,
    imageUrl,
    chatgroup_nickname: safe(dp?.chatgroup_nickname || pi?.chatgroup_nickname || ""),
    education,
    expertise: splitToList(pi?.expertise),
    location: safe(pi?.location),
  };
}

function mapMeToPatient(me: any): Patient {
  const pp = me?.patient_profile || {};
  const pd = (pp?.profile_data ?? {}) as Record<string, unknown>;

  const displayName =
    (pd?.display_name as string) ||
    safe(me?.display_name || me?.name) ||
    safe(me?.username);

  const imageUrl =
    safe(
      (pd as any)?.profile_image ||
        pp?.profile_image ||
        me?.profile_image ||
        me?.avatar ||
        ""
    ) || "";

  return {
    displayName,
    username: safe(me?.username),
    email: safe(me?.email),
    emailVerified: !!(
      me?.email_verified === true || me?.is_email_verified === true
    ),
    lastLogin: fmtDateTime(me?.last_login),
    therapyFocus: safe(
      (pd as any)?.therapyFocus ||
        (pd as any)?.therapy_focus ||
        "General Wellbeing"
    ),
    sessionsCompleted: Number(pp?.sessions_completed ?? 0),
    lastSession: fmtDate(pp?.last_session),
    age: safe((pd as any)?.age || ""),
    gender: safe((pd as any)?.gender || ""),
    phone: safe((pd as any)?.phone || me?.phone || ""),
    imageUrl,
    chatgroup_nickname: safe((pd as any)?.chatgroup_nickname || ""),
  };
}

function mapMeToOrganization(me: any): Organization {
  const op = me?.organization_profile || me?.organization || {};
  const details = op?.details || {};
  return {
    organization_name: safe(op?.name || me?.organization_name || "Organization"),
    description: safe(details?.description || ""),
    logo_url: safe(details?.logo_url || op?.logo_url || ""),
    contact_email: safe(details?.contact_email || me?.email || ""),
    contact_numbers: Array.isArray(details?.contact_numbers)
      ? details.contact_numbers.map((x: any) => safe(x))
      : [safe(details?.contact_numbers || "")].filter(Boolean),
    location: safe(op?.location || ""),
    linkedin: safe(details?.linkedin || ""),
  };
}

/* ------------------------------ component ---------------------------- */
export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userTypeS, setUserTypeS] = useState<string>("");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    (async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication required");
        setTimeout(() => redirectToLogin(), 2000);
        return;
      }
      setAuthVerified(true);
    })();
  }, []);

  useEffect(() => {
    if (!authVerified) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeader(),
          },
          cache: "no-store",
        });

        const text = await res.text();
        const me = text ? JSON.parse(text) : null;
        
        if (!res.ok || !me) {
          throw new Error(`Failed to load user data (${res.status})`);
        }

        console.log("✅ Full user data received:", me);

        const type = safe(me?.user_type).toLowerCase();
        setUserTypeS(type);

        if (type === "doctor") {
          const mappedDoctor = mapMeToDoctor(me);
          console.log("✅ Mapped doctor data:", mappedDoctor);
          setDoctor(mappedDoctor);
        } else if (type === "patient") {
          setPatient(mapMeToPatient(me));
        } else if (type === "organization") {
          setOrganization(mapMeToOrganization(me));
        }
      } catch (err) {
        console.error("❌ AccountPage: /api/users/me failed", err);
        setAuthError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authVerified]);

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  if (!authVerified || loading) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!doctor && !patient && !organization) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-xl text-red-600">Error loading user data</div>
      </div>
    );
  }

  if (userTypeS === "doctor" && doctor) {
    return <DoctorMyAccount doctor={doctor} />;
  }

  if (userTypeS === "patient" && patient) {
    return <PatientMyAccount patient={patient} />;
  }

  if (userTypeS === "organization" && organization) {
    return <OrganizationMyAccount organization={organization} />;
  }

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-xl text-red-600">Error loading user data</div>
    </div>
  );
}
"use client";
import { useEffect, useMemo, useState } from "react";
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
  location?: string;
  patients_assigned?: number;
  qualifications?: string[];
  university?: string;
  graduation_year?: string;
  emailVerified?: string; // "✓ Verified" or "Unverified"
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

const isBackendConnected =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

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

const splitQualifications = (education?: string): string[] => {
  const s = safe(education).trim();
  if (!s) return [];
  return s.split(/\r?\n|,|\|/g).map((x) => x.trim()).filter(Boolean);
};

const guessUniversity = (education?: string): string => {
  const s = safe(education).trim();
  if (!s) return "";
  const at = s.split(/\bat\b/i);
  if (at.length > 1 && at[1]) {
    return at[1].replace(/[\(\)\d\-–,]/g, "").trim();
  }
  const dash = s.split(/[–-]/);
  if (dash.length > 1 && dash[1]) {
    return dash[1].replace(/[\(\)\d,]/g, "").trim();
  }
  const m = s.match(/\bUniversity\s+of\s+[A-Za-z ]+/i);
  return m ? m[0].trim() : s;
};

const guessGradYear = (education?: string): string => {
  const m = safe(education).match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : "";
};

const buildAuthHeader = (): HeadersInit => {
  const raw =
    localStorage.getItem("session_key") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    "";
  const v = raw.trim();
  if (!v) return {};
  return { Authorization: /^token\s+/i.test(v) ? v : `Token ${v}` };
};

/* ----------------------------- mappers ------------------------------- */

function mapMeToDoctor(me: any): Doctor {
  const dp = me?.doctor_profile || me?.doctor || {};
  const pi = dp?.professional_information || {};

  const username = safe(me?.username);
  const email = safe(me?.email);
  const emailVerified =
    me?.email_verified === true || me?.is_email_verified === true
      ? "✓ Verified"
      : "Unverified";

  const display_name =
    safe(pi?.display_name || me?.display_name || me?.name) || username;

  const education = safe(pi?.education);
  const qualifications = splitQualifications(education);
  const university = guessUniversity(education) || "";
  const graduation_year = safe(pi?.graduation_year || guessGradYear(education));

  return {
    id: Number(me?.id ?? 0),
    username,
    email,
    user_type: "doctor",
    display_name,
    phone: safe(me?.phone || me?.doctor_profile?.phone),
    last_login: fmtDateTime(me?.last_login),
    member_since: fmtDate(me?.date_joined || me?.joined_at),
    rating: Number(pi?.rating ?? dp?.rating ?? 0),
    organization: safe(me?.organization_profile?.name || me?.organization?.name),
    location: safe(pi?.location),
    patients_assigned:
      Number(dp?.patients_assigned ?? dp?.stats?.patients_assigned ?? 0) || 0,
    qualifications,
    university,
    graduation_year,
    emailVerified,
  };
}

function mapMeToPatient(me: any): Patient {
  const pp = me?.patient_profile || {};
  const pd = (pp?.profile_data ?? {}) as Record<string, unknown>;
  const displayName =
    (pd?.display_name as string) ||
    safe(me?.display_name || me?.name) ||
    safe(me?.username);

  return {
    displayName,
    username: safe(me?.username),
    email: safe(me?.email),
    emailVerified: !!(me?.email_verified === true || me?.is_email_verified === true),
    lastLogin: fmtDateTime(me?.last_login),
    therapyFocus: safe(pd?.therapy_focus || "General Wellbeing"),
    sessionsCompleted: Number(pp?.sessions_completed ?? 0),
    lastSession: fmtDate(pp?.last_session),
  };
}

function mapMeToOrganization(me: any): Organization {
  const op = me?.organization_profile || me?.organization || {};
  return {
    organization_name: safe(op?.name || me?.organization_name || "Organization"),
    description: safe(op?.description || ""),
    logo_url: safe(op?.logo_url || op?.logo || ""),
    contact_email: safe(op?.contact_email || me?.email || ""),
    contact_numbers: Array.isArray(op?.contact_numbers)
      ? op.contact_numbers.map((x: any) => safe(x))
      : [safe(op?.contact_numbers || "")].filter(Boolean),
    location: safe(op?.location || ""),
    linkedin: safe(op?.linkedin || ""),
  };
}

/* ----------------------------- dummy data ---------------------------- */

const getDummyPatient = (): Patient => ({
  displayName: "Ayesha Khan",
  username: "ayesha_khan22",
  email: "ayesha.khan22@example.com",
  emailVerified: true,
  lastLogin: "19 July, 2025",
  therapyFocus: "Anxiety & Stress Management",
  sessionsCompleted: 12,
  lastSession: "15 July, 2025",
});

const getDummyDoctor = (): Doctor => ({
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
});

const getDummyOrganization = (): Organization => ({
  organization_name: "Pakistan Institute Of Mental Health",
  description: "Pakistan Institute Of Mental Health..........",
  logo_url: "/PIMH.jpeg",
  contact_email: "info@pimh.org",
  contact_numbers: ["+92300-xxxxxxx", "+92300-xxxxxxx"],
  location: "Rawalpindi, Pakistan",
  linkedin: "linkedin.com",
});

/* ------------------------------ component ---------------------------- */

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userTypeS, setUserTypeS] = useState<string>("");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Step 1: verify auth (unchanged)
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

  // Step 2: fetch current user via Next proxy: /api/users/me
  useEffect(() => {
    if (!authVerified) return;

    const fetchUserData = async () => {
      setLoading(true);

      // default to localStorage user_type (keeps UI consistent if backend fails)
      const userDataRaw = localStorage.getItem("user_data");
      const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
      const localUserType = userData ? userData.user_type : undefined;

      if (isBackendConnected) {
        try {
          const res = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...buildAuthHeader(),
            },
            cache: "no-store",
          });

          const text = await res.text();
          const me = text ? JSON.parse(text) : null;

          if (!res.ok || !me) {
            throw new Error(`Upstream failed (${res.status})`);
          }

          const serverType = safe(me?.user_type).toLowerCase();
          const type = serverType || localUserType || "doctor";
          setUserTypeS(type);

          if (type === "doctor") {
            setDoctor(mapMeToDoctor(me));
            setPatient(null);
            setOrganization(null);
          } else if (type === "patient") {
            setPatient(mapMeToPatient(me));
            setDoctor(null);
            setOrganization(null);
          } else if (type === "organization") {
            setOrganization(mapMeToOrganization(me));
            setDoctor(null);
            setPatient(null);
          } else {
            // fallback to doctor card if unknown
            setDoctor(mapMeToDoctor(me));
            setPatient(null);
            setOrganization(null);
            setUserTypeS("doctor");
          }
        } catch (err) {
          console.error("AccountPage: /api/users/me failed, using dummy data.", err);
          const type = localUserType || "doctor";
          setUserTypeS(type);
          if (type === "doctor") setDoctor(getDummyDoctor());
          if (type === "patient") setPatient(getDummyPatient());
          if (type === "organization") setOrganization(getDummyOrganization());
        }
      } else {
        // demo path
        const type = localUserType || "doctor";
        setUserTypeS(type);
        if (type === "doctor") setDoctor(getDummyDoctor());
        if (type === "patient") setPatient(getDummyPatient());
        if (type === "organization") setOrganization(getDummyOrganization());
      }

      setLoading(false);
    };

    fetchUserData();
  }, [authVerified]);

  /* ------------------------------- render -------------------------------- */

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

  if (!doctor && !patient && !organization) {
    return (
      <div className="flex items-center justify-center h-full">
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
    <div className="flex items-center justify-center h-full">
      <div className="text-xl text-red-600">Error loading user data</div>
    </div>
  );
}

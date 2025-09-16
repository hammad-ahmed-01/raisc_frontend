// app/DoctorsPage/_utils.ts
import type { User, PatientProfile } from "./types";

export const safeStr = (v: any) => (v == null ? "" : String(v));

export const yearsFromExperience = (exp: unknown): number => {
  if (typeof exp === "number" && Number.isFinite(exp)) return exp;
  const m = String(exp ?? "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

export const truncate = (s: string, max = 140) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

export const readUserFromLocalStorage = (): User | null => {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/** same name-resolution strategy you used */
export const resolveDisplayName = (u: User | null) => {
  if (!u) return "";
  if (u.user_type === "doctor") {
    return (
      u.doctor_profile?.professional_information?.display_name?.toString().trim() ||
      u.username
    );
  }
  if (u.user_type === "patient") {
    const pd = (u.patient_profile?.profile_data ?? {}) as Record<string, unknown>;
    const dn = (pd?.display_name as string) || "";
    return dn.trim() || u.username;
  }
  // org or others
  return u.username;
};

export const normalizeUser = (u: User): User => {
  if (u?.user_type !== "patient") return u;

  // try to merge profile_data from backend/localStorage (whichever has it)
  let profileData: Record<string, unknown> | null = null;
  try {
    profileData = (u.patient_profile as any)?.profile_data ?? null;
  } catch {}
  if (!profileData) {
    const raw = localStorage.getItem("user_data");
    try {
      const parsed = raw ? JSON.parse(raw) : {};
      profileData = (parsed?.patient_profile?.profile_data ?? null) as Record<string, unknown> | null;
    } catch {}
  }

  const pp = u.patient_profile ?? null;
  const safePP: PatientProfile = {
    level: typeof pp?.level === "number" ? pp.level : 0,
    associated_psychologist: pp?.associated_psychologist ?? null,
    associated_psychologist_name: pp?.associated_psychologist_name ?? null,
    sent_requests: pp?.sent_requests ?? [],
    profile_data: profileData ?? null,
  };

  return { ...u, patient_profile: safePP };
};

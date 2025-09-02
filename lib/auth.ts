export type UserType = "patient" | "doctor" | "organization";

export interface PatientProfile {
  level: number;
  associated_psychologist: string | null;
  associated_psychologist_name: string | null;
  sent_requests?: string[];
}

export interface DoctorProfile {
  professional_information?: {
    specialization?: string;
    experience?: string | number;
    qualifications?: string;
    location?: string;
    education?: string;
    expertise?: string[];
    profile_image?: string;
    rating?: number;
  };
  chatgroup_nickname?: string;
  rates?: string | number;
}

export interface OrganizationProfile {
  name?: string;
  total_psychologists?: number;
  total_patients?: number;
  sessions_today?: number;
  new_join_requests?: number;
  todays_sessions?: { doctor: string; therapy_type: string; time: string }[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: UserType;
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile | null;
  organization_profile?: OrganizationProfile | null;
}

export interface AuthResult {
  isAuthenticated: boolean;
  user?: User;
  error?: string;
}

/* ----------------------------- utilities ----------------------------- */

const DJANGO_BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

if (!DJANGO_BASE && typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  // Dev-only hint so it doesn’t spam server logs nor production
  console.warn("auth.ts: NEXT_PUBLIC_DJANGO_BASE_URL is missing");
}

export function redirectToLogin() {
  window.location.href = "/login";
}

export function saveSession(token: string, user: User) {
  try {
    localStorage.setItem("session_key", token);
    localStorage.setItem("user_data", JSON.stringify(user ?? {}));
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem("session_key");
    localStorage.removeItem("user_data");
  } catch {}
}

export function getToken(): string | null {
  try {
    const t = (typeof window !== "undefined" && localStorage.getItem("session_key")) || "";
    return t.trim() || null;
  } catch {
    return null;
  }
}

/* ------------------------------ core api ------------------------------ */

/**
 * Fetch the canonical user from the backend using the stored token.
 * If successful, also refreshes localStorage "user_data" to prevent stale roles.
 */
export async function checkAuth(): Promise<AuthResult> {
  try {
    if (!DJANGO_BASE) return { isAuthenticated: false, error: "Backend URL missing" };

    const token = getToken();
    if (!token) return { isAuthenticated: false, error: "No token" };

    const res = await fetch(`${DJANGO_BASE}/users/user/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Nice-to-have: auto sign-out on 401 to avoid stale sessions
        clearSession();
        return { isAuthenticated: false, error: "Unauthorized" };
      }
      return { isAuthenticated: false, error: `Fetch failed (${res.status})` };
    }

    const user = (await res.json()) as User;
    saveSession(token, user);
    return { isAuthenticated: true, user };
  } catch {
    return { isAuthenticated: false, error: "Auth error" };
  }
}

/**
 * Login helper:
 * - accepts identifier (email or username) + password
 * - hits Django /users/login/, stores token + user on success
 */
export async function login(
  identifier: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!DJANGO_BASE) return { ok: false, error: "Backend URL missing" };

    const res = await fetch(`${DJANGO_BASE}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: String(identifier).trim().toLowerCase(), password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.token) {
      const msg = data?.error || data?.detail || "Invalid credentials";
      return { ok: false, error: msg };
    }

    saveSession(data.token, data.user as User);
    return { ok: true };
  } catch {
    return { ok: false, error: "Login error" };
  }
}

export async function fetchMe(): Promise<User | null> {
  try {
    if (!DJANGO_BASE) return null;
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${DJANGO_BASE}/users/user/`, {
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearSession();
      }
      return null;
    }

    const user = (await res.json()) as User;
    saveSession(token, user);
    return user;
  } catch {
    return null;
  }
}

export function logout() {
  clearSession();
  redirectToLogin();
}

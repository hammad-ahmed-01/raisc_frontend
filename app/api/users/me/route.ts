// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

const textJson = (data: unknown, status = 200) =>
  new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const ensureAuthHeader = (req: NextRequest): string | null => {
  const raw = req.headers.get("authorization") || "";
  const val = raw.trim();
  if (!val) return null;
  return /^token\s+/i.test(val) ? val : `Token ${val}`;
};

/* ------------------------------- GET /api/users/me ------------------------------- */
/** Proxies to: GET <BASE>/users/user/ (current user detail) */
export async function GET(req: NextRequest) {
  try {
    if (!isBackendConnected) {
      // Demo payload when backend is not connected
      const demo = {
        id: 101,
        username: "demo_doctor",
        email: "demo@example.com",
        user_type: "doctor",
        date_joined: "2024-01-01T12:00:00Z",
        last_login: "2025-09-01T08:00:00Z",
        doctor_profile: {
          id: 1,
          professional_information: {
            display_name: "Dr. Demo Account",
            profile_image: "/doc.png",
            specialization: "Cognitive Therapy",
            location: "Lahore",
            education: "MSc Clinical Psychology – University of Demo (2020)",
            rating: 4.6,
            phone: "+92 300 1111111",
          },
          chatgroup_nickname: "",
          rates: null,
          organization_name: "Demo Organization", // Added for frontend
          patients_assigned: 23,
        },
        organization_profile: null,
      };
      return textJson(demo, 200);
    }

    if (!BASE) {
      return textJson({ detail: "Backend URL not configured" }, 500);
    }

    const auth = ensureAuthHeader(req);
    if (!auth) {
      return textJson({ detail: "Missing Authorization header" }, 401);
    }

    const upstream = await fetch(`${BASE}/users/user/`, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const bodyText = await upstream.text();

    // Pass through the exact status and body from Django
    return new NextResponse(bodyText || "{}", {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return textJson({ detail: "Internal server error" }, 500);
  }
}

/* ------------------------------ PATCH /api/users/me ----------------------------- */
/** Proxies to: PATCH <BASE>/users/profile/ (profile update) */
export async function PATCH(req: NextRequest) {
  try {
    if (!isBackendConnected) {
      const payload = await req.json().catch(() => ({}));
      return textJson({ success: true, demo: true, updated: payload }, 200);
    }

    if (!BASE) {
      return textJson({ detail: "Backend URL not configured" }, 500);
    }

    const auth = ensureAuthHeader(req);
    if (!auth) {
      return textJson({ detail: "Missing Authorization header" }, 401);
    }

    const payload = await req.text(); // Forward raw body
    const upstream = await fetch(`${BASE}/users/profile/`, {
      method: "PATCH",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: payload,
    });

    const bodyText = await upstream.text();

    return new NextResponse(bodyText || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PATCH /api/users/me error:", err);
    return textJson({ detail: "Internal server error" }, 500);
  }
}

/* ------------------------------ PUT /api/users/me ----------------------------- */
/** Optional: Treat PUT the same as PATCH */
export async function PUT(req: NextRequest) {
  return PATCH(req); // Reuse the PATCH logic
}
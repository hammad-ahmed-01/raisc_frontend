import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * This route provides a stable /api/users/me endpoint for the frontend.
 * - GET   -> proxies to  <DJANGO_BASE_URL>/users/user/     (current user detail)
 * - PATCH -> proxies to  <DJANGO_BASE_URL>/users/profile/  (unified profile update)
 *
 * It expects the client to send Authorization: Token <key>
 * (Bare token is also accepted; we normalize it.)
 */

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

const textJson = (data: unknown, status = 200) =>
  new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const ensureAuthHeader = (req: Request): string | null => {
  const raw = req.headers.get("authorization") || "";
  const val = raw.trim();
  if (!val) return null;
  return /^token\s+/i.test(val) ? val : `Token ${val}`;
};

/* ------------------------------- GET /api/users/me ------------------------------- */
/** Proxies to: GET <BASE>/users/user/ */
export async function GET(req: Request) {
  try {
    if (!isBackendConnected) {
      // Demo payload (keep minimal)
      const demo = {
        id: 101,
        username: "demo_doctor",
        email: "demo@example.com",
        user_type: "doctor",
        date_joined: "2024-01-01T12:00:00Z",
        last_login: "2025-09-01T08:00:00Z",
        doctor_profile: {
          professional_information: {
            display_name: "Dr. Demo Account",
            profile_image: "/doc.png",
            specialization: "Cognitive Therapy",
            location: "Lahore",
            education: "MSc Clinical Psychology – University of Demo (2020)",
            rating: 4.6,
            phone: "+92 300 1111111",
          },
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
      headers: { Authorization: auth, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const bodyText = await upstream.text();
    // Pass through upstream status & body to make debugging easier
    return new NextResponse(bodyText || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return textJson({ detail: "Internal server error" }, 500);
  }
}

/* ------------------------------ PATCH /api/users/me ----------------------------- */
/** Proxies to: PATCH <BASE>/users/profile/ (your MeProfileUpdateView) */
export async function PATCH(req: Request) {
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

    const payload = await req.text(); // forward raw body
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

/* (Optional) Support PUT -> PATCH the same backend endpoint */
export async function PUT(req: Request) {
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

    const payload = await req.text();
    const upstream = await fetch(`${BASE}/users/profile/`, {
      method: "PUT",
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
    console.error("PUT /api/users/me error:", err);
    return textJson({ detail: "Internal server error" }, 500);
  }
}

import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "");
    if (!base) {
      return NextResponse.json(
        { message: "Backend base URL not configured." },
        { status: 500 }
      );
    }

    // 1️⃣ LOGIN REQUEST
    const loginRes = await fetch(`${base}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: String(username).trim().toLowerCase(),
        password,
      }),
    });

    const loginData = await loginRes.json().catch(() => ({}));

    if (!loginRes.ok) {
      const msg =
        loginData?.message || loginData?.detail || loginData?.error || "Invalid credentials.";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    const token = loginData?.token;
    if (!token) {
      return NextResponse.json(
        { message: "Token missing in login response." },
        { status: 502 }
      );
    }

    // 2️⃣ FETCH USER PROFILE
    const meRes = await fetch(`${base}/users/user/`, {
      method: "GET",
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    });

    const user = await meRes.json().catch(() => null);
    if (!meRes.ok || !user) {
      return NextResponse.json(
        { message: "Could not fetch user details." },
        { status: 502 }
      );
    }

    // 3️⃣ Handle Organization Profile (fetch if missing)
    if (user.user_type === "organization" && !user.organization_profile) {
      try {
        const orgRes = await fetch(`${base}/organization/organization_details`, {
          method: "GET",
          headers: { Authorization: `Token ${token}` },
        });
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          user.organization_profile = orgData;
        }
      } catch (err) {
        console.warn("Failed to fetch organization profile:", err);
      }
    }

    // ✅ Final unified response
    return NextResponse.json({ token, user }, { status: 200 });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

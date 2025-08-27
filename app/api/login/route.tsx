import { NextResponse } from "next/server";

export const runtime = "edge"; // OK on Vercel

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
    if (!base) {
      return NextResponse.json(
        { message: "Backend base URL is not configured." },
        { status: 500 }
      );
    }

    // 1) Login (Django accepts username OR email in `username`)
    const res = await fetch(`${base}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data?.message || data?.detail || data?.error || "Invalid credentials.";
      return NextResponse.json({ message: String(msg) }, { status: res.status });
    }

    const token = data?.token;
    if (!token) {
      return NextResponse.json(
        { message: "Login response malformed. Please try again." },
        { status: 502 }
      );
    }

    // 2) Enforce patient level 0 on every login (best-effort)
    await fetch(`${base}/users/user/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        user_type: "patient",
        patient_profile: { level: 0 },
      }),
    }).catch(() => {});

    // 3) Fetch fresh user after patch (so UI gets the right level/type)
    const meRes = await fetch(`${base}/users/user/`, {
      method: "GET",
      headers: { Authorization: `Token ${token}` },
    });
    const me = await meRes.json().catch(() => ({}));
    // Fallback to original user if GET fails
    const user = meRes.ok ? me : data?.user;

    if (!user) {
      return NextResponse.json(
        { message: "Could not retrieve user profile." },
        { status: 502 }
      );
    }

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

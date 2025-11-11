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

    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
    if (!base) {
      return NextResponse.json(
        { message: "Backend base URL is not configured." },
        { status: 500 }
      );
    }

    // 1) Login (Django accepts username OR email in `username`)
    const res = await fetch(`${base.replace(/\/+$/, "")}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: String(username).trim().toLowerCase(),
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || data?.detail || data?.error || "Invalid credentials.";
      return NextResponse.json({ message: String(msg) }, { status: res.status });
    }

    const token = data?.token;
    if (!token) {
      return NextResponse.json(
        { message: "Login response malformed. Please try again." },
        { status: 502 }
      );
    }

    // 2) DO NOT mutate role here. Just fetch the canonical user.
    const meRes = await fetch(`${base.replace(/\/+$/, "")}/users/user/`, {
      method: "GET",
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    });

    const user = (await meRes.json().catch(() => null)) || data?.user;
    if (!meRes.ok || !user) {
      return NextResponse.json(
        { message: "Could not retrieve user profile." },
        { status: 502 }
      );
    }

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

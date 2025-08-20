import { NextResponse } from "next/server";

export const runtime = "edge"; // OK on Vercel

const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

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

    // Call Django login (it accepts username OR email in `username`)
    const res = await fetch(`${base}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // Try to parse JSON (even on error status)
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.message || data?.detail || data?.error || "Invalid credentials.";
      return NextResponse.json({ message: String(msg) }, { status: res.status });
    }

    // Defensive checks: require both token and user
    const token = data?.token;
    const user = data?.user;
    if (!token || !user) {
      return NextResponse.json(
        { message: "Login response malformed. Please try again." },
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

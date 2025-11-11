import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization")?.replace("Token ", "");
    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "");

    if (!base) {
      return NextResponse.json(
        { message: "Backend base URL not configured." },
        { status: 500 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { message: "Missing authentication token." },
        { status: 401 }
      );
    }
    console.log(base);
    const res = await fetch(`${base}/organization/register_doctor/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Organization register doctor error:", data);
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Register Doctor API Error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

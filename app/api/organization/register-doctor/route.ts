import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

// POST – Register new doctor
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization") || `Token ${localStorage?.getItem("session_key")}`;

    const res = await fetch(`${BASE_URL}/organization/register_doctor/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error registering doctor:", error);
    return NextResponse.json({ error: "Failed to register doctor" }, { status: 500 });
  }
}

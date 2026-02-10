import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization") || `Token ${localStorage?.getItem("session_key")}`;
    const res = await fetch(`${BASE_URL}/organization/view_doctor_calendar/`, {
      headers: { Authorization: token },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching doctor calendar:", error);
    return NextResponse.json({ error: "Failed to fetch doctor calendar" }, { status: 500 });
  }
}

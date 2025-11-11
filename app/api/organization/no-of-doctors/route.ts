import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization") || `Token ${localStorage?.getItem("session_key")}`;
    const res = await fetch(`${BASE_URL}/organization/no_of_doctors/`, {
      headers: { Authorization: token },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching doctor count:", error);
    return NextResponse.json({ error: "Failed to fetch doctor count" }, { status: 500 });
  }
}

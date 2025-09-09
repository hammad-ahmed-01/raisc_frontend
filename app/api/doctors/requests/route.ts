import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "");

// GET: fetch pending doctor requests
export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Token ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BASE}/users/doctor/requests/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// PATCH: approve/reject doctor request
export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Token ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const res = await fetch(`${BASE}/users/doctor/manage-request/${requestId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update request" },
      { status: 500 }
    );
  }
}

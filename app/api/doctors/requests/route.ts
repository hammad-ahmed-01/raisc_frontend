import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "");

/** Normalize any incoming "status" to what Django expects */
function mapToBackendStatus(input: string) {
  const v = (input || "").toLowerCase().trim();
  if (v === "accept" || v === "accepted" || v === "approve" || v === "approved") {
    return "accepted";
  }
  if (v === "reject" || v === "rejected" || v === "request_again") {
    return "request_again";
  }
  return ""; // invalid
}

// GET: fetch pending doctor requests
export async function GET(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_DJANGO_BASE_URL" }, { status: 500 });
    }

    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BASE}/users/doctor/requests/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// PATCH: approve/reject doctor request
export async function PATCH(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_DJANGO_BASE_URL" }, { status: 500 });
    }

    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestId = body?.requestId;
    const backendStatus = mapToBackendStatus(body?.status);

    if (!requestId || !backendStatus) {
      return NextResponse.json(
        { error: "Invalid payload. Provide { requestId, status: 'accept' | 'reject' }" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/users/doctor/manage-request/${requestId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({ status: backendStatus }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update request" },
      { status: 500 }
    );
  }
}

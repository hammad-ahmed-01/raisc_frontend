import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

const BASE =
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL?.replace(/\/+$/, "") ||
  process.env.DJANGO_BASE_URL?.replace(/\/+$/, "") ||
  "";

function flipScheme(auth: string) {
  const s = auth.toLowerCase();
  if (s.startsWith("bearer ")) return "Token " + auth.slice(7);
  if (s.startsWith("token ")) return "Bearer " + auth.slice(6);
  if (s.startsWith("jwt ")) return "Bearer " + auth.slice(4);
  return auth;
}

export async function GET(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json({ detail: "Backend URL not configured" }, { status: 500 });
    }

    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json(
        { detail: "Authentication credentials were not provided." },
        { status: 401 }
      );
    }

    // Patient sees ALL statuses
    const url = `${BASE}/users/doctor/patient/requests/`;

    let upstream = await fetch(url, {
      headers: { "Content-Type": "application/json", Authorization: auth },
      cache: "no-store",
    });

    if (upstream.status === 401) {
      upstream = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: flipScheme(auth) },
        cache: "no-store",
      });
    }

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        { detail: `Upstream error ${upstream.status}`, body: text },
        { status: upstream.status }
      );
    }

    let data: any = [];
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to fetch patient requests" },
      { status: 500 }
    );
  }
}

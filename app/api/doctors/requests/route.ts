import { NextResponse, NextRequest } from "next/server";

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

function extractAuth(req: Request | NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (h && h.trim()) return h;

  const h2 = req.headers.get("x-authorization");
  if (h2 && h2.trim()) return h2;

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMap = new Map<string, string>();
  cookieHeader.split(";").forEach((p) => {
    const [k, ...rest] = p.split("=");
    if (!k) return;
    cookieMap.set(k.trim(), decodeURIComponent((rest.join("=") || "").trim()));
  });
  for (const k of ["session_key", "access_token", "token", "authToken", "jwt", "id_token"]) {
    const v = cookieMap.get(k);
    if (v) return `${v.includes(".") ? "Bearer" : "Token"} ${v}`;
  }
  return null;
}

// Doctor GET (pending-only list)
export async function GET(req: Request) {
  try {
    if (!BASE) return NextResponse.json({ detail: "Backend URL not configured" }, { status: 500 });
    const auth = extractAuth(req);
    if (!auth) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

    const url = `${BASE}/users/doctor/requests/`;
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
    let json: any = [];
    try {
      json = JSON.parse(text);
    } catch {
      json = [];
    }
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// Doctor PATCH (accept/reject)
export async function PATCH(req: Request) {
  try {
    if (!BASE) return NextResponse.json({ error: "Missing NEXT_PUBLIC_DJANGO_BASE_URL" }, { status: 500 });
    const auth = extractAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const raw = await req.text();
    let body: any = {};
    try { body = JSON.parse(raw || "{}"); } catch { body = {}; }

    const requestId =
      body?.requestId ?? body?.id ?? body?.pk ?? body?.request_id ?? body?.requestID;
    const rawStatus =
      body?.status ?? body?.action ?? body?.decision ?? body?.state ?? body?.choice ?? "";

    const s = String(rawStatus || "").toLowerCase().trim();
    const acceptSyn = new Set(["accept", "accepted", "approve", "approved", "yes"]);
    const rejectSyn = new Set([
      "reject",
      "rejected",
      "decline",
      "declined",
      "deny",
      "denied",
      "cancel",
      "cancelled",
      "request_again",
      "no",
    ]);

    let mapped: "accepted" | "request_again" | "" = "";
    if (acceptSyn.has(s)) mapped = "accepted";
    if (rejectSyn.has(s)) mapped = "request_again";

    if (!requestId || !mapped) {
      return NextResponse.json(
        { error: "Invalid payload. Provide id and status/action of 'accepted' or 'reject'." },
        { status: 400 }
      );
    }

    const url = `${BASE}/users/doctor/manage-request/${encodeURIComponent(String(requestId))}/`;
    let upstream = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({ status: mapped }),
    });

    if (upstream.status === 401) {
      upstream = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: flipScheme(auth) },
        body: JSON.stringify({ status: mapped }),
      });
    }

    const text = await upstream.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { detail: text || "" }; }

    return NextResponse.json(json, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update request" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  let auth = req.headers.get("authorization") || req.headers.get("x-raisc-auth") || "";
  if (auth) return auth;

  const cookieNames = ["session_key", "token", "auth_token", "access_token"];
  for (const name of cookieNames) {
    const val = req.cookies.get(name)?.value;
    if (val) {
      if (/^token\s+/i.test(val) || /^bearer\s+/i.test(val)) return val;
      return `Token ${val}`;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const q = req.nextUrl.searchParams.get("auth");
    if (q) return /^token\s+/i.test(q) || /^bearer\s+/i.test(q) ? q : `Token ${q}`;
  }
  return "";
}

export async function GET(req: NextRequest) {
  try {
    const rawBase = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || process.env.DJANGO_BASE_URL || "";
    const base = rawBase.replace(/\/+$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "Missing Django base URL (NEXT_PUBLIC_DJANGO_BASE_URL)" },
        { status: 500 }
      );
    }

    const auth = getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const upstream = await fetch(`${base}/users/doctor/psychologist/current/`, {
      method: "GET",
      headers: { Authorization: auth },
      cache: "no-store",
    });

    const text = await upstream.text();
    try {
      const json = text ? JSON.parse(text) : {};
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      return new NextResponse(text || "", {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

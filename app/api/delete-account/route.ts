// app/api/delete-account/route.ts
import { NextResponse } from "next/server";

const DJANGO_BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

export async function DELETE(req: Request) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const isToken = /^token\s+/i.test(auth);
    if (!auth || !isToken) {
      return NextResponse.json(
        { detail: "Missing or invalid Authorization header. Expected: Token <key>" },
        { status: 401 }
      );
    }

    // Pass through any JSON body (e.g., optional refresh token for blacklist)
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      // no body provided
    }

    const resp = await fetch(`${DJANGO_BASE}/users/account/delete/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth, // forward "Token <key>"
      },
      body: body ? JSON.stringify(body) : null,
    });

    const text = await resp.text();
    // Try to parse JSON; fall back to text
    const data = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return { detail: text || "Unknown response" };
      }
    })();

    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json(
      { detail: e?.message || "Server error while deleting account." },
      { status: 500 }
    );
  }
}

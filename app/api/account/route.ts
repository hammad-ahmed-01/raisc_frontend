// app/api/account/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.RAISC_API_BASE ||
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL ||
  "http://127.0.0.1:8000";

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";

    const upstream = await fetch(`${API_BASE.replace(/\/+$/, "")}/users/account/delete/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({}), // no refresh token needed
    });

    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      return new NextResponse(text, { status: upstream.status });
    }
  } catch (e: any) {
    return NextResponse.json({ detail: e?.message || "Proxy error" }, { status: 500 });
  }
}

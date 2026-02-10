// app/api/doctors/delete-session/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rawBase =
      process.env.NEXT_PUBLIC_DJANGO_BASE_URL ||
      process.env.DJANGO_BASE_URL ||
      "";
    const base = rawBase.replace(/\/+$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "Missing Django base URL (NEXT_PUBLIC_DJANGO_BASE_URL)" },
        { status: 500 }
      );
    }

    // auth from header or cookie (same as your other proxies)
    let auth = req.headers.get("authorization") || "";
    if (!auth) {
      const sessionKey = req.cookies.get("session_key")?.value;
      if (sessionKey) auth = `Token ${sessionKey}`;
    }
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const upstream = await fetch(`${base}/users/doctor/delete-session/${id}/`, {
      method: "DELETE",
      headers: { Authorization: auth },
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
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

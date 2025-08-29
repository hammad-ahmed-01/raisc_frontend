// app/api/chat/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function join(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function POST(req: NextRequest) {
  const BASE = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL;
  if (!BASE) {
    return new Response(JSON.stringify({ message: "FASTAPI base URL missing" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: { session_key?: string | null; message?: string };
  try { payload = await req.json(); }
  catch { return new Response(JSON.stringify({ message: "Invalid JSON body." }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const { session_key, message } = payload || {};
  if (!message || !message.trim()) {
    return new Response(JSON.stringify({ message: "Message is required." }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = join(BASE, "/api/chat");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session_key ? { session_key, message } : { message }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch {
    clearTimeout(timer);
    return new Response(JSON.stringify({ message: "Upstream error." }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
}

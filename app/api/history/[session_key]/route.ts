// app/api/history/[session_key]/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function join(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

// 👇 In Next 15+, ctx.params is a Promise
type Ctx = { params: Promise<{ session_key?: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { session_key } = await ctx.params; // ✅ await

  if (!session_key) {
    return new Response(JSON.stringify({ message: "session_key is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const BASE = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL;
  if (!BASE) {
    // Graceful fallback: empty history
    return new Response(JSON.stringify({ chat_history: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = join(BASE, `/api/history/${encodeURIComponent(session_key)}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(upstream, { method: "GET", signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
      });
    }

    // Upstream error → return empty history, keep UI happy
    return new Response(JSON.stringify({ chat_history: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    clearTimeout(timer);
    return new Response(JSON.stringify({ chat_history: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

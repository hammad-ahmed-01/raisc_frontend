export function joinUrl(base: string, ...parts: string[]) {
  const root = base.replace(/\/+$/, "");
  const tail = parts.map(p => p.replace(/^\/+|\/+$/g, "")).join("/");
  return `${root}/${tail}/`;
}

export async function proxyJson(
  url: string,
  init: RequestInit & { bodyObj?: any } = {}
) {
  const { bodyObj, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers || {}),
    },
    body: bodyObj !== undefined ? JSON.stringify(bodyObj) : rest.body,
  });

  const text = await res.text();
  const json = (() => { try { return JSON.parse(text); } catch { return null; }})();

  return { res, body: json ?? text };
}

export function getUsersBase() {
  const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_DJANGO_BASE_URL is not set");
  return base;
}

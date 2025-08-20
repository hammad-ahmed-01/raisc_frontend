export function forwardAuthHeader(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  return auth ? { Authorization: auth } : {};
}

/**
 * Best-effort client IP from the proxy headers the host sets.
 *
 * `x-forwarded-for` is a comma-separated chain; the first entry is the original
 * client and the rest are proxies. It is spoofable, so it is used for rate
 * limiting and coarse attribution only — never for authorisation or identity.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  if (first) return first;

  // Vercel and Cloudflare respectively, when x-forwarded-for is absent.
  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
}

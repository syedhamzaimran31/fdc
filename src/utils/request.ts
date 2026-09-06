/** Spoofable, so this is for rate limiting only — never for authorisation. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  if (first) return first;

  // Vercel and Cloudflare respectively, when x-forwarded-for is absent.
  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
}

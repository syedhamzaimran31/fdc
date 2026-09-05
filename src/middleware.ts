import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on the edge before every matched request.
 *
 * Two jobs, both of which belong here rather than in the route handler:
 *
 * 1. Security headers on every response. Setting them in one place means a new
 *    route cannot accidentally ship without them.
 * 2. Passing the caller's IP down to the API route as a header. Route handlers
 *    have no direct access to the socket address on most hosts, and the route
 *    needs it to rate-limit.
 *
 * Deliberately not here: rate limiting itself and authentication. Middleware
 * runs on the edge runtime with no database access, so anything needing Prisma
 * has to live in the route.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export function middleware(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);

  // x-forwarded-for is set by the host's proxy. The first entry is the client;
  // the rest are proxies. Untrusted in principle, but it is the only signal
  // available, and it is used for rate limiting only — never for authorisation.
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
  requestHeaders.set("x-client-ip", clientIp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }

  return response;
}

export const config = {
  // Everything except Next's own assets and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

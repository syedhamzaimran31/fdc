import type { NextConfig } from "next";

/**
 * Security headers are declared here rather than in middleware.
 *
 * They are static, so they do not need a per-request function: `headers()` is
 * applied by the server without running any user code, which is cheaper and is
 * one less runtime to go wrong. It also avoids Next 15.5's edge middleware,
 * which throws `EvalError: Code generation from strings disallowed` under
 * `next start` on Node 24 and 500s every request — a failure that does not
 * appear in `next dev`.
 *
 * The one other thing middleware was doing — handing the caller's IP to the
 * API route — the route now reads from `x-forwarded-for` itself.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * Headers live here rather than in middleware. They are static, so they need no
 * per-request code — and Next 15.5 edge middleware throws
 * `EvalError: Code generation from strings disallowed` under `next start` on
 * Node 24, 500-ing every request. That does not reproduce in `next dev`.
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

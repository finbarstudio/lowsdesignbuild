import type { NextConfig } from "next";

// Baseline security response headers applied to every route. (No CSP yet — the
// embedded Sanity Studio needs 'unsafe-eval'/'unsafe-inline', so a meaningful
// policy needs dedicated testing; tracked as a follow-up.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this app (a stray lockfile in the home dir was
  // confusing Next's auto-detection).
  turbopack: { root: import.meta.dirname },
  images: {
    // Allow next/image to load optimised images from the Sanity CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

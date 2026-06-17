import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app (a stray lockfile in the home dir was
  // confusing Next's auto-detection).
  turbopack: { root: import.meta.dirname },
  images: {
    // Allow next/image to load optimised images from the Sanity CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;

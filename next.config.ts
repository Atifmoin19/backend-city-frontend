import type { NextConfig } from "next";

// Backend origin used by the /api/* rewrite (server-side only; never exposed to the browser).
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    // Same-origin API: cookies stay first-party and no CORS is needed (ideology §13.2).
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;

import { NextResponse, type NextRequest } from "next/server";

/**
 * Every API call reaches the backend through Vercel, so the backend sees Vercel's IP. Stamp
 * the learner's real IP (Vercel sets x-real-ip / x-forwarded-for and overwrites client
 * values) plus a shared secret, so the backend can trust it for rate limits. Headers a
 * client sends with these names are always replaced.
 */
const SECRET = process.env.PROXY_SHARED_SECRET?.trim();

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("x-bc-client-ip");
  headers.delete("x-bc-proxy-secret");
  const ip =
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0];
  if (SECRET && ip) {
    headers.set("x-bc-client-ip", ip.trim());
    headers.set("x-bc-proxy-secret", SECRET);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/api/:path*" };

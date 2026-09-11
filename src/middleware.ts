import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Edge-only production gate for the refresh helper. Headers/CSP stay in next.config.ts. */
export function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_REFRESH_API !== "1" &&
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    return NextResponse.json(
      { ok: false, error: "Refresh API disabled in production" },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/refresh"],
};

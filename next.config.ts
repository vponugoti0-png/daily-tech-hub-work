import type { NextConfig } from "next";
import lessonRedirects from "./lesson-redirects.json";
import { HTML_DOCUMENT_CACHE_CONTROL } from "./http-cache";

const isDev = process.env.NODE_ENV !== "production";

function originFromUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * Browser origins Auth.js may send the user to (see src/auth.ts).
 * Token exchange is server-side and is not governed by CSP.
 * Google / Microsoft Entra / X are the providers actually wired.
 */
const oauthBrowserOrigins = new Set<string>([
  "https://accounts.google.com",
  "https://login.microsoftonline.com",
  "https://login.microsoft.com",
  "https://login.live.com",
  "https://twitter.com",
  "https://x.com",
  "https://api.twitter.com",
  "https://api.x.com",
]);

const entraIssuerOrigin = originFromUrl(process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER);
if (entraIssuerOrigin) oauthBrowserOrigins.add(entraIssuerOrigin);

const oauthOriginList = [...oauthBrowserOrigins].join(" ");

// 'unsafe-inline' stays: Next.js App Router hydration + the theme FOUC script in
// layout.tsx. A nonce/proxy.ts CSP would force dynamic rendering of every page.
// 'unsafe-eval' is only for next/react dev (HMR / stack reconstruction).
// wasm-unsafe-eval: DuckDB-WASM + Pyodide compile for local practice labs.
// Safer than widening script-src with full unsafe-eval in production.
// Python assets are copied to /public/pyodide (same-origin). No CDN host is
// required. If Security later prefers jsDelivr, add https://cdn.jsdelivr.net
// to script-src and connect-src — see the practice PR body.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'"
  : "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'";

const connectSrc = isDev
  ? `connect-src 'self' ${oauthOriginList} ws: wss:`
  : `connect-src 'self' ${oauthOriginList}`;

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  // No remote <img> / next/image hosts in this app; data:/blob: cover theme + R3F.
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  connectSrc,
  `form-action 'self' ${oauthOriginList}`,
  // OAuth is top-level redirect (next-auth signIn → location.assign), not iframes.
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'none'",
  "script-src-attr 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: csp,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@duckdb/duckdb-wasm"],
  serverExternalPackages: ["better-sqlite3"],
  devIndicators: false,
  // Cap Next.js ISR stale-while-revalidate if its own Cache-Control wins
  // (`s-maxage={revalidate}, stale-while-revalidate={expireTime - revalidate}`).
  expireTime: 120,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Documents + RSC. Do not match /_next/static — Next.js already
        // sends `public, max-age=31536000, immutable` for hashed assets.
        source: "/((?!_next/static|_next/image).*)",
        headers: [{ key: "Cache-Control", value: HTML_DOCUMENT_CACHE_CONTROL }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/training/prompt-engineering/ask-better-questions",
        destination: "/training/prompt-engineering/pe-ask-better-questions",
        permanent: true,
      },
      ...lessonRedirects,
    ];
  },
};

export default nextConfig;

import crypto from "crypto";
import { cookies } from "next/headers";

export const CSRF_COOKIE = "dth_csrf";
export const CSRF_HEADER = "x-csrf-token";

/** Origins allowed to call mutating auth APIs (localhost + public preview). */
function trustedOrigins(): Set<string> {
  const out = new Set<string>();
  const raw = process.env.AUTH_TRUSTED_ORIGINS || "";
  for (const part of raw.split(",")) {
    const s = part.trim();
    if (!s) continue;
    try {
      out.add(new URL(s).origin);
    } catch {
      /* skip bad entry */
    }
  }
  // Always include AUTH_URL / NEXTAUTH_URL if set
  for (const key of ["AUTH_URL", "NEXTAUTH_URL"] as const) {
    const v = process.env[key];
    if (!v) continue;
    try {
      out.add(new URL(v).origin);
    } catch {
      /* skip */
    }
  }
  // Dev fallback when nothing configured
  if (out.size === 0 && process.env.NODE_ENV !== "production") {
    out.add("http://localhost:3000");
    out.add("http://127.0.0.1:3000");
  }
  return out;
}

function isTrustedOrigin(origin: string): boolean {
  try {
    return trustedOrigins().has(new URL(origin).origin);
  } catch {
    return false;
  }
}

/** Issue / refresh a double-submit CSRF cookie (readable by JS). */
export async function ensureCsrfCookie(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;
  if (existing && existing.length >= 32) return existing;
  const token = crypto.randomBytes(32).toString("base64url");
  jar.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return token;
}

function isSameSiteFetch(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  return site === "same-origin" || site === "same-site";
}

/** Origin / Referer / Sec-Fetch-Site gate (token check happens separately). */
export function evaluateCsrfOrigin(
  req: Request,
  isProduction = process.env.NODE_ENV === "production",
): { ok: true } | { ok: false } {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    return isTrustedOrigin(origin) ? { ok: true } : { ok: false };
  }
  if (referer) {
    try {
      return isTrustedOrigin(new URL(referer).origin) ? { ok: true } : { ok: false };
    } catch {
      return { ok: false };
    }
  }
  if (isProduction && !isSameSiteFetch(req)) {
    return { ok: false };
  }
  return { ok: true };
}

/**
 * Validate Origin/Referer + double-submit CSRF header.
 * Accepts any origin listed in AUTH_TRUSTED_ORIGINS (and AUTH_URL if set).
 *
 * Production fail-closed: if both Origin and Referer are missing, require a
 * browser Sec-Fetch-Site of same-origin/same-site. Typical same-site fetch()
 * and form POSTs still send Origin, so this does not block legitimate UI flows.
 */
export async function assertCsrf(req: Request): Promise<
  { ok: true } | { ok: false; status: number; error: string }
> {
  const originGate = evaluateCsrfOrigin(req);
  if (!originGate.ok) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  const jar = await cookies();
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return { ok: false, status: 403, error: "Invalid CSRF token" };
  }
  return { ok: true };
}

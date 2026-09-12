const BLOCKED_PREFIXES = ["/login", "/signup", "/api/", "/_next/"];

/**
 * Same-origin relative path for post-auth redirects.
 * Rejects protocol-relative URLs, backslashes, and auth/api loops.
 */
export function safeCallbackPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return fallback;
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  if (BLOCKED_PREFIXES.some((p) => path === p || path.startsWith(p))) {
    return fallback;
  }
  return path;
}

export function loginHref(callbackPath?: string | null): string {
  const next = safeCallbackPath(callbackPath, "");
  if (!next) return "/login";
  return `/login?callbackUrl=${encodeURIComponent(next)}`;
}

export function signupHref(callbackPath?: string | null): string {
  const next = safeCallbackPath(callbackPath, "");
  if (!next) return "/signup";
  return `/signup?callbackUrl=${encodeURIComponent(next)}`;
}

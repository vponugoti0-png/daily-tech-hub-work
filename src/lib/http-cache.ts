/** Shared-cache (CDN / `s-maxage`) policy. Do not confuse with HSTS `max-age`.
 *  next.config.ts inlines HTML_DOCUMENT_CACHE_CONTROL — do not import this
 *  module from next.config.ts (Docker runner does not COPY src/). */

export const YEAR_SECONDS = 31_536_000;

/**
 * HTML + RSC documents for this frequently updated training app.
 * Railway hikari honors `s-maxage`; Next.js static pages default to 1 year.
 */
export const HTML_DOCUMENT_CACHE_CONTROL =
  "s-maxage=0, stale-while-revalidate=60";

/** Content-hashed `/_next/static` files are immutable. */
export const STATIC_ASSET_CACHE_CONTROL = `public, max-age=${YEAR_SECONDS}, immutable`;

/** True when a Cache-Control value tells shared caches to keep the response for a year. */
export function hasYearLongSharedCache(
  cacheControl: string | null | undefined,
): boolean {
  if (!cacheControl) return false;
  return /(?:^|,)\s*s-maxage=31536000(?:\s|,|$)/i.test(cacheControl);
}

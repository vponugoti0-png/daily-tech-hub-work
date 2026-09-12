import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("next.config overrides HTML Cache-Control and keeps hashed static assets cacheable", () => {
  const src = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.match(src, /HTML_DOCUMENT_CACHE_CONTROL/);
  assert.match(src, /STATIC_ASSET_CACHE_CONTROL/);
  assert.match(src, /\/_next\/static\/:path\*/);
  assert.match(src, /expireTime:\s*120/);
  assert.doesNotMatch(
    src,
    /source:\s*"\/:path\*"[\s\S]{0,200}s-maxage=31536000/,
    "must not set year-long s-maxage on the catch-all document source",
  );
});

test("root layout sets ISR revalidate so Next.js does not default to 1-year s-maxage", () => {
  const src = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
  assert.match(src, /export const revalidate = 60/);
});

test("http-cache policy is short for documents and long only for hashed assets", () => {
  const src = readFileSync(join(root, "src/lib/http-cache.ts"), "utf8");
  assert.match(src, /s-maxage=0, stale-while-revalidate=60/);
  assert.match(src, /max-age=\$\{YEAR_SECONDS\}, immutable/);
});

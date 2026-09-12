import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("next.config overrides HTML Cache-Control without touching hashed /_next/static", () => {
  const src = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.match(src, /HTML_DOCUMENT_CACHE_CONTROL/);
  assert.match(src, /expireTime:\s*120/);
  assert.match(src, /\/\(\(\?!_next\/static\|_next\/image\)\.\*\)/);
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
  const src = readFileSync(join(root, "http-cache.ts"), "utf8");
  assert.match(src, /s-maxage=0, stale-while-revalidate=60/);
  assert.match(src, /max-age=\$\{YEAR_SECONDS\}, immutable/);
});

test("next.config imports cache policy from the Docker runner root file", () => {
  const src = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.match(src, /from ["']\.\/http-cache["']/);
  assert.doesNotMatch(src, /from ["']\.\/src\/lib\/http-cache["']/);
});

test("Dockerfile runner copies http-cache.ts next to next.config.ts", () => {
  const src = readFileSync(join(root, "Dockerfile"), "utf8");
  assert.match(src, /COPY --from=builder \/app\/http-cache\.ts \.\/http-cache\.ts/);
  assert.match(src, /COPY --from=builder \/app\/next\.config\.ts \.\/next\.config\.ts/);
});

#!/usr/bin/env node
/**
 * Copy DuckDB-WASM worker + wasm assets into public/duckdb so the lab
 * stays same-origin (CSP connect-src/worker-src 'self').
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "public", "duckdb");

let dist;
try {
  // package.json is not in "exports"; resolve the published entry then use sibling dist files.
  dist = path.dirname(require.resolve("@duckdb/duckdb-wasm"));
} catch {
  console.warn("copy-duckdb-wasm: @duckdb/duckdb-wasm not installed; skip.");
  process.exit(0);
}
const files = [
  "duckdb-mvp.wasm",
  "duckdb-eh.wasm",
  "duckdb-browser-mvp.worker.js",
  "duckdb-browser-eh.worker.js",
  "duckdb-browser-mvp.pthread.worker.js",
  "duckdb-browser-eh.pthread.worker.js",
];

fs.mkdirSync(dest, { recursive: true });
let copied = 0;
for (const file of files) {
  const from = path.join(dist, file);
  if (!fs.existsSync(from)) continue;
  fs.copyFileSync(from, path.join(dest, file));
  copied += 1;
}

if (copied < 4) {
  console.error(`copy-duckdb-wasm: expected wasm+worker files in ${dist}, copied ${copied}`);
  process.exit(1);
}

console.log(`✓ copied ${copied} DuckDB-WASM assets → public/duckdb`);

#!/usr/bin/env node
/**
 * Copy Pyodide core assets into public/pyodide so the Python lab
 * stays same-origin (CSP connect-src/worker-src 'self'). Stdlib only —
 * no micropip, no CDN wheels.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "public", "pyodide");

let dist;
try {
  dist = path.dirname(require.resolve("pyodide"));
} catch {
  console.warn("copy-pyodide: pyodide not installed; skip.");
  process.exit(0);
}

const files = [
  "pyodide.mjs",
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
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
  console.error(`copy-pyodide: expected core files in ${dist}, copied ${copied}`);
  process.exit(1);
}

console.log(`✓ copied ${copied} Pyodide assets → public/pyodide`);

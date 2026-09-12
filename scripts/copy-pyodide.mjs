#!/usr/bin/env node
/**
 * Copy Pyodide core assets into public/pyodide so the Python lab
 * stays same-origin (CSP connect-src/script-src/worker-src 'self').
 * Does not copy optional wheels (numpy/pandas/…) — stdlib samples only.
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
  dist = path.dirname(require.resolve("pyodide/package.json"));
} catch {
  console.warn("copy-pyodide: pyodide not installed; skip.");
  process.exit(0);
}

const required = ["pyodide.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const optional = ["pyodide.mjs", "pyodide.asm.js", "python_stdlib_legacy.zip"];

fs.mkdirSync(dest, { recursive: true });
let copied = 0;
for (const file of [...required, ...optional]) {
  const from = path.join(dist, file);
  if (!fs.existsSync(from)) {
    if (required.includes(file)) continue;
    continue;
  }
  fs.copyFileSync(from, path.join(dest, file));
  copied += 1;
}

const missing = required.filter((file) => !fs.existsSync(path.join(dest, file)));
if (missing.length) {
  console.error(`copy-pyodide: missing ${missing.join(", ")} from ${dist}`);
  process.exit(1);
}

console.log(`✓ copied ${copied} Pyodide assets → public/pyodide`);

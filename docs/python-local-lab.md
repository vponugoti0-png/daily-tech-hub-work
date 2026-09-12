# Python local practice lab

**Audience:** Frontend, Security, QA  
**Status:** Local (Pyodide) lab — not a cloud kernel

In-browser Python on training lessons. Honest chrome: **Local practice lab**. Guest progress writes `stepIndex` after a successful Run (does not complete the lesson).

## Runtime

- Engine: Pyodide, loaded from **same-origin** `/public/pyodide/` (`scripts/copy-pyodide.mjs`).
- Stdlib only (`csv`, `json`, `pathlib`, `datetime`, `logging`, `typing`). **No pandas / Spark / micropip.**
- Guard: no shell, no network modules, no JS bridge (`src/lib/lab/python-guard.ts`). `js` / `pyodide*` popped from `sys.modules` on init.
- Practice files: CSV/JSON under `/data/…` in the Pyodide VFS (`src/lib/lab/python-vfs.ts`). Re-seeded before each Run. Editor tabs: `main.py` + lesson data files.

## CSP (prefer unchanged)

`next.config.ts` already allows the lab without a CDN:

| Directive | Why it is enough |
|-----------|------------------|
| `script-src 'self' … 'wasm-unsafe-eval'` | `pyodide.js` + WASM compile (same as DuckDB-WASM) |
| `connect-src 'self'` | Fetches `/pyodide/pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json` |
| `worker-src 'self' blob:` | Pyodide / DuckDB workers |
| `default-src 'self'` | No remote `indexURL` |

**Do not** add `https://cdn.jsdelivr.net` (or any other Pyodide CDN) unless Security explicitly drops same-origin assets. Widening `script-src` / `connect-src` is the fallback documented in `next.config.ts` — not this wave.

## Copy-only Python lessons

Packaging, Spark-test fixtures (`python-testing-spark-logic`), and the CLI capstone stay **Copy to practice**. No fake Run, no Coming soon.

## Out of scope

Wave B Practice Engine grading. Railway deploy. pandas/Spark mega runtime.

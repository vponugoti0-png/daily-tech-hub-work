import type { LabQueryResult } from "./duckdb-client";
import { assertSafeLabPython, LAB_PYTHON_TIMEOUT_MS } from "./python-guard";
import { cellText, headerText } from "./render";
import { LAB_RESULT_ROW_LIMIT } from "./sql-guard";

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  FS: {
    mkdirTree: (path: string) => void;
    writeFile: (path: string, data: string) => void;
  };
};

let pyPromise: Promise<Pyodide> | null = null;

function publicIndexUrl(): string {
  return new URL("/pyodide/", window.location.origin).toString();
}

async function loadEngine(): Promise<Pyodide> {
  const indexURL = publicIndexUrl();
  const href = `${window.location.origin}/pyodide/pyodide.mjs`;
  const mod = (await import(/* webpackIgnore: true */ href)) as {
    loadPyodide: (opts: { indexURL: string }) => Promise<Pyodide>;
  };
  const py = await mod.loadPyodide({ indexURL });
  seedLandingFiles(py);
  return py;
}

function seedLandingFiles(py: Pyodide) {
  py.FS.mkdirTree("/data/landing/orders/2026-09-12");
  const rows = [
    { order_id: 1001, status: "paid", amount: 42.5, promo_code: null },
    { order_id: 1002, status: "pending", amount: 10, promo_code: "FALL26" },
    { order_id: 1003, status: "paid", amount: 18, promo_code: null },
  ];
  py.FS.writeFile(
    "/data/landing/orders/2026-09-12/orders_2026-09-12.json",
    JSON.stringify(rows),
  );
}

async function getPy(): Promise<Pyodide> {
  if (typeof window === "undefined") {
    throw new Error("The local practice lab only runs in the browser.");
  }
  if (!pyPromise) {
    pyPromise = loadEngine().catch((err) => {
      pyPromise = null;
      throw err;
    });
  }
  return pyPromise;
}

const WRAPPER = `
import ast, io, json, sys
_src = __lab_source
_tree = ast.parse(_src, filename="<lab>")
_stdout = io.StringIO()
_old = sys.stdout
sys.stdout = _stdout
__lab_value = None
try:
    if _tree.body and isinstance(_tree.body[-1], ast.Expr):
        _last = _tree.body.pop()
        if _tree.body:
            exec(compile(_tree, "<lab>", "exec"), globals())
        __lab_value = eval(compile(ast.Expression(_last.value), "<lab>", "eval"), globals())
    else:
        exec(compile(_tree, "<lab>", "exec"), globals())
finally:
    sys.stdout = _old
__lab_stdout = _stdout.getvalue()
`;

function asTable(value: unknown, stdout: string): LabQueryResult {
  if (Array.isArray(value) && value.length && value.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
    const keys = Array.from(
      new Set(value.flatMap((row) => Object.keys(row as Record<string, unknown>))),
    );
    const columns = keys.map((k) => headerText(k));
    const truncated = value.length > LAB_RESULT_ROW_LIMIT;
    const sliced = truncated ? value.slice(0, LAB_RESULT_ROW_LIMIT) : value;
    const rows = sliced.map((row) =>
      keys.map((k) => cellText((row as Record<string, unknown>)[k])),
    );
    return { columns, rows, rowCount: sliced.length, truncated };
  }
  if (Array.isArray(value) && value.every((cell) => cell === null || typeof cell !== "object")) {
    const truncated = value.length > LAB_RESULT_ROW_LIMIT;
    const sliced = truncated ? value.slice(0, LAB_RESULT_ROW_LIMIT) : value;
    return {
      columns: ["value"],
      rows: sliced.map((cell) => [cellText(cell)]),
      rowCount: sliced.length,
      truncated,
    };
  }
  const lines = [stdout, value === null || value === undefined ? "" : cellText(value)]
    .join("\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .filter((line, i, arr) => line.length > 0 || (i > 0 && i < arr.length - 1));
  if (!lines.length) {
    return { columns: ["output"], rows: [["(no output)"]], rowCount: 0, truncated: false };
  }
  const truncated = lines.length > LAB_RESULT_ROW_LIMIT;
  const sliced = truncated ? lines.slice(0, LAB_RESULT_ROW_LIMIT) : lines;
  return {
    columns: ["output"],
    rows: sliced.map((line) => [cellText(line)]),
    rowCount: sliced.length,
    truncated,
  };
}

export async function runLabPython(source: string): Promise<LabQueryResult> {
  const safe = assertSafeLabPython(source);
  const py = await getPy();
  const payload = JSON.stringify(safe);
  const run = py.runPythonAsync(`
__lab_source = ${payload}
${WRAPPER}
import json as _json
_json.dumps({"stdout": __lab_stdout, "value": __lab_value}, default=str)
`);
  const raw = await Promise.race([
    run,
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error("Python timed out (12s).")),
        LAB_PYTHON_TIMEOUT_MS,
      );
    }),
  ]);
  const parsed = JSON.parse(String(raw)) as { stdout: string; value: unknown };
  return asTable(parsed.value, parsed.stdout ?? "");
}

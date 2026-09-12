import {
  assertSafeLabPython,
  LAB_PYTHON_OUTPUT_LIMIT,
  LAB_PYTHON_TIMEOUT_MS,
} from "./python-guard";

export interface LabPythonResult {
  text: string;
  truncated: boolean;
}

type PyodideFs = {
  analyzePath: (path: string) => { exists: boolean };
  mkdir: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};

type PyodideRuntime = {
  FS: PyodideFs;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
};

type LoadPyodideFn = (opts: { indexURL: string }) => Promise<PyodideRuntime>;

let runtimePromise: Promise<PyodideRuntime> | null = null;

function publicPyodideUrl(): string {
  return new URL("/pyodide/", window.location.origin).toString();
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dth-pyodide="1"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.dthPyodide = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("The local Python engine could not load. Refresh and try again."));
    document.head.appendChild(script);
  });
}

function seedLandingFs(runtime: PyodideRuntime) {
  const { FS } = runtime;
  const mkdirp = (dir: string) => {
    const parts = dir.split("/").filter(Boolean);
    let cur = "";
    for (const part of parts) {
      cur += `/${part}`;
      if (!FS.analyzePath(cur).exists) FS.mkdir(cur);
    }
  };
  mkdirp("/data/landing/orders/2026-09-12");
  FS.writeFile(
    "/data/landing/orders/2026-09-12/orders_2026-09-12.json",
    JSON.stringify([{ order_id: 1001, status: "paid", amount: 42.5 }], null, 2),
  );
  FS.writeFile(
    "/data/landing/orders/2026-09-12/notes.json",
    JSON.stringify({ note: "not an orders file" }),
  );
}

async function hardenRuntime(runtime: PyodideRuntime) {
  await runtime.runPythonAsync(`
import sys
for _name in ("js", "pyodide", "pyodide_js", "pyodide_http", "pyodide_py"):
    sys.modules.pop(_name, None)
`);
}

async function initRuntime(): Promise<PyodideRuntime> {
  await loadScript(`${publicPyodideUrl()}pyodide.js`);
  const loadPyodide = (window as unknown as { loadPyodide?: LoadPyodideFn }).loadPyodide;
  if (!loadPyodide) {
    throw new Error("Local Python engine assets are missing. Refresh and try again.");
  }
  const runtime = await loadPyodide({ indexURL: publicPyodideUrl() });
  seedLandingFs(runtime);
  await hardenRuntime(runtime);
  return runtime;
}

async function getRuntime() {
  if (typeof window === "undefined") {
    throw new Error("The local practice lab only runs in the browser.");
  }
  if (!runtimePromise) {
    runtimePromise = initRuntime().catch((err) => {
      runtimePromise = null;
      throw err;
    });
  }
  return runtimePromise;
}

function clip(text: string): LabPythonResult {
  if (text.length <= LAB_PYTHON_OUTPUT_LIMIT) {
    return { text, truncated: false };
  }
  return {
    text: `${text.slice(0, LAB_PYTHON_OUTPUT_LIMIT)}\n… (output truncated)`,
    truncated: true,
  };
}

export async function runLabPython(source: string): Promise<LabPythonResult> {
  const safe = assertSafeLabPython(source);
  const runtime = await getRuntime();
  let buffer = "";
  runtime.setStdout({
    batched: (chunk) => {
      buffer += chunk;
    },
  });
  runtime.setStderr({
    batched: (chunk) => {
      buffer += chunk;
    },
  });

  try {
    await Promise.race([
      runtime.runPythonAsync(safe),
      new Promise<never>((_, reject) => {
        window.setTimeout(
          () => reject(new Error("Python timed out (10s).")),
          LAB_PYTHON_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (err) {
    if (err instanceof Error && err.message.includes("timed out")) {
      runtimePromise = null;
    }
    const message = err instanceof Error ? err.message : "The local lab could not run that sample.";
    if (buffer.trim()) {
      throw new Error(`${message}\n${buffer.trim()}`);
    }
    throw err instanceof Error ? err : new Error(message);
  }

  const text = buffer.trim();
  return clip(text || "Ran. No stdout — add a print() to see a result.");
}

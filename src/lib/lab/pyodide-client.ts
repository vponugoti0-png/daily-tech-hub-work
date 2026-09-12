import {
  assertSafeLabPython,
  LAB_PYTHON_OUTPUT_LIMIT,
  LAB_PYTHON_TIMEOUT_MS,
} from "./python-guard";
import {
  clipVfsContents,
  isLabVfsPath,
  LAB_VFS_SEED,
  type LabVfsFile,
} from "./python-vfs";

export interface LabPythonResult {
  text: string;
  truncated: boolean;
}

export interface LabPythonVfsWrite {
  path: string;
  contents: string;
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

function mkdirp(FS: PyodideFs, dir: string) {
  const parts = dir.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur += `/${part}`;
    if (!FS.analyzePath(cur).exists) FS.mkdir(cur);
  }
}

function writeVfsFile(runtime: PyodideRuntime, file: LabVfsFile | LabPythonVfsWrite) {
  if (!isLabVfsPath(file.path)) {
    throw new Error("This local lab only writes practice files under /data/.");
  }
  const slash = file.path.lastIndexOf("/");
  if (slash > 0) mkdirp(runtime.FS, file.path.slice(0, slash));
  runtime.FS.writeFile(file.path, clipVfsContents(file.contents));
}

/** Seed (and re-seed) CSV/JSON practice files under /data/. Overlay wins. */
export function seedPracticeFs(runtime: PyodideRuntime, overlay: LabPythonVfsWrite[] = []) {
  for (const file of LAB_VFS_SEED) {
    writeVfsFile(runtime, file);
  }
  for (const file of overlay) {
    writeVfsFile(runtime, file);
  }
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
  seedPracticeFs(runtime);
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

export async function runLabPython(
  source: string,
  overlay: LabPythonVfsWrite[] = [],
): Promise<LabPythonResult> {
  const safe = assertSafeLabPython(source);
  const runtime = await getRuntime();
  seedPracticeFs(runtime, overlay);

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

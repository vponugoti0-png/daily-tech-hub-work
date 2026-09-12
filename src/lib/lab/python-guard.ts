const MAX_CHARS = 12_000;

const BLOCKED_IMPORT =
  /\b(?:import|from)\s+(?:js|pyodide|pyodide_js|pyodide_http|socket|ssl|subprocess|ctypes|multiprocessing|webbrowser|http(?:\.client)?|urllib(?:\.request)?|ftplib|smtplib)\b/i;

const BLOCKED_CALL =
  /\b(?:__import__|os\.(?:system|popen|execv|spawn)|socket\.|urllib\.request|pyodide\.http)\b/i;

const BLOCKED_PATH = /open\s*\(\s*['"]\/(?:etc|proc|sys|dev)\b/i;

/**
 * In-browser Python samples only. No shell, no network modules, no JS bridge.
 * Defense in depth — Pyodide is also initialized without micropip / js.
 */
export function assertSafeLabPython(source: string): string {
  const trimmed = source.replace(/\r\n/g, "\n").trim();
  if (!trimmed) {
    throw new Error("Enter a Python sample to run.");
  }
  if (trimmed.length > MAX_CHARS) {
    throw new Error("This local lab only runs short samples (12k characters).");
  }
  if (BLOCKED_IMPORT.test(trimmed) || BLOCKED_CALL.test(trimmed) || BLOCKED_PATH.test(trimmed)) {
    throw new Error(
      "This local lab only runs small stdlib samples — no network, shell, or JS bridge.",
    );
  }
  return trimmed;
}

export const LAB_PYTHON_TIMEOUT_MS = 10_000;
export const LAB_PYTHON_OUTPUT_LIMIT = 8_000;

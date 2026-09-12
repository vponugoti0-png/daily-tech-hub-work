const BLOCKED_MODULE =
  /\b(subprocess|socket|ctypes|multiprocessing|webbrowser|http\.client|urllib\.request|ftplib|smtplib|telnetlib|xmlrpc|imaplib|nntplib|poplib|ctypes|cffi)\b/;

const BLOCKED_OS = /\bos\.(system|popen|execv|execve|execl|spawn[a-z]*|remove|unlink|rmdir)\b/;

const BLOCKED_SHELL = /^\s*(!|%sh|%%sh|%bash)/m;

/**
 * Lab v1 Python is stdlib samples in-browser (Pyodide).
 * No shell, no network, no credentials — defense in depth even though
 * the engine is local.
 */
export function assertSafeLabPython(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) {
    throw new Error("Enter a Python sample to run.");
  }
  if (BLOCKED_SHELL.test(trimmed)) {
    throw new Error("This local lab has no shell. Paste Python, not %sh or ! commands.");
  }
  if (BLOCKED_MODULE.test(trimmed) || BLOCKED_OS.test(trimmed)) {
    throw new Error("This local lab only runs stdlib samples — no shell, network, or OS writes.");
  }
  return trimmed;
}

export const LAB_PYTHON_TIMEOUT_MS = 12_000;

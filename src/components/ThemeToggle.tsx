"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("dth-theme-change", onStoreChange);
  return () => window.removeEventListener("dth-theme-change", onStoreChange);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function applyTheme(nextDark: boolean) {
  document.documentElement.classList.toggle("dark", nextDark);
  document.documentElement.classList.remove("light");
  try {
    localStorage.setItem("dth-theme", nextDark ? "dark" : "light");
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new Event("dth-theme-change"));
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    applyTheme(!document.documentElement.classList.contains("dark"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] p-2 text-[var(--ink-fg)] transition hover:bg-[var(--panel-2)]"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
    >
      {/* Icons follow html.dark from the FOUC script so first paint matches the page. */}
      <Sun className="theme-toggle-sun h-4 w-4" aria-hidden />
      <Moon className="theme-toggle-moon h-4 w-4" aria-hidden />
    </button>
  );
}

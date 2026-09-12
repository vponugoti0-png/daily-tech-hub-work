"use client";

import { useEffect, useState } from "react";
import { BookOpenText } from "lucide-react";
import { PLAIN_ENGLISH_KEY } from "@/lib/jargon";
import { cn } from "@/lib/utils";

export function PlainEnglishToggle({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem(PLAIN_ENGLISH_KEY) === "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.plainEnglish = on ? "on" : "off";
    try {
      localStorage.setItem(PLAIN_ENGLISH_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [on, ready]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={cn(
        "inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] border px-2.5 py-1.5 text-xs font-bold transition",
        on
          ? "border-[var(--mint)]/50 bg-[var(--mint)]/15 text-[var(--mint)]"
          : "border-[var(--ink-border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--ink-fg)]",
      )}
      aria-pressed={on}
      title="Show simple explanations for tech words"
    >
      <BookOpenText className="h-3.5 w-3.5" aria-hidden />
      {compact ? "Plain" : on ? "Plain English on" : "Plain English"}
    </button>
  );
}

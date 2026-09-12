import { CopyButton } from "@/components/CopyButton";
import type { CheatSheetEntry } from "@/lib/types";

/** Lesson cheat sheet: each block is title → code → tip → Copy. */
export function CheatSheet({ entries }: { entries: CheatSheetEntry[] }) {
  return (
    <section
      id="cheat-sheet"
      className="panel mt-8 scroll-mt-24 rounded-2xl p-5"
      aria-labelledby="cheat-sheet-heading"
    >
      <h2
        id="cheat-sheet-heading"
        className="font-display text-sm font-bold uppercase tracking-wider text-[var(--sky)]"
      >
        Cheat sheet
      </h2>
      <ul className="mt-3 space-y-3">
        {entries.map((e) => {
          const code = e.code.replace(/\\n/g, "\n");
          return (
            <li
              key={e.label}
              className="cheat-sheet-block rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/50 p-3"
            >
              <p className="text-sm font-medium text-[var(--ink-fg)]">{e.label}</p>
              <pre className="mt-2 overflow-x-auto font-mono text-xs text-[var(--ink-fg)]">
                <code>{code}</code>
              </pre>
              {e.note ? <p className="cheat-sheet-tip mt-2 text-xs text-[var(--muted)]">{e.note}</p> : null}
              <div className="mt-2">
                <CopyButton text={code} label="Copy" />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

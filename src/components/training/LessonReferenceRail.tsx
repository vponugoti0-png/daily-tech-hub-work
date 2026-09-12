import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import type { ShortcutPackLink } from "@/lib/lesson-chrome";
import type { CheatSheetEntry } from "@/lib/types";

export function LessonReferenceRail({
  leftover,
  pack,
}: {
  leftover: CheatSheetEntry[];
  pack?: ShortcutPackLink;
}) {
  if (!leftover.length && !pack) return null;

  return (
    <aside
      id="cheat-sheet"
      data-testid="lesson-reference"
      className="panel mt-10 scroll-mt-24 rounded-2xl p-5"
    >
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--sky)]">
        Reference
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Leftover cheat-sheet cards and the Shortcuts pack for this tool.
      </p>
      {leftover.length ? (
        <div className="mt-4">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--sky)]">
            Cheat sheet
          </h3>
          <ul className="mt-3 space-y-3">
            {leftover.map((e) => (
              <li key={e.label} className="rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/50 p-3">
                <p className="text-sm font-medium text-[var(--ink-fg)]">{e.label}</p>
                {e.code ? (
                  <pre className="mt-2 overflow-x-auto font-mono text-xs text-[var(--ink-fg)]">
                    <code>{e.code.replace(/\\n/g, "\n")}</code>
                  </pre>
                ) : null}
                {e.note ? <p className="mt-2 text-xs text-[var(--muted)]">{e.note}</p> : null}
                {e.code ? (
                  <div className="mt-2">
                    <CopyButton text={e.code.replace(/\\n/g, "\n")} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {pack ? (
        <p className="mt-4 text-sm">
          <Link href={pack.href} className="font-bold text-[var(--coral)] hover:underline">
            Open Shortcuts pack for this tool — {pack.title}
          </Link>
        </p>
      ) : null}
    </aside>
  );
}

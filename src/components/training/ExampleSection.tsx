import { TryItBox } from "@/components/training/TryItBox";
import type { CheatSheetEntry } from "@/lib/types";

export function ExampleSection({
  example,
  extras,
  dialect,
  labHref,
  labKind,
  isAiTrack,
  isFdeTrack,
  showGitLab,
  showAiLab,
}: {
  example: CheatSheetEntry;
  extras: CheatSheetEntry[];
  dialect: string;
  labHref?: string;
  labKind?: "sql" | "git" | "ai";
  isAiTrack: boolean;
  isFdeTrack: boolean;
  showGitLab: boolean;
  showAiLab: boolean;
}) {
  const primary = exampleCard(example, 0, {
    dialect,
    labHref,
    labKind,
    isAiTrack,
    isFdeTrack,
    showGitLab,
    showAiLab,
  });

  return (
    <section id="example" data-testid="lesson-example" className="scroll-mt-24">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--sun)]">
        Example
      </h2>
      <TryItBox {...primary} />
      {extras.length ? (
        <details
          data-testid="example-more"
          className="my-4 rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)] px-4 py-3"
        >
          <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            More examples ({extras.length})
          </summary>
          <div className="mt-2">
            {extras.map((entry, i) => {
              const props = exampleCard(entry, i + 1, {
                dialect,
                labHref,
                labKind,
                isAiTrack,
                isFdeTrack,
                showGitLab,
                showAiLab,
              });
              return <TryItBox key={`${entry.label}-${i}`} {...props} />;
            })}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function exampleCard(
  entry: CheatSheetEntry,
  index: number,
  ctx: {
    dialect: string;
    labHref?: string;
    labKind?: "sql" | "git" | "ai";
    isAiTrack: boolean;
    isFdeTrack: boolean;
    showGitLab: boolean;
    showAiLab: boolean;
  },
) {
  const code = entry.code.replace(/\\n/g, "\n");
  const isSql = /SNOWFLAKE\.CORTEX/i.test(code);
  const dialect = isSql ? "Snowflake SQL" : ctx.isAiTrack ? "AI chat" : ctx.dialect;
  const defaultHint = ctx.isAiTrack
    ? isSql
      ? "Copy into a Snowflake worksheet. Treat model output as untrusted. Not a live Cortex account."
      : ctx.showAiLab
        ? "Load it into Local practice below, or Copy into your own AI tool. Not a live Claude or GPT account."
        : "Paste into Claude, Copilot Chat, or Grok — then iterate."
    : ctx.isFdeTrack
      ? "Copy into a ticket, runbook, or customer notes. No live cloud deploy on this page."
      : ctx.showGitLab
        ? "Load it into Git Play Lab below — in-browser graph only, no GitHub push."
        : ctx.labHref
          ? "Load this example into the practice desk on this page."
          : "Copy this example into your warehouse, notebook, or repo to practice.";

  return {
    title: ctx.isAiTrack && index === 0 ? "Try this prompt" : index === 0 ? "Example" : entry.label,
    code,
    dialect,
    hint: entry.note ?? defaultHint,
    labHref: ctx.labHref,
    labKind: ctx.labKind,
    variant: ctx.labHref || index > 0 ? ("reference" as const) : ("editor" as const),
  };
}

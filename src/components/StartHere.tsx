import Link from "next/link";
import { FlaskConical, Keyboard, Sparkles, Table2 } from "lucide-react";
import { JargonLegend, JargonTip } from "@/components/JargonTip";
import { FIRST_LESSON_HREF, STARTER_PRACTICE_HREF } from "@/lib/learner-paths";
import { findJargon } from "@/lib/jargon";

const CHOICES = [
  {
    href: FIRST_LESSON_HREF,
    title: "Learn with AI prompts",
    blurb: "Ask better questions and practice with Claude, Copilot, or Grok.",
    icon: Sparkles,
    accent: "text-[var(--sun)] border-[var(--sun)]/35 hover:border-[var(--sun)]/60",
    chip: "Beginner",
  },
  {
    href: "/training/sql/sql-select-filter-nulls",
    title: "Learn SQL",
    blurb: "Talk to databases with simple queries — windows, joins, and checks.",
    icon: Table2,
    accent: "text-[var(--mint)] border-[var(--mint)]/35 hover:border-[var(--mint)]/60",
    chip: "Popular",
  },
  {
    href: "/shortcuts",
    title: "Explore shortcuts",
    blurb: "Copy-paste keyboard, CLI, SQL, and AI tips you can use today.",
    icon: Keyboard,
    accent: "text-[var(--sky)] border-[var(--sky)]/35 hover:border-[var(--sky)]/60",
    chip: "Quick win",
  },
] as const;

const STARTER_JARGON = ["DE", "DBX", "ETL", "SQL", "Pipeline"]
  .map((term) => findJargon(term))
  .filter((e): e is NonNullable<typeof e> => Boolean(e));

export function StartHere() {
  return (
    <section
      id="start-here"
      className="scroll-mt-24 rounded-[1.5rem] border-2 border-[var(--coral)]/35 bg-[color-mix(in_oklab,var(--panel)_88%,var(--coral))] p-5 sm:p-7"
      aria-labelledby="start-here-title"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
            Aurora Play Lab · Start here
          </p>
          <h2
            id="start-here-title"
            className="mt-1 font-display text-2xl font-bold text-[var(--ink-fg)] sm:text-3xl"
          >
            Pick one path — no wrong answer
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Three friendly doors. The first lesson is Ask AI better questions — tap any card
            and you&apos;re learning{" "}
            <JargonTip term="DE">DE</JargonTip> /{" "}
            <JargonTip term="ETL">ETL</JargonTip> words in Plain English as you go.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {CHOICES.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={`group panel glass-hover flex flex-col rounded-2xl border p-4 ${c.accent}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel-2)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="rounded-full bg-[var(--panel-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {c.chip}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-[var(--ink-fg)] group-hover:underline">
                {c.title}
              </h3>
              <p className="mt-1 text-sm leading-snug text-[var(--muted)]">{c.blurb}</p>
              <span className="mt-3 text-xs font-bold text-[var(--coral)]">Let&apos;s go →</span>
            </Link>
          );
        })}
      </div>
      <Link
        href={STARTER_PRACTICE_HREF}
        data-testid="practice-cta"
        className="mt-4 flex flex-col gap-2 rounded-2xl border-2 border-[var(--mint)]/40 bg-[var(--mint)]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel)]">
            <FlaskConical className="h-5 w-5 text-[var(--mint)]" aria-hidden />
          </span>
          <span>
            <span className="block font-display text-sm font-bold text-[var(--ink-fg)]">
              Practice in the SQL lab
            </span>
            <span className="mt-0.5 block text-sm text-[var(--muted)]">
              Run a real <JargonTip term="SQL">SQL</JargonTip> sample in the browser — not a live
              warehouse. Same Training routes; no extra header item.
            </span>
          </span>
        </span>
        <span className="btn-primary shrink-0 self-start sm:self-center">Open practice →</span>
      </Link>
      <div className="plain-english-panel mt-4">
        <JargonLegend entries={STARTER_JARGON} />
      </div>
    </section>
  );
}

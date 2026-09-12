import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
import { NewsCard } from "@/components/NewsCard";
import { LessonCard } from "@/components/LessonCard";
import { ReleaseCard } from "@/components/ReleaseCard";
import { ShortcutCard } from "@/components/ShortcutCard";
import { FreeForeverBanner } from "@/components/FreeForeverBanner";
import { StartHere } from "@/components/StartHere";
import { JargonTip } from "@/components/JargonTip";
import { getFeaturedBundle, getLessonsByTrack } from "@/lib/content";
import { PRIMARY_TRACKS } from "@/lib/tracks";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FRIENDLY_BLURB: Record<string, string> = {
  "prompt-engineering": "Practice asking AI clear questions.",
  "ai-data-eng": "Use AI to help with data work — then practice Cortex and agent prompts.",
  python: "Write small Python tools for data jobs.",
  sql: "Ask databases questions with SQL.",
  databricks: "Learn Databricks (DBX) lakehouse basics.",
  snowflake: "Explore Snowflake warehouses & tables.",
  "forward-deployed": "Deliver DE/AI platforms in a customer warehouse.",
};

export default function HomePage() {
  const { digest, news, lessons, releases, shortcuts } = getFeaturedBundle();

  return (
    <div className="space-y-10">
      <Hero digest={digest} />
      <StartHere />
      <FreeForeverBanner />

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
              Beginner tracks
            </p>
            <h2 className="font-display text-xl font-bold text-[var(--ink-fg)]">Pick a course</h2>
          </div>
          <Link href="/training" className="text-sm font-bold text-[var(--coral)]">
            All courses →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRIMARY_TRACKS.map((t) => {
            const count = getLessonsByTrack(t.id).length;
            return (
              <Link
                key={t.id}
                href={`/training/${t.id}`}
                className="panel glass-hover rounded-2xl p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
                    {t.badge ?? "Course"}
                  </p>
                  <span className="text-[10px] font-bold text-[var(--mint)]">Free</span>
                </div>
                <h3 className="mt-1 font-display text-base font-bold text-[var(--ink-fg)]">
                  {t.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                  {t.id === "databricks" ? (
                    <>
                      Learn <JargonTip term="DBX">Databricks (DBX)</JargonTip> lakehouse basics.
                    </>
                  ) : t.id === "forward-deployed" ? (
                    <>
                      Deliver <JargonTip term="DE">DE</JargonTip>/AI platforms in a customer{" "}
                      <JargonTip term="Warehouse">warehouse</JargonTip>.
                    </>
                  ) : (
                    (FRIENDLY_BLURB[t.id] ?? t.blurb)
                  )}
                </p>
                <p className="mt-2 text-[11px] text-[var(--muted)]">
                  {count} short lessons · ~{t.estimatedHours}h
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="News"
          title="What's new (skimmable)"
          description="Short headlines — why it matters in one line."
          href="/news"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {news.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Training"
          title="Featured lessons"
          description="Tiny checkpoints with a quiz at the end."
          href="/training"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="Releases"
            title="What changed"
            description="Briefs you can act on this week."
            href="/releases"
          />
          <div className="grid gap-4">
            {releases.map((item) => (
              <ReleaseCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow="Shortcuts"
            title="CLI · SQL · Keyboard · AI"
            description="Copy-paste helpers for everyday work."
            href="/shortcuts"
          />
          <div className="grid gap-4">
            {shortcuts.map((item) => (
              <ShortcutCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="panel flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--ink-fg)]">
            Ready for the next checkpoint?
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Keep going as a guest. A free account is optional if you want the same
            progress on another device.
          </p>
        </div>
        <Link href="/signup" className="btn-ghost shrink-0">
          Optional account <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

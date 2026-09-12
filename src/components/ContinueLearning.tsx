import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import type { RelatedTrainingLink } from "@/lib/related-training";
import { getTrackMeta } from "@/lib/tracks";

export function ContinueLearning({ links }: { links: RelatedTrainingLink[] }) {
  if (!links.length) return null;

  return (
    <section
      id="continue-learning"
      aria-labelledby="continue-learning-heading"
      className="panel mt-10 rounded-2xl p-6"
    >
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
        Training
      </p>
      <h2
        id="continue-learning-heading"
        className="mt-1 font-display text-xl font-bold tracking-tight text-[var(--ink-fg)]"
      >
        Continue learning
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
        Related lessons from shared tools. Open any link as a guest — no sign-in required.
      </p>
      <ul className="mt-4 grid gap-3">
        {links.map((link) => {
          const trackTitle = getTrackMeta(link.trackId)?.title ?? link.trackId;
          const Icon = link.kind === "track" ? GraduationCap : BookOpen;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group glass glass-hover flex items-start gap-3 rounded-xl p-4"
              >
                <Icon
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sky)]"
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block font-display text-sm font-bold text-[var(--ink-fg)] group-hover:text-[var(--coral)]">
                    {link.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {trackTitle}
                    {link.kind === "track" ? " · full track" : ""}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

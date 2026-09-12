import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllReleases, getReleaseBySlug } from "@/lib/content";
import { getRelatedTrainingLinks } from "@/lib/related-training";
import { SoftBadge, TopicBadge } from "@/components/Badge";
import { ContinueLearning } from "@/components/ContinueLearning";
import { formatDate } from "@/lib/dates";
import { ArrowLeft, ExternalLink } from "lucide-react";

export function generateStaticParams() {
  return getAllReleases().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getReleaseBySlug(slug);
  return { title: item?.title ?? "Release" };
}

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getReleaseBySlug(slug);
  if (!item) notFound();

  const related = getRelatedTrainingLinks({
    topics: item.topics,
    title: item.title,
  });

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/releases"
        className="mb-6 inline-flex min-h-[40px] items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--coral)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to releases
      </Link>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <SoftBadge>{item.product}</SoftBadge>
        <SoftBadge className="font-mono">{item.version}</SoftBadge>
        {item.topics.map((t) => (
          <TopicBadge key={t} topic={t} />
        ))}
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)] sm:text-4xl">
        {item.title}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Released {formatDate(item.releasedAt)}</p>
      <p className="mt-6 text-base leading-relaxed text-[var(--ink-fg)]">{item.summary}</p>

      <div className="panel mt-8 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          What changed
        </h2>
        <ul className="mt-4 space-y-3">
          {item.whatChanged.map((c) => (
            <li key={c} className="flex gap-3 text-sm text-[var(--ink-fg)]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sun)]" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--sun)]/25 bg-[var(--sun)]/10 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--sun)]">
          Why read now
        </h2>
        <p className="mt-2 text-base leading-relaxed text-[var(--ink-fg)]">{item.whyReadNow}</p>
      </div>

      {item.sourceUrl ? (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--coral)] hover:text-[var(--signal)]"
        >
          Official docs <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}

      <ContinueLearning links={related} />
    </article>
  );
}

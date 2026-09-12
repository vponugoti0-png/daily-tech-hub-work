import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNews, getNewsBySlug } from "@/lib/content";
import { getRelatedTrainingLinks } from "@/lib/related-training";
import { TopicBadge } from "@/components/Badge";
import { ContinueLearning } from "@/components/ContinueLearning";
import { formatDate } from "@/lib/dates";
import { ArrowLeft, ExternalLink } from "lucide-react";

export function generateStaticParams() {
  return getAllNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  return { title: item?.title ?? "News" };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  const related = getRelatedTrainingLinks({
    topics: item.topics,
    title: item.title,
  });

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/news"
        className="mb-6 inline-flex min-h-[40px] items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--coral)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to news
      </Link>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {item.topics.map((t) => (
          <TopicBadge key={t} topic={t} />
        ))}
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)] sm:text-4xl">
        {item.title}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {item.source} · {formatDate(item.publishedAt)}
      </p>
      <div className="panel mt-8 space-y-6 rounded-2xl p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Summary
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--ink-fg)]">{item.summary}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--sky)]">
            Why it matters
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--ink-fg)]">{item.whyItMatters}</p>
        </div>
        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--coral)] hover:text-[var(--signal)]"
          >
            Visit source <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
      <ContinueLearning links={related} />
    </article>
  );
}

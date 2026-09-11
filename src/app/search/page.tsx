import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { TopicBadge, SoftBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { searchContent } from "@/lib/search";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across news, training, releases, and shortcuts.",
};

export const dynamic = "force-dynamic";

function SearchResults({ q }: { q: string }) {
  const results = q ? searchContent(q) : [];

  return (
    <div className="mt-8">
      {!q ? (
        <EmptyState
          title="Search the hub"
          body="Try “window”, “Snowflake”, “rebase”, “Photon”, or “watermark”."
        />
      ) : results.length === 0 ? (
        <EmptyState title="No matches" body={`Nothing found for “${q}”.`} />
      ) : (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={`${r.kind}-${r.slug}`}>
              <Link
                href={r.href}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-500/30"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <SoftBadge className="capitalize">{r.kind}</SoftBadge>
                  {r.topics.slice(0, 3).map((t) => (
                    <TopicBadge key={t} topic={t} />
                  ))}
                </div>
                <h3 className="font-semibold text-white">{r.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{r.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function SearchInner({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <div>
      <SectionHeader
        eyebrow="Search"
        title="Find anything in the hub"
        description="Full-text style scan across curated content."
      />
      <SearchBox initialQuery={q} />
      <SearchResults q={q.trim()} />
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-zinc-500">Loading search…</div>
      }
    >
      <SearchInner searchParams={searchParams} />
    </Suspense>
  );
}

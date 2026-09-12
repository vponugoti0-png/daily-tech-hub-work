import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonsByTrack } from "@/lib/content";
import { getTrackMeta, TRACK_IDS } from "@/lib/tracks";
import { DATABRICKS_LAB_ENTRY_SLUG } from "@/lib/lab/samples";
import { LessonCard } from "@/components/LessonCard";
import { TrackProgressBar } from "@/components/training/ProgressBar";
import { ArrowLeft } from "lucide-react";

import { TrackSceneClient } from "@/components/three/TrackSceneClient";

export function generateStaticParams() {
  return TRACK_IDS.map((track) => ({ track }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const meta = getTrackMeta(track);
  return { title: meta?.title ?? "Track" };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const meta = getTrackMeta(track);
  const lessons = getLessonsByTrack(track);
  if (!meta || !lessons.length) notFound();
  const slugs = lessons.map((l) => l.slug);

  return (
    <div className="space-y-8">
      <Link
        href="/training"
        className="inline-flex min-h-[40px] items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--coral)]"
      >
        <ArrowLeft className="h-4 w-4" /> All tracks
      </Link>

      <div className="panel grid gap-6 overflow-hidden rounded-3xl p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
            Course track
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[var(--ink-fg)] sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{meta.blurb}</p>
          {meta.orderNote ? (
            <p className="mt-3 max-w-2xl rounded-xl border border-[var(--sky)]/30 bg-[var(--sky)]/10 px-3 py-2 text-sm leading-relaxed text-[var(--ink-fg)]">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
                Recommended order
              </span>
              <span className="mt-1 block">{meta.orderNote}</span>
            </p>
          ) : null}
          <p className="mt-4 text-xs text-[var(--muted)]">
            {lessons.length} lessons · ~{meta.estimatedHours}h · {meta.difficulty}
          </p>
          <div className="mt-6 max-w-md">
            <TrackProgressBar track={track} slugs={slugs} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/training/${track}/${lessons[0].slug}`} className="btn-primary">
              Start / continue →
            </Link>
            {track === "databricks" ? (
              <Link
                href={`/training/databricks/${DATABRICKS_LAB_ENTRY_SLUG}#lab`}
                className="btn-ghost"
              >
                Practice · local lab →
              </Link>
            ) : null}
          </div>
        </div>
        <TrackSceneClient track={track} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}

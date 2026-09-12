"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDate, formatDateTime, relativeTime, todayISODate } from "@/lib/dates";
import { FIRST_LESSON_HREF } from "@/lib/learner-paths";
import type { DigestMeta } from "@/lib/types";
import { BookOpen, CalendarDays, Keyboard, RefreshCw, Sparkles } from "lucide-react";

function RelativeUpdated({ value }: { value: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const absolute = formatDateTime(value);
  // Absolute UTC string is identical on server and client; relative time after mount.
  return (
    <>
      <span>{mounted ? relativeTime(value) : absolute}</span>
      {mounted ? <span className="hidden sm:inline"> · {absolute}</span> : null}
    </>
  );
}

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" aria-hidden />,
  },
);

export function Hero({ digest }: { digest: DigestMeta }) {
  const [allow3d, setAllow3d] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () =>
      setAllow3d(
        mq.matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // `initial: false` keeps the first (SSR / no-JS) paint visible. Starting at
  // opacity 0 hid the headline until hydration — in-app browsers, blocked JS,
  // and prefers-reduced-motion then look like a blank / unopenable page.
  // Same props on server and client — do not branch on useReducedMotion (null vs bool).
  const fade = (delay = 0) => ({
    initial: false as const,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
  });

  return (
    <section className="relative isolate overflow-hidden rounded-[1.5rem] border border-[var(--ink-border)] bg-[var(--panel)] p-6 sm:p-9">
      {/* Art stays in its own stacking context (z-0) so WebGL/blobs cannot cover copy. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {allow3d ? (
          <div className="absolute inset-0 opacity-60 lg:left-[46%] lg:opacity-80">
            <HeroScene />
          </div>
        ) : null}
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[var(--violet)]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[var(--coral)]/20 blur-3xl" />
        <div className="absolute -left-8 top-1/2 h-28 w-28 rounded-full bg-[var(--sky)]/20 blur-2xl" />
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
        <div className="relative rounded-2xl bg-[var(--panel)]/90 px-1 py-0.5 backdrop-blur-[2px] sm:px-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--violet)]/20 px-3 py-1 font-bold text-[var(--violet)] ring-1 ring-[var(--violet)]/35">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Aurora Play Lab
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--coral)]/15 px-3 py-1 font-bold text-[var(--coral)] ring-1 ring-[var(--coral)]/30">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--coral)]" />
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Today · {formatDate(todayISODate())}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              <RelativeUpdated value={digest.lastUpdated} />
            </span>
          </div>
          <motion.h1
            {...fade(0)}
            className="max-w-3xl font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            {digest.headline}
          </motion.h1>
          <motion.p
            {...fade(0.05)}
            className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg"
          >
            {digest.blurb}
          </motion.p>
          <motion.div {...fade(0.08)} className="mt-6 flex flex-wrap gap-3">
            <Link href={FIRST_LESSON_HREF} className="btn-primary" data-testid="start-here-cta">
              <BookOpen className="h-4 w-4" aria-hidden />
              Start here
            </Link>
            <Link href="/shortcuts" className="btn-ghost">
              <Keyboard className="h-4 w-4" aria-hidden />
              Shortcuts
            </Link>
          </motion.div>
        </div>

        <motion.div
          {...fade(0.1)}
          className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
        >
          <Link
            href={FIRST_LESSON_HREF}
            className="rounded-2xl border border-[var(--ink-border)] bg-[var(--panel-2)]/95 p-4 backdrop-blur-sm transition hover:border-[var(--coral)]/40"
          >
            <p className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sun)]">
              <Sparkles className="h-3 w-3" /> Friendly first step
            </p>
            <p className="mt-1 font-display text-base font-bold text-[var(--ink-fg)]">
              Learn with AI prompts
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">Short lessons · copy & try</p>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-[var(--ink-border)] bg-[var(--panel-2)]/95 p-4 backdrop-blur-sm transition hover:border-[var(--mint)]/40"
          >
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mint)]">
              My progress · free
            </p>
            <p className="mt-1 font-display text-base font-bold text-[var(--ink-fg)]">
              Save your wins
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">Guest-friendly — sign-in is optional</p>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

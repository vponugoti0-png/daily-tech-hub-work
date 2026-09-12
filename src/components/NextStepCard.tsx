"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Play } from "lucide-react";
import { loadProgress } from "@/lib/progress";
import { resolveNextStep, type NextStep } from "@/lib/learner-paths";
import { cn } from "@/lib/utils";

export function NextStepCard({
  variant = "learn",
}: {
  variant?: "home" | "learn";
}) {
  const [step, setStep] = useState<NextStep | null>(null);

  useEffect(() => {
    const refresh = () => setStep(resolveNextStep(loadProgress().lessons));
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, []);

  const shown =
    step ??
    resolveNextStep({});

  const loud = variant === "home";
  const Icon = shown.isContinue ? Play : BookOpen;

  return (
    <section
      data-testid={loud ? "home-continue" : "learn-next-step"}
      aria-labelledby={loud ? "home-continue-title" : "learn-next-step-title"}
      className={cn(
        "rounded-[1.5rem] border-2 p-5 sm:p-7",
        shown.isContinue
          ? "border-[var(--coral)]/50 bg-[color-mix(in_oklab,var(--panel)_86%,var(--coral))]"
          : "border-[var(--mint)]/40 bg-[color-mix(in_oklab,var(--panel)_88%,var(--mint))]",
      )}
    >
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
        {shown.eyebrow}
      </p>
      <h2
        id={loud ? "home-continue-title" : "learn-next-step-title"}
        className={cn(
          "mt-1 font-display font-bold text-[var(--ink-fg)]",
          loud ? "text-2xl sm:text-3xl" : "text-xl",
        )}
      >
        {shown.title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        {shown.isContinue
          ? "Pick up the next Zero→Hero step from progress on this device."
          : "First-run door: open the SQL lab and run a real SELECT."}
      </p>
      <Link
        href={shown.href}
        data-testid={loud ? "home-continue-cta" : "learn-next-step-cta"}
        className="btn-primary mt-4 inline-flex"
      >
        <Icon className="h-4 w-4" aria-hidden />
        {shown.cta} →
      </Link>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { L1FinishScreen } from "@/components/training/L1FinishScreen";
import { ZERO_TO_HERO_HREF } from "@/lib/learner-paths";

export const metadata: Metadata = {
  title: "L1 SQL trophy",
  description:
    "First trophy after the L1 SQL loop — dirty orders to daily revenue, transfer sentence, and a guest transcript.",
};

export default function L1CompletePage() {
  return (
    <div className="space-y-6">
      <Link
        href={ZERO_TO_HERO_HREF}
        className="inline-flex min-h-[40px] items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--coral)]"
      >
        <ArrowLeft className="h-4 w-4" /> Zero→Hero outline
      </Link>
      <L1FinishScreen />
    </div>
  );
}

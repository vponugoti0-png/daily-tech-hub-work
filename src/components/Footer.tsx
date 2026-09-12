import Link from "next/link";
import { FIRST_LESSON_HREF } from "@/lib/learner-paths";

export function Footer({ lastUpdated }: { lastUpdated?: string }) {
  return (
    <footer className="mt-auto border-t border-[var(--ink-border)] bg-[color-mix(in_oklab,var(--canvas)_92%,#000)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display font-semibold text-[var(--ink-fg)]">
            Daily Tech Hub{" "}
            <span className="rounded-md bg-[var(--violet)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Aurora Play Lab
            </span>
          </p>
          <p className="mt-1">Free learning for data engineers + AI</p>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          {lastUpdated ? <p>Digest updated {lastUpdated}</p> : null}
          <p>
            <Link href={FIRST_LESSON_HREF} className="hover:text-[var(--coral)]">
              Start here
            </Link>
            {" · "}
            <Link href="/signup" className="hover:text-[var(--coral)]">
              Optional account
            </Link>
            {" · "}
            <Link href="/shortcuts" className="hover:text-[var(--sky)]">
              Shortcuts
            </Link>
            {" · "}
            <Link href="/training" className="hover:text-[var(--mint)]">
              Training
            </Link>
          </p>
          <p>
            <Link href="/privacy" className="hover:text-[var(--signal)]">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="hover:text-[var(--signal)]">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

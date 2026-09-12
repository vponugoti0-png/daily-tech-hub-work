"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export function FreeForeverBanner({ compact = false }: { compact?: boolean }) {
  const { user, loading } = useAuth();

  if (compact) {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--mint)]/40 bg-[var(--mint)]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mint)]">
        Free to learn
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--mint)]/35 bg-[var(--mint)]/10 px-4 py-3 text-sm text-[var(--ink-fg)]">
      <strong className="font-display text-[var(--mint)]">Learn as a guest.</strong>{" "}
      An account is optional — only if you want the same progress on another device.
      {!loading && !user ? (
        <>
          {" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--coral)] underline decoration-[var(--coral)] underline-offset-2"
          >
            Optional account
          </Link>
        </>
      ) : null}
    </div>
  );
}

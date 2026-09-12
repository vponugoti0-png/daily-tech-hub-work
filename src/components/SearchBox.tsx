import { Search } from "lucide-react";

/**
 * Native GET form — submitting (Enter or button) always sets `?q=` so the
 * search RSC page re-renders. No client router required.
 */
export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <form role="search" method="get" action="/search" className="flex w-full items-stretch gap-2">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search news, lessons, releases, shortcuts…"
          className="field has-leading-icon text-sm"
          aria-label="Search"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-[var(--sky)]/15 px-4 text-sm font-bold text-[var(--sky)] ring-1 ring-[var(--sky)]/30 hover:bg-[var(--sky)]/25"
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
}

import { Search } from "lucide-react";

/**
 * Native GET form — submitting (Enter or button) always sets `?q=` so the
 * search RSC page re-renders. No client router required.
 */
export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <form role="search" method="get" action="/search" className="relative w-full">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search news, lessons, releases, shortcuts…"
        className="field has-leading-icon pr-[5.5rem] text-sm"
        aria-label="Search"
        autoComplete="off"
        enterKeyHint="search"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--sky)]/15 px-3 py-1.5 text-xs font-bold text-[var(--sky)] ring-1 ring-[var(--sky)]/30 hover:bg-[var(--sky)]/25"
      >
        Search
      </button>
    </form>
  );
}

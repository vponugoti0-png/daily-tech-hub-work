import { Search } from "lucide-react";

/**
 * Native GET form — submitting (Enter or button) always sets `?q=` so the
 * search RSC page re-renders. No client router required.
 */
export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <form role="search" method="get" action="/search" className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search news, lessons, releases, shortcuts…"
        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-[5.5rem] text-sm text-white outline-none ring-cyan-500/40 placeholder:text-zinc-500 focus:border-cyan-500/40 focus:ring-2"
        aria-label="Search"
        autoComplete="off"
        enterKeyHint="search"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-100 ring-1 ring-cyan-400/30 hover:bg-cyan-500/30"
      >
        Search
      </button>
    </form>
  );
}

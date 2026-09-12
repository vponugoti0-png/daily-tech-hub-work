import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-zinc-400">That route isn’t in the hub. Try search or head home.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
        >
          Home
        </Link>
        <Link
          href="/search"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-200"
        >
          Search
        </Link>
      </div>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl border-dashed px-6 py-12 text-center">
      <h3 className="font-display text-lg font-medium text-[var(--ink-fg)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}

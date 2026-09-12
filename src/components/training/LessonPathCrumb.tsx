import Link from "next/link";
import type { PathCrumb } from "@/lib/lesson-chrome";

export function LessonPathCrumb({ crumb }: { crumb: PathCrumb }) {
  return (
    <nav
      aria-label="Path"
      data-testid="lesson-path-crumb"
      className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[var(--muted)]"
    >
      <Link href={crumb.pathHref} className="text-[var(--coral)] hover:underline">
        {crumb.pathLabel}
      </Link>
      <span aria-hidden>·</span>
      <span>{crumb.levelLabel}</span>
      {crumb.position ? (
        <>
          <span aria-hidden>·</span>
          <span>
            {crumb.position.index}/{crumb.position.total}
          </span>
        </>
      ) : null}
    </nav>
  );
}

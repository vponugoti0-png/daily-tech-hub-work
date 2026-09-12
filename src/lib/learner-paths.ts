/** Zero→Hero front door (Prompt A). PE is an elective, not the first lesson. */
export const FIRST_LESSON_TRACK = "sql";
export const FIRST_LESSON_SLUG = "sql-select-filter-nulls";
export const FIRST_LESSON_HREF = `/training/${FIRST_LESSON_TRACK}/${FIRST_LESSON_SLUG}#lab`;

/** In-page Practice CTA — same SQL lab as the hero / StartHere door. */
export const STARTER_PRACTICE_HREF = FIRST_LESSON_HREF;

export const PRACTICE_HREF = "/practice";
export const PATHS_HREF = "/paths";
export const ZERO_TO_HERO_HREF = "/paths/zero-to-hero";

export function firstLessonHref(): string {
  return FIRST_LESSON_HREF;
}

/** Strip catalog / filename-style prefixes from titles shown in listings (Q16). */
export function displayLessonTitle(title: string): string {
  return title.replace(/^\s*(?:lesson\s*)?\d+[\.\)\:\-]\s+/i, "").trim();
}

export type PathSpineStep = {
  track: string;
  slug: string;
  title: string;
  level: string;
  lab?: boolean;
};

/** Required Zero→Hero nodes used for Continue / next-step (existing slugs only). */
export const ZERO_TO_HERO_SPINE: PathSpineStep[] = [
  {
    track: "sql",
    slug: "sql-select-filter-nulls",
    title: "SELECT, filters, NULLs, and LIMIT",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-patterns-aliases-case",
    title: "LIKE, IN, BETWEEN, aliases, and CASE",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-aggregates-group-having",
    title: "Aggregates, GROUP BY, and HAVING",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-joins-set-logic-recap",
    title: "DE joins & set-logic recap",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-exists-any-all",
    title: "EXISTS, ANY, and ALL as set filters",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-ddl-constraints",
    title: "Tables, constraints, and indexes",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-dml-write-path",
    title: "INSERT, UPDATE, DELETE on staging",
    level: "L1",
    lab: true,
  },
  {
    track: "sql",
    slug: "sql-dates-injection",
    title: "Warehouse dates and injection-safe filters",
    level: "L1",
    lab: true,
  },
  {
    track: "python",
    slug: "python-none-dicts-rows",
    title: "None, dicts, and pipeline rows",
    level: "L2",
    lab: true,
  },
];

/** Prompt D L1 closed loop — display / next-route order only. Slugs and files stay put. */
export const L1_SQL_SLUGS = [
  "sql-select-filter-nulls",
  "sql-patterns-aliases-case",
  "sql-aggregates-group-having",
  "sql-joins-set-logic-recap",
  "sql-exists-any-all",
  "sql-ddl-constraints",
  "sql-dml-write-path",
  "sql-dates-injection",
] as const;

export type L1SqlSlug = (typeof L1_SQL_SLUGS)[number];

export const L1_SQL_SPINE: PathSpineStep[] = ZERO_TO_HERO_SPINE.filter((s) => s.level === "L1");

export function isL1SqlSlug(slug: string): slug is L1SqlSlug {
  return (L1_SQL_SLUGS as readonly string[]).includes(slug);
}

export function spineLessonHref(step: PathSpineStep): string {
  return `/training/${step.track}/${step.slug}${step.lab ? "#lab" : ""}`;
}

/** Prev/next inside the L1 SQL loop. Last L1 continues to L2 Python — not windows / SCD / ETL. */
export function l1SqlNeighbors(slug: string): {
  prev?: PathSpineStep;
  next?: PathSpineStep;
} {
  const idx = L1_SQL_SPINE.findIndex((s) => s.slug === slug);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? L1_SQL_SPINE[idx - 1] : undefined,
    next:
      idx < L1_SQL_SPINE.length - 1
        ? L1_SQL_SPINE[idx + 1]
        : ZERO_TO_HERO_SPINE.find((s) => s.level === "L2"),
  };
}

/** SQL track cards / outline: L1 pedagogical block first, then remaining catalog `order`. */
export function sortLessonsForDisplay<T extends { track: string; slug: string; order: number }>(
  lessons: T[],
): T[] {
  if (lessons.length === 0) return [];
  if (lessons[0].track !== "sql") {
    return [...lessons].sort((a, b) => a.order - b.order);
  }
  const rank = new Map<string, number>(L1_SQL_SLUGS.map((s, i) => [s, i]));
  return [...lessons].sort((a, b) => {
    const ar = rank.get(a.slug);
    const br = rank.get(b.slug);
    if (ar !== undefined && br !== undefined) return ar - br;
    if (ar !== undefined) return -1;
    if (br !== undefined) return 1;
    return a.order - b.order;
  });
}

export type ZeroToHeroLevel = {
  id: string;
  name: string;
  blurb: string;
  href: string;
  hrefLabel: string;
};

/** Outline for the /paths stub — links existing training only. */
export const ZERO_TO_HERO_LEVELS: ZeroToHeroLevel[] = [
  {
    id: "L0",
    name: "Fundamentals",
    blurb: "Files vs tables, CLI comfort, first Git concepts. Prompt Engineering is optional here.",
    href: "/training/git/git-rebase-vs-merge",
    hrefLabel: "Open Git concepts",
  },
  {
    id: "L1",
    name: "SQL",
    blurb: "SELECT through joins and a staging filter — the Zero→Hero front door.",
    href: FIRST_LESSON_HREF,
    hrefLabel: "Open the SQL lab",
  },
  {
    id: "L2",
    name: "Python",
    blurb: "Dicts and rows → functions → pathlib → exceptions → logging a job.",
    href: "/training/python/python-none-dicts-rows#lab",
    hrefLabel: "Open the Python lab",
  },
  {
    id: "L3",
    name: "ETL / ELT",
    blurb: "Incremental load, DQ gates, and one builder on a tool you already know.",
    href: "/training/sql/sql-staging-mart-etl",
    hrefLabel: "Open staging→mart ETL",
  },
  {
    id: "L4",
    name: "Cloud warehouse",
    blurb: "Snowflake objects, COPY/stages, and one warehouse-shaped ETL.",
    href: "/training/snowflake/sf-day0-objects#lab",
    hrefLabel: "Open Snowflake day-0",
  },
  {
    id: "L5",
    name: "Spark / DBX",
    blurb: "Spark SQL, Delta, medallion, and one Job-shaped builder.",
    href: "/training/databricks/dbx-spark-select-nulls#lab",
    hrefLabel: "Open the Databricks lab",
  },
  {
    id: "L6",
    name: "Projects",
    blurb: "Shared orders→revenue mart plus a tool capstone. FDE is an elective after you can ship a mart.",
    href: "/training/sql/sql-shared-capstone-checklist",
    hrefLabel: "Open the shared capstone",
  },
];

export type ProgressLessonPatch = {
  completed?: boolean;
  stepIndex?: number;
  updatedAt?: string;
};

export type NextStep = {
  href: string;
  title: string;
  eyebrow: string;
  cta: string;
  isContinue: boolean;
};

export function lessonProgressKey(track: string, slug: string): string {
  return `${track}:${slug}`;
}

export function hasLearnerProgress(
  lessons: Record<string, ProgressLessonPatch | undefined>,
): boolean {
  return Object.values(lessons).some(
    (p) => Boolean(p?.completed) || (p?.stepIndex ?? 0) > 0,
  );
}

function spineHref(step: PathSpineStep): string {
  return `/training/${step.track}/${step.slug}${step.lab ? "#lab" : ""}`;
}

export function resolveNextStep(
  lessons: Record<string, ProgressLessonPatch | undefined>,
): NextStep {
  if (!hasLearnerProgress(lessons)) {
    return {
      href: FIRST_LESSON_HREF,
      title: "SELECT, filters, NULLs, and LIMIT",
      eyebrow: "Start Zero→Hero",
      cta: "Open the SQL lab",
      isContinue: false,
    };
  }

  for (const step of ZERO_TO_HERO_SPINE) {
    const p = lessons[lessonProgressKey(step.track, step.slug)];
    if (!p?.completed) {
      return {
        href: spineHref(step),
        title: step.title,
        eyebrow: `Continue · ${step.level}`,
        cta: "Continue",
        isContinue: true,
      };
    }
  }

  const latest = Object.entries(lessons)
    .filter(([, p]) => p)
    .sort((a, b) => (b[1]?.updatedAt || "").localeCompare(a[1]?.updatedAt || ""))[0];

  if (latest) {
    const [key] = latest;
    const sep = key.indexOf(":");
    const track = key.slice(0, sep);
    const slug = key.slice(sep + 1);
    const known = ZERO_TO_HERO_SPINE.find((s) => s.track === track && s.slug === slug);
    return {
      href: `/training/${track}/${slug}`,
      title: known?.title ?? "Keep going",
      eyebrow: "Continue",
      cta: "Continue",
      isContinue: true,
    };
  }

  return {
    href: FIRST_LESSON_HREF,
    title: "SELECT, filters, NULLs, and LIMIT",
    eyebrow: "Start Zero→Hero",
    cta: "Open the SQL lab",
    isContinue: false,
  };
}

export type PracticeDialectId = "sql" | "sql-dbx" | "sql-sf" | "python";

export const PRACTICE_DIALECTS = [
  {
    id: "sql" as const,
    label: "sql",
    href: "/practice",
    track: "sql",
    slug: "sql-select-filter-nulls",
    lessonHref: "/training/sql/sql-select-filter-nulls#lab",
  },
  {
    id: "sql-dbx" as const,
    label: "sql-dbx",
    href: "/practice?dialect=sql-dbx",
    track: "databricks",
    slug: "dbx-spark-select-nulls",
    lessonHref: "/training/databricks/dbx-spark-select-nulls#lab",
  },
  {
    id: "sql-sf" as const,
    label: "sql-sf",
    href: "/practice?dialect=sql-sf",
    track: "snowflake",
    slug: "sf-select-filter-nulls",
    lessonHref: "/training/snowflake/sf-select-filter-nulls#lab",
  },
  {
    id: "python" as const,
    label: "python",
    href: "/practice?dialect=python",
    track: "python",
    slug: "python-none-dicts-rows",
    lessonHref: "/training/python/python-none-dicts-rows#lab",
  },
] as const;

export function practiceDeskForDialect(raw?: string | null) {
  const id = (PRACTICE_DIALECTS.find((d) => d.id === raw)?.id ?? "sql") as PracticeDialectId;
  return PRACTICE_DIALECTS.find((d) => d.id === id)!;
}

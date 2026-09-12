/** Zero→Hero front door (Prompt A). PE is an elective, not the first lesson. */
export const FIRST_LESSON_TRACK = "sql";
export const FIRST_LESSON_SLUG = "sql-select-filter-nulls";
export const FIRST_LESSON_HREF = `/training/${FIRST_LESSON_TRACK}/${FIRST_LESSON_SLUG}#lab`;

/** In-page Practice CTA — same SQL lab as the hero / StartHere door. */
export const STARTER_PRACTICE_HREF = FIRST_LESSON_HREF;

export const PRACTICE_HREF = "/practice";
export const PATHS_HREF = "/paths";
export const ZERO_TO_HERO_HREF = "/paths/zero-to-hero";
/** Dedicated L1 mastery finish screen (Prompt F). Not a new lesson slug. */
export const L1_FINISH_HREF = "/paths/l1-complete";
export const L1_FINISH_TITLE = "L1 SQL trophy";
export const L2_PYTHON_HREF = "/training/python/python-none-dicts-rows#lab";

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

export function isL1Mastered(
  lessons: Record<string, { completed?: boolean } | undefined>,
): boolean {
  return L1_SQL_SLUGS.every((slug) => lessons[lessonProgressKey("sql", slug)]?.completed);
}

export function remainingL1Slugs(
  lessons: Record<string, { completed?: boolean } | undefined>,
): string[] {
  return L1_SQL_SLUGS.filter((slug) => !lessons[lessonProgressKey("sql", slug)]?.completed);
}

/** Prev/next inside the L1 SQL loop. Last L1 lands on the Prompt F trophy — not windows / SCD / ETL. */
export function l1SqlNeighbors(slug: string): {
  prev?: PathSpineStep;
  next?: PathSpineStep;
  finishHref?: string;
  finishTitle?: string;
} {
  const idx = L1_SQL_SPINE.findIndex((s) => s.slug === slug);
  if (idx < 0) return {};
  if (idx < L1_SQL_SPINE.length - 1) {
    return {
      prev: idx > 0 ? L1_SQL_SPINE[idx - 1] : undefined,
      next: L1_SQL_SPINE[idx + 1],
    };
  }
  return {
    prev: idx > 0 ? L1_SQL_SPINE[idx - 1] : undefined,
    finishHref: L1_FINISH_HREF,
    finishTitle: L1_FINISH_TITLE,
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

export type PathLevelId = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";

export type PathOutlineNode = {
  track: string;
  slug: string;
  title: string;
  lab?: boolean;
  elective?: boolean;
};

export type ZeroToHeroLevel = {
  id: PathLevelId;
  name: string;
  blurb: string;
  href: string;
  hrefLabel: string;
  nodes: PathOutlineNode[];
};

export function pathNodeHref(node: PathOutlineNode): string {
  return `/training/${node.track}/${node.slug}${node.lab ? "#lab" : ""}`;
}

export function levelById(id: string): ZeroToHeroLevel | undefined {
  return ZERO_TO_HERO_LEVELS.find((level) => level.id === id);
}

/** Independent skill path — not a Zero→Hero gate and not L0's only door. */
export const GIT_SKILL_PATH = {
  id: "git",
  name: "Git",
  blurb: "Rebase, hygiene, and Play Lab. A skill path — not a Hero gate.",
  href: "/training/git/git-rebase-vs-merge",
  hrefLabel: "Open Git concepts",
} as const;

/** Outline for /paths — existing slugs only. FDE is an L6 elective node. */
export const ZERO_TO_HERO_LEVELS: ZeroToHeroLevel[] = [
  {
    id: "L0",
    name: "Fundamentals",
    blurb: "Files vs tables and first questions. Prompt Engineering is optional. Git is its own skill path.",
    href: "/training/prompt-engineering/pe-ask-better-questions",
    hrefLabel: "Optional: ask better questions",
    nodes: [
      {
        track: "prompt-engineering",
        slug: "pe-ask-better-questions",
        title: "Ask better questions",
        elective: true,
      },
    ],
  },
  {
    id: "L1",
    name: "SQL",
    blurb: "SELECT through joins and a staging filter — the Zero→Hero front door.",
    href: FIRST_LESSON_HREF,
    hrefLabel: "Open the SQL lab",
    nodes: L1_SQL_SPINE.map((s) => ({
      track: s.track,
      slug: s.slug,
      title: s.title,
      lab: s.lab,
    })),
  },
  {
    id: "L2",
    name: "Python",
    blurb: "Dicts and rows → functions → pathlib → exceptions → logging a job.",
    href: "/training/python/python-none-dicts-rows#lab",
    hrefLabel: "Open the Python lab",
    nodes: [
      { track: "python", slug: "python-none-dicts-rows", title: "None, dicts, and pipeline rows", lab: true },
      { track: "python", slug: "python-functions-pure-transforms", title: "Functions and pure transforms", lab: true },
      { track: "python", slug: "python-pathlib-extracts", title: "pathlib extracts", lab: true },
      { track: "python", slug: "python-exceptions-retries", title: "Exceptions and retries", lab: true },
      { track: "python", slug: "python-logging-not-print", title: "Logging, not print", lab: true },
    ],
  },
  {
    id: "L3",
    name: "ETL / ELT",
    blurb: "Incremental load, DQ gates, and one builder on a tool you already know.",
    href: "/training/sql/sql-staging-mart-etl",
    hrefLabel: "Open staging→mart ETL",
    nodes: [
      { track: "sql", slug: "sql-incremental-loads", title: "Incremental loads" },
      { track: "sql", slug: "sql-data-quality", title: "Data quality checks in SQL" },
      { track: "sql", slug: "sql-staging-mart-etl", title: "Build staging→mart ETL" },
      { track: "python", slug: "python-etl-pipeline-builder", title: "Python ETL pipeline builder" },
    ],
  },
  {
    id: "L4",
    name: "Cloud warehouse",
    blurb: "Snowflake objects, COPY/stages, and one warehouse-shaped ETL.",
    href: "/training/snowflake/sf-day0-objects#lab",
    hrefLabel: "Open Snowflake day-0",
    nodes: [
      { track: "snowflake", slug: "sf-day0-objects", title: "Day-0 objects", lab: true },
      { track: "snowflake", slug: "sf-copy-stages-ingestion", title: "COPY INTO and stages" },
      { track: "snowflake", slug: "sf-warehouse-etl-builder", title: "Warehouse ETL builder" },
    ],
  },
  {
    id: "L5",
    name: "Spark / DBX",
    blurb: "Spark SQL, Delta, medallion, and one Job-shaped builder.",
    href: "/training/databricks/dbx-spark-select-nulls#lab",
    hrefLabel: "Open the Databricks lab",
    nodes: [
      { track: "databricks", slug: "dbx-spark-select-nulls", title: "Spark SQL SELECT and NULLs", lab: true },
      { track: "databricks", slug: "dbx-delta-write-preview", title: "Delta write preview", lab: true },
      { track: "databricks", slug: "dbx-autoloader-ingestion", title: "Autoloader ingestion" },
      { track: "databricks", slug: "dbx-medallion-etl-builder", title: "Build medallion ETL" },
    ],
  },
  {
    id: "L6",
    name: "Projects",
    blurb: "Shared orders→revenue mart plus a tool capstone. FDE is an L6 Elective after you can ship a mart.",
    href: "/training/sql/sql-shared-capstone-checklist",
    hrefLabel: "Open the shared capstone",
    nodes: [
      { track: "sql", slug: "sql-shared-capstone-checklist", title: "Shared capstone checklist" },
      { track: "snowflake", slug: "sf-capstone-dynamic-table-mart", title: "Snowflake Dynamic Table mart" },
      { track: "databricks", slug: "dbx-capstone-medallion-job", title: "Databricks medallion Job capstone" },
      { track: "python", slug: "python-capstone-cli-package", title: "Python CLI package capstone" },
      {
        track: "forward-deployed",
        slug: "fde-capstone-engagement",
        title: "FDE Northwind engagement",
        elective: true,
      },
    ],
  },
  {
    id: "L7",
    name: "Interview",
    blurb: "Talk a pipeline and debug late data with lessons you already have — not a fake interview track.",
    href: "/training/sql/sql-deduping-late-data",
    hrefLabel: "Open late-data debug",
    nodes: [
      { track: "sql", slug: "sql-shared-capstone-checklist", title: "Talk the shared pipeline" },
      { track: "sql", slug: "sql-deduping-late-data", title: "Deduping and late data" },
      { track: "sql", slug: "sql-joins-set-logic-recap", title: "Joins and set-logic recap", lab: true },
    ],
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
      if (step.level === "L2" && isL1Mastered(lessons)) {
        return {
          href: L1_FINISH_HREF,
          title: L1_FINISH_TITLE,
          eyebrow: "L1 complete",
          cta: "Open your trophy",
          isContinue: true,
        };
      }
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

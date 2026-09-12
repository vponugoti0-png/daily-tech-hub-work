import type { TrackId, TrackMeta } from "./types";

export const ELECTIVE_TRACK_IDS: TrackId[] = [
  "prompt-engineering",
  "ai-data-eng",
  "forward-deployed",
];

export const CORE_TRACK_IDS: TrackId[] = [
  "sql",
  "python",
  "databricks",
  "snowflake",
  "git",
];

export function isElectiveTrack(id: string): boolean {
  return ELECTIVE_TRACK_IDS.includes(id as TrackId);
}

export const TRACKS: TrackMeta[] = [
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    blurb: "Ask clearer questions and practice prompts in the browser — not a live model.",
    accent: "from-[#9B5CFF] to-[#FF6B4A]",
    difficulty: "Beginner",
    estimatedHours: 3,
    badge: "Elective",
    pathLevel: "L0 Elective",
  },
  {
    id: "ai-data-eng",
    title: "AI for Data Engineers",
    blurb: "Use AI as a DE copilot, then practice agent prompts locally.",
    accent: "from-[#FF6B4A] to-[#FFD166]",
    difficulty: "Beginner → Intermediate",
    estimatedHours: 3.5,
    badge: "Elective",
    pathLevel: "L0 Elective",
  },
  {
    id: "python",
    title: "Python for Data Engineers",
    blurb: "Rows and functions through a logged job — practice in the local Python lab.",
    accent: "from-[#FFD166] to-[#FF6B4A]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 10,
    pathLevel: "L2 Python",
    orderNote:
      "Recommended reading order (catalog numbers stay put): None/dicts → functions → pathlib extracts → exceptions → datetimes → chunks → logging → then contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL. Local Practice lab (Pyodide, in-browser) lives on the exercise-path lessons.",
  },
  {
    id: "sql",
    title: "SQL for Analytics Engineering",
    blurb: "SELECT through joins on the local lab — the Zero→Hero front door.",
    accent: "from-[#2EE59D] to-[#4CC9F0]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 12,
    pathLevel: "L1 SQL",
    orderNote:
      "Recommended reading order (catalog numbers stay put): SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/injection → Joins recap. Then CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL → Catalogs/views/metrics. Local Practice lab lives on the exercise-path lessons, the joins recap, and the catalog lesson.",
  },
  {
    id: "databricks",
    title: "Databricks (DBX)",
    blurb: "Spark SQL and Delta on a local lakehouse sample — not a live workspace.",
    accent: "from-[#FF6B4A] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 13,
    pathLevel: "L5 Spark",
    orderNote:
      "Recommended reading order (catalog numbers stay put): Spark SQL SELECT → Delta write preview → Gold aggregates → Silver CASE → Semi-joins → Delta contracts → Dates/partitions → then day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone → Catalogs/views/metrics. Local Practice lab lives on the exercise-path lessons, day-0 / lakehouse, Unity Catalog, and the catalog lesson.",
  },
  {
    id: "snowflake",
    title: "Snowflake",
    blurb: "Warehouse objects and COPY-shaped SQL on a local sample — not a live account.",
    accent: "from-[#4CC9F0] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 12.5,
    pathLevel: "L4 Warehouse",
    orderNote:
      "Recommended reading order (catalog numbers stay put): SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/Time Travel → then day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone → Catalogs/views/metrics. Local Practice lab lives on the exercise-path lessons, day-0 / architecture, and the catalog lesson.",
  },
  {
    id: "forward-deployed",
    title: "Forward Deployed Engineer",
    blurb: "Customer-facing delivery for DE/AI platforms — after you can ship a mart.",
    accent: "from-[#FF6B4A] to-[#2EE59D]",
    difficulty: "Intermediate",
    estimatedHours: 7.5,
    badge: "Elective",
    pathLevel: "L6 Elective",
  },
  {
    id: "git",
    title: "Git (bonus)",
    blurb: "Rebase, hygiene, and an in-browser commit graph — a skill path, not a Hero gate.",
    accent: "from-[#A9A3C2] to-[#5C5675]",
    difficulty: "Intermediate",
    estimatedHours: 3,
    badge: "Skill path",
    pathLevel: "Skill path",
    orderNote:
      "Cheat sheet → Try it → Git Play Lab on every lesson. Levels: commit/branch → merge/rebase → relative refs → cherry-pick → remotes (fetch/rebase origin). No GitHub push.",
  },
];

export const PRIMARY_TRACKS = TRACKS.filter((t) => t.id !== "git");

export const CORE_TRACKS = CORE_TRACK_IDS.map(
  (id) => TRACKS.find((t) => t.id === id)!,
);

export const ELECTIVE_TRACKS = ELECTIVE_TRACK_IDS.map(
  (id) => TRACKS.find((t) => t.id === id)!,
);

export function getTrackMeta(id: string): TrackMeta | undefined {
  return TRACKS.find((t) => t.id === id);
}

export const TRACK_IDS: TrackId[] = TRACKS.map((t) => t.id);

export const CERT_PATH: TrackId[] = [
  "prompt-engineering",
  "ai-data-eng",
  "python",
  "sql",
  "snowflake",
  "databricks",
  "forward-deployed",
  "git",
];

/** Optional overlay copy — kept for dashboard / docs. Not shown on the Learn hub. */
export const META_DE_OVERLAY = {
  eyebrow: "Meta DE path · optional overlay",
  title: "Suggested cert-style order (no new nav)",
  blurb:
    "Use the tracks you already have. Overnight spine: W0 recommended-order overlay → W1–W4 waves → Practice labs (Databricks + Snowflake + SQL DuckDB labs; Python Pyodide lab on the exercise path; Prompt Engineering / AI-for-DE Local practice) → exercise-path siblings → Build ETL on each tool track → Forward Deployed Engineer → Git Play Lab (in-browser graph + CLI). Suggested cert-style order: Prompt Engineering → AI for DE → Python → SQL → Snowflake → Databricks → Forward Deployed Engineer → Git.",
  sqlOrder:
    "SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/injection → Joins recap. Then CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL → Catalogs/views/metrics",
  pythonOrder:
    "None/dicts → functions → pathlib → exceptions → datetimes → chunks → logging → then contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL",
  databricksOrder:
    "Spark SQL SELECT → Delta write preview → Gold aggregates → Silver CASE → Semi-joins → Delta contracts → Dates/partitions → then day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone → Catalogs/views/metrics",
  snowflakeOrder:
    "SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/Time Travel → then day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone → Catalogs/views/metrics",
  etlSpine: "Build ETL · Python job → SQL staging→mart → DBX medallion → Snowflake COPY/Stream/DT",
};

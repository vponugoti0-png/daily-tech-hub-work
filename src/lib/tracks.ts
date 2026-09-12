import type { TrackId, TrackMeta } from "./types";

export const TRACKS: TrackMeta[] = [
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    blurb:
      "Ask better questions, structure prompts, iterate, verify, and stay safe — beginner-friendly AI skills. Includes a DE role prompt library for on-call, PRs, and incidents.",
    accent: "from-[#9B5CFF] to-[#FF6B4A]",
    difficulty: "Beginner",
    estimatedHours: 3,
    badge: "New · Free",
  },
  {
    id: "ai-data-eng",
    title: "AI for Data Engineers",
    blurb:
      "Use AI as a DE copilot: debug, generate SQL/Python safely, then practice with agents and Cortex functions, plus generic / Databricks Assistant-shaped tool calling.",
    accent: "from-[#FF6B4A] to-[#FFD166]",
    difficulty: "Beginner → Intermediate",
    estimatedHours: 3.5,
    badge: "New · Free",
  },
  {
    id: "python",
    title: "Python for Data Engineers",
    blurb:
      "Exercise path (None/dicts → functions → pathlib → exceptions → datetimes → chunks → logging) plus ETL utilities, typing, testing, and a Build ETL job. Copyable examples only — no Python runtime lab.",
    accent: "from-[#FFD166] to-[#FF6B4A]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 10,
    orderNote:
      "Recommended reading order (catalog numbers stay put): None/dicts → functions → pathlib extracts → exceptions → datetimes → chunks → logging → then contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL. Copyable examples only — no Python runtime lab.",
  },
  {
    id: "sql",
    title: "SQL for Analytics Engineering",
    blurb:
      "Aurora SQL exercise path (SELECT through DDL/dates), joins recap, windows, incrementals, DQ gates, and a Build staging→mart ETL. Practice SQL in the local lab on the exercise-path lessons.",
    accent: "from-[#2EE59D] to-[#4CC9F0]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 11.5,
    orderNote:
      "Recommended reading order (catalog numbers stay put): SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/injection → Joins recap. Then CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL. Local Practice lab lives on the exercise-path lessons and the joins recap.",
  },
  {
    id: "databricks",
    title: "Databricks (DBX)",
    blurb:
      "Exercise path (Spark SQL SELECT → Delta preview → gold aggregates → silver CASE → leftovers → contracts → dates) plus workspace day-0, lakehouse, Autoloader, and a Build medallion ETL. Practice SQL in the local lab on exercise-path and day-0 / lakehouse lessons.",
    accent: "from-[#FF6B4A] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 12.5,
    orderNote:
      "Recommended reading order (catalog numbers stay put): Spark SQL SELECT → Delta write preview → Gold aggregates → Silver CASE → Semi-joins → Delta contracts → Dates/partitions → then day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone. Local Practice lab lives on the exercise-path lessons and day-0 / lakehouse.",
  },
  {
    id: "snowflake",
    title: "Snowflake",
    blurb:
      "Exercise path (SELECT → DML preview → aggregates → CASE → EXISTS → DDL → dates) plus day-0 objects, COPY/stages, Streams & Tasks, Dynamic Tables, and a Build warehouse ETL. Practice SQL in the local lab on exercise-path and day-0 / architecture lessons.",
    accent: "from-[#4CC9F0] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 12,
    orderNote:
      "Recommended reading order (catalog numbers stay put): SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/Time Travel → then day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone. Local Practice lab lives on the exercise-path lessons and day-0 / architecture.",
  },
  {
    id: "forward-deployed",
    title: "Forward Deployed Engineer",
    blurb:
      "Customer-facing delivery for DE/AI platforms — discover, scope, integrate, deploy, secure, hand off.",
    accent: "from-[#FF6B4A] to-[#2EE59D]",
    difficulty: "Intermediate",
    estimatedHours: 7.5,
    badge: "New · Free",
  },
  {
    id: "git",
    title: "Git (bonus)",
    blurb: "Rebase, hygiene, bisect, dbt/SQL branching, and PR templates for data diffs.",
    accent: "from-[#A9A3C2] to-[#5C5675]",
    difficulty: "Intermediate",
    estimatedHours: 2.5,
  },
];

export const PRIMARY_TRACKS = TRACKS.filter((t) => t.id !== "git");

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

/** Optional overlay copy — not a nav item. Same order as CERT_PATH. */
export const META_DE_OVERLAY = {
  eyebrow: "Meta DE path · optional overlay",
  title: "Suggested cert-style order (no new nav)",
  blurb:
    "Use the tracks you already have. Overnight spine: W0 recommended-order overlay → W1–W4 waves → Practice labs (Databricks + Snowflake + SQL) → exercise-path siblings (Python copy-only; DBX/SF on the existing DuckDB labs) → Build ETL on each tool track → Forward Deployed Engineer. Suggested cert-style order: Prompt Engineering → AI for DE → Python → SQL → Snowflake → Databricks → Forward Deployed Engineer → Git.",
  sqlOrder:
    "SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/injection → Joins recap. Then CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL",
  pythonOrder:
    "None/dicts → functions → pathlib → exceptions → datetimes → chunks → logging → then contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL",
  databricksOrder:
    "Spark SQL SELECT → Delta write preview → Gold aggregates → Silver CASE → Semi-joins → Delta contracts → Dates/partitions → then day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone",
  snowflakeOrder:
    "SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/Time Travel → then day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone",
  etlSpine: "Build ETL · Python job → SQL staging→mart → DBX medallion → Snowflake COPY/Stream/DT",
};

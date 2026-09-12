import type { TrackId, TrackMeta } from "./types";

export const TRACKS: TrackMeta[] = [
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    blurb:
      "Ask better questions, structure prompts, iterate, verify, and stay safe — beginner-friendly AI skills. Includes a DE role prompt library for on-call, PRs, and incidents. Practice prompts in Local practice (in-browser checklist — not a live Claude/GPT account).",
    accent: "from-[#9B5CFF] to-[#FF6B4A]",
    difficulty: "Beginner",
    estimatedHours: 3,
    badge: "New · Free",
  },
  {
    id: "ai-data-eng",
    title: "AI for Data Engineers",
    blurb:
      "Use AI as a DE copilot: debug, generate SQL/Python safely, then practice with agents and Cortex functions, plus generic / Databricks Assistant-shaped tool calling. Local practice scores prompts in-browser — Copy remains the fallback for a live tool.",
    accent: "from-[#FF6B4A] to-[#FFD166]",
    difficulty: "Beginner → Intermediate",
    estimatedHours: 3.5,
    badge: "New · Free",
  },
  {
    id: "python",
    title: "Python for Data Engineers",
    blurb:
      "Exercise path (None/dicts → functions → pathlib → exceptions → datetimes → chunks → logging) plus ETL utilities, typing, testing, and a Build ETL job. Practice stdlib + /data CSV/JSON in the local (Pyodide) lab on the exercise path and most depth lessons (contracts, typing, writers, config, orchestration, perf, Build ETL). Packaging, Spark-test fixtures, and the CLI capstone stay copy-to-repo.",
    accent: "from-[#FFD166] to-[#FF6B4A]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 10,
    orderNote:
      "Recommended reading order (catalog numbers stay put): None/dicts → functions → pathlib extracts → exceptions → datetimes → chunks → logging → then contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL. Local Practice lab (Pyodide, in-browser, /data CSV/JSON) lives on the exercise-path lessons plus contracts, typing, writers, config, orchestration, perf, and Build ETL.",
  },
  {
    id: "sql",
    title: "SQL for Analytics Engineering",
    blurb:
      "Aurora SQL exercise path (SELECT through DDL/dates), catalogs/views/metrics on the local lab, joins recap, windows, incrementals, DQ gates, and a Build staging→mart ETL. Practice SQL in the local lab on the exercise-path and catalog lessons.",
    accent: "from-[#2EE59D] to-[#4CC9F0]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 12,
    orderNote:
      "Recommended reading order (catalog numbers stay put): SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/injection → Joins recap. Then CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL → Catalogs/views/metrics. Local Practice lab lives on the exercise-path lessons, the joins recap, and the catalog lesson.",
  },
  {
    id: "databricks",
    title: "Databricks (DBX)",
    blurb:
      "Exercise path (Spark SQL SELECT → Delta preview → gold aggregates → silver CASE → leftovers → contracts → dates) plus workspace day-0, lakehouse, Autoloader, catalogs/views/metrics, and a Build medallion ETL. Practice SQL in the local lab on exercise-path, day-0 / lakehouse, Unity Catalog, and catalog lessons.",
    accent: "from-[#FF6B4A] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 13,
    orderNote:
      "Recommended reading order (catalog numbers stay put): Spark SQL SELECT → Delta write preview → Gold aggregates → Silver CASE → Semi-joins → Delta contracts → Dates/partitions → then day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone → Catalogs/views/metrics. Local Practice lab lives on the exercise-path lessons, day-0 / lakehouse, Unity Catalog, and the catalog lesson.",
  },
  {
    id: "snowflake",
    title: "Snowflake",
    blurb:
      "Exercise path (SELECT → DML preview → aggregates → CASE → EXISTS → DDL → dates) plus day-0 objects, COPY/stages, Streams & Tasks, Dynamic Tables, catalogs/views/metrics, and a Build warehouse ETL. Practice SQL in the local lab on exercise-path, day-0 / architecture, and catalog lessons.",
    accent: "from-[#4CC9F0] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 12.5,
    orderNote:
      "Recommended reading order (catalog numbers stay put): SELECT/filters → DML → Aggregates → Patterns/CASE → EXISTS → DDL → Dates/Time Travel → then day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone → Catalogs/views/metrics. Local Practice lab lives on the exercise-path lessons, day-0 / architecture, and the catalog lesson.",
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
    blurb:
      "Rebase, hygiene, bisect, dbt/SQL branching, and PR templates — plus an in-browser Git Play Lab (commit graph + CLI). No practice VM.",
    accent: "from-[#A9A3C2] to-[#5C5675]",
    difficulty: "Intermediate",
    estimatedHours: 3,
    badge: "Play Lab",
    orderNote:
      "Cheat sheet → Try it → Git Play Lab on every lesson. Levels: commit/branch → merge/rebase → relative refs → cherry-pick → remotes (fetch/rebase origin). No GitHub push.",
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
    "Use the tracks you already have. Overnight spine: W0 recommended-order overlay → W1–W4 waves → Practice labs (Databricks + Snowflake + SQL DuckDB labs; Python Pyodide lab on the exercise path plus contracts / typing / writers / config / orchestration / perf / Build ETL; Prompt Engineering / AI-for-DE Local practice) → exercise-path siblings → Build ETL on each tool track → Forward Deployed Engineer → Git Play Lab (in-browser graph + CLI). Suggested cert-style order: Prompt Engineering → AI for DE → Python → SQL → Snowflake → Databricks → Forward Deployed Engineer → Git.",
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

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
      "ETL utilities, typing, testing, orchestration patterns, and PySpark-ready transforms. Recommended order: contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging.",
    accent: "from-[#FFD166] to-[#FF6B4A]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 6.5,
    orderNote:
      "Recommended reading order (catalog numbers stay put): contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging. Finish with the CLI + tests + package capstone.",
  },
  {
    id: "sql",
    title: "SQL for Analytics Engineering",
    blurb:
      "Joins recap, windows, incrementals, performance, modeling, and warehouse-ready patterns. Recommended order: CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured.",
    accent: "from-[#2EE59D] to-[#4CC9F0]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 8,
    orderNote:
      "Recommended reading order (catalog numbers stay put): CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured. Start with DE joins & set-logic recap if you want a true-zero warmup.",
  },
  {
    id: "databricks",
    title: "Databricks (DBX)",
    blurb:
      "Workspace day-0, lakehouse fundamentals, Delta Lake, Unity Catalog, jobs, Autoloader, and Spark SQL at scale.",
    accent: "from-[#FF6B4A] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 9,
  },
  {
    id: "snowflake",
    title: "Snowflake",
    blurb:
      "Databases & warehouses day-0, Time Travel, Dynamic Tables, Streams & Tasks, COPY/stages, governance, and cost control.",
    accent: "from-[#4CC9F0] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 8.5,
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
    "Use the tracks you already have. Suggested path: Prompt Engineering → AI for DE → Python → SQL → Snowflake → Databricks → Forward Deployed Engineer → Git. SQL and Python also have recommended reading orders on their track pages (different from catalog numbers).",
  sqlOrder: "CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured",
  pythonOrder:
    "contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging",
};

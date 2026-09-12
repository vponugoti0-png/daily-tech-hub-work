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
      "ETL utilities, typing, testing, orchestration patterns, and a Build ETL job that wires extract → transform → load. Recommended order: contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL.",
    accent: "from-[#FFD166] to-[#FF6B4A]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 7,
    orderNote:
      "Recommended reading order (catalog numbers stay put): contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL. Finish with the CLI + tests + package capstone.",
  },
  {
    id: "sql",
    title: "SQL for Analytics Engineering",
    blurb:
      "Joins recap, windows, incrementals, DQ gates, and a Build staging→mart ETL. Recommended order: CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL.",
    accent: "from-[#2EE59D] to-[#4CC9F0]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 8.5,
    orderNote:
      "Recommended reading order (catalog numbers stay put): CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL. Start with DE joins & set-logic recap if you want a true-zero warmup.",
  },
  {
    id: "databricks",
    title: "Databricks (DBX)",
    blurb:
      "Workspace day-0, lakehouse, Delta, Autoloader, and a Build medallion ETL (bronze→silver→gold). Practice SQL in the local lab on day-0 / lakehouse lessons.",
    accent: "from-[#FF6B4A] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 9.5,
    orderNote:
      "Recommended reading order (catalog numbers stay put): day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone. Local Practice lab lives on day-0 and lakehouse lessons.",
  },
  {
    id: "snowflake",
    title: "Snowflake",
    blurb:
      "Day-0 objects, COPY/stages, Streams & Tasks, Dynamic Tables, and a Build warehouse ETL that wires them together. Practice SQL in the local lab on day-0 / architecture lessons.",
    accent: "from-[#4CC9F0] to-[#9B5CFF]",
    difficulty: "Beginner → Advanced",
    estimatedHours: 9,
    orderNote:
      "Recommended reading order (catalog numbers stay put): day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone. Local Practice lab lives on day-0 and architecture lessons.",
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
  "git",
];

/** Optional overlay copy — not a nav item. Same order as CERT_PATH. */
export const META_DE_OVERLAY = {
  eyebrow: "Meta DE path · optional overlay",
  title: "Suggested cert-style order (no new nav)",
  blurb:
    "Use the tracks you already have. Overnight spine: W0 recommended-order overlay → W1–W4 waves → Practice labs (Databricks + Snowflake) → Build ETL on each tool track. Suggested cert-style order: Prompt Engineering → AI for DE → Python → SQL → Snowflake → Databricks → Git. A Forward-Deployed Engineer track is not on main yet — do not invent a new nav item for it.",
  sqlOrder:
    "CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL",
  pythonOrder:
    "contracts → config/secrets → typing → testing → writers → orchestration → perf → packaging → Build ETL",
  databricksOrder:
    "day-0 workspace → lakehouse → Delta → Autoloader → Build medallion ETL → Jobs / DLT → Job capstone",
  snowflakeOrder:
    "day-0 objects → architecture → COPY/stages → Streams & Tasks or Dynamic Tables → Build warehouse ETL → DT capstone",
  etlSpine: "Build ETL · Python job → SQL staging→mart → DBX medallion → Snowflake COPY/Stream/DT",
};

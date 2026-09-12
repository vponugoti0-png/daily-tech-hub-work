#!/usr/bin/env node
/**
 * Generates substantial v2 training markdown for python, sql, databricks, snowflake.
 * Keeps git track as-is (bonus). Overwrites existing python/sql lessons with richer set.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WAVE_FILES_BY_TRACK } from "./wave-lessons.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "content", "training");

function yamlList(arr, indent = 2) {
  const pad = " ".repeat(indent);
  return arr.map((x) => `${pad}- ${JSON.stringify(x)}`).join("\n");
}

function yamlQuiz(quiz) {
  if (!quiz?.length) return "";
  const lines = ["quiz:"];
  for (const q of quiz) {
    lines.push(`  - question: ${JSON.stringify(q.question)}`);
    lines.push(`    options:`);
    for (const o of q.options) lines.push(`      - ${JSON.stringify(o)}`);
    lines.push(`    answer: ${q.answer}`);
    if (q.explanation) lines.push(`    explanation: ${JSON.stringify(q.explanation)}`);
  }
  return lines.join("\n");
}

function yamlCheat(sheet) {
  if (!sheet?.length) return "";
  const lines = ["cheatSheet:"];
  for (const e of sheet) {
    lines.push(`  - label: ${JSON.stringify(e.label)}`);
    lines.push(`    code: ${JSON.stringify(e.code)}`);
    if (e.note) lines.push(`    note: ${JSON.stringify(e.note)}`);
  }
  return lines.join("\n");
}

function writeLesson(track, file, data) {
  const dir = path.join(root, track);
  fs.mkdirSync(dir, { recursive: true });
  const fm = [
    "---",
    `slug: ${data.slug}`,
    `track: ${track}`,
    `title: ${JSON.stringify(data.title)}`,
    `description: ${JSON.stringify(data.description)}`,
    `level: ${data.level}`,
    `order: ${data.order}`,
    `durationMinutes: ${data.durationMinutes}`,
    `topics: [${data.topics.join(", ")}]`,
    "objectives:",
    ...data.objectives.map((o) => `  - ${JSON.stringify(o)}`),
    `updatedAt: "2026-09-11"`,
    yamlCheat(data.cheatSheet),
    yamlQuiz(data.quiz),
    "---",
    "",
    data.body.trim(),
    "",
  ]
    .filter((l) => l !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  // Fix empty lines from missing optional blocks
  const cleaned = [
    "---",
    `slug: ${data.slug}`,
    `track: ${track}`,
    `title: ${JSON.stringify(data.title)}`,
    `description: ${JSON.stringify(data.description)}`,
    `level: ${data.level}`,
    `order: ${data.order}`,
    `durationMinutes: ${data.durationMinutes}`,
    `topics: [${data.topics.join(", ")}]`,
    "objectives:",
    ...data.objectives.map((o) => `  - ${JSON.stringify(o)}`),
    `updatedAt: "2026-09-11"`,
  ];
  if (data.cheatSheet?.length) {
    cleaned.push("cheatSheet:");
    for (const e of data.cheatSheet) {
      cleaned.push(`  - label: ${JSON.stringify(e.label)}`);
      cleaned.push(`    code: ${JSON.stringify(e.code)}`);
      if (e.note) cleaned.push(`    note: ${JSON.stringify(e.note)}`);
    }
  }
  if (data.quiz?.length) {
    cleaned.push("quiz:");
    for (const q of data.quiz) {
      cleaned.push(`  - question: ${JSON.stringify(q.question)}`);
      cleaned.push(`    options:`);
      for (const o of q.options) cleaned.push(`      - ${JSON.stringify(o)}`);
      cleaned.push(`    answer: ${q.answer}`);
      if (q.explanation) cleaned.push(`    explanation: ${JSON.stringify(q.explanation)}`);
    }
  }
  cleaned.push("---", "", data.body.trim(), "");
  fs.writeFileSync(path.join(dir, file), cleaned.join("\n"));
}

const courses = {
  python: [
    {
      file: "01-dataframe-contracts.md",
      slug: "python-dataframe-contracts",
      title: "DataFrame contracts for ETL utilities",
      description: "Schema-first transforms, pure functions, and late-arriving key handling that ports cleanly to PySpark.",
      level: "beginner",
      order: 1,
      durationMinutes: 30,
      topics: ["python", "pyspark"],
      objectives: [
        "Define explicit column contracts at pipeline boundaries",
        "Write pure transform functions that are unit-testable",
        "Handle unmatched joins without silent data loss",
      ],
      cheatSheet: [
        { label: "Assert columns", code: "missing = set(req) - set(df.columns)", note: "Fail loud" },
        { label: "Latest dedupe", code: "df.sort_values('ts').drop_duplicates('id', keep='last')" },
      ],
      quiz: [
        {
          question: "Why prefer pure transform functions over notebook cells with I/O mixed in?",
          options: [
            "They run faster on GPUs",
            "They are unit-testable and portable to Spark later",
            "They skip schema validation",
            "They auto-partition data",
          ],
          answer: 1,
          explanation: "Pure functions isolate business logic so you can test and later lift to Spark.",
        },
        {
          question: "What should happen when a left join leaves unmatched user_ids?",
          options: [
            "Drop them quietly",
            "Coerce to zero",
            "Track/log the unmatched count and decide explicitly",
            "Always inner-join instead",
          ],
          answer: 2,
        },
      ],
      body: `# DataFrame contracts for ETL utilities

Silent data bugs — wrong joins, dropped nulls, “helpful” coercion — cost more than loud failures. Build **contract-first** ETL utilities.

## Column contracts

\`\`\`python
REQUIRED = ("event_id", "user_id", "ts", "payload")

def assert_columns(df, required=REQUIRED):
    missing = set(required) - set(map(str, df.columns))
    if missing:
        raise ValueError(f"missing columns: {sorted(missing)}")
    return df
\`\`\`

## Pure transforms

Keep I/O at the edges. Business logic should look like:

\`\`\`python
def with_event_date(df):
    out = df.copy()
    out["event_date"] = out["ts"].dt.floor("D")
    return out
\`\`\`

The same shape becomes a Spark \`withColumn\` plan later.

## Late-arriving keys

\`\`\`python
def enrich_users(events, users):
    merged = events.merge(users, on="user_id", how="left", indicator=True)
    unmatched = int((merged["_merge"] == "left_only").sum())
    if unmatched:
        print(f"unmatched_users={unmatched}")  # emit metric in prod
    return merged.drop(columns=["_merge"])
\`\`\`

## Exercises

### Exercise 1 — Schema guard
Implement \`assert_columns\` for pandas or Polars; raise listing missing fields.

**Hint:** Convert columns to a set and subtract.

### Exercise 2 — Deduplicate latest
Given duplicate \`event_id\`, keep the row with the latest \`ts\`.

**Solution sketch:**
\`\`\`python
df.sort_values("ts").drop_duplicates("event_id", keep="last")
\`\`\`
`,
    },
    {
      file: "02-typing-for-pipelines.md",
      slug: "python-typing-for-pipelines",
      title: "Typing for reliable pipelines",
      description: "TypedDicts, Protocols, and gradual typing that make ETL contracts enforceable in CI.",
      level: "intermediate",
      order: 2,
      durationMinutes: 35,
      topics: ["python"],
      objectives: [
        "Model row contracts with TypedDict",
        "Use Protocols for duck-typed DataFrame APIs",
        "Catch schema drift in type-checked helpers",
      ],
      cheatSheet: [
        { label: "TypedDict", code: "class Event(TypedDict): event_id: str; ts: datetime" },
        { label: "Protocol", code: "class FrameLike(Protocol): columns: Sequence[str]" },
      ],
      quiz: [
        {
          question: "TypedDict is best used for…",
          options: [
            "Runtime Spark Catalyst plans",
            "Documenting and statically checking dict-shaped row contracts",
            "Replacing all DataFrames",
            "GPU kernels",
          ],
          answer: 1,
        },
      ],
      body: `# Typing for reliable pipelines

Types won't stop bad data at the warehouse door, but they **shrink the blast radius** of API mistakes and make reviews faster.

## TypedDict row contracts

\`\`\`python
from typing import TypedDict
from datetime import datetime

class RawEvent(TypedDict):
    event_id: str
    user_id: str
    ts: datetime
    payload: dict
\`\`\`

## Protocols for frame-like objects

\`\`\`python
from typing import Protocol, Sequence

class HasColumns(Protocol):
    @property
    def columns(self) -> Sequence[str]: ...

def require(frame: HasColumns, cols: Sequence[str]) -> None:
    missing = set(cols) - set(map(str, frame.columns))
    if missing:
        raise ValueError(sorted(missing))
\`\`\`

## Gradual adoption

1. Annotate public transform signatures first.
2. Add \`mypy\`/\`pyright\` in CI on \`src/transforms\`.
3. Keep runtime asserts for data — types don't validate parquet.

## Exercises

### Exercise 1
Define a \`TypedDict\` for a SCD2 dimension row (\`natural_key\`, \`valid_from\`, \`valid_to\`, \`is_current\`).

### Exercise 2
Write a Protocol that requires \`.select(*cols)\` and use it in a helper signature.
`,
    },
    {
      file: "03-testing-spark-logic.md",
      slug: "python-testing-spark-logic",
      title: "Testing Spark-bound logic in pure Python",
      description: "Extract business rules so you can unit test without a cluster, then pin Spark with tiny fixtures.",
      level: "intermediate",
      order: 3,
      durationMinutes: 40,
      topics: ["python", "pyspark"],
      objectives: [
        "Separate pure rules from Spark I/O",
        "Use pytest fixtures for small DataFrames",
        "Assert on row sets, not printouts",
      ],
      quiz: [
        {
          question: "Best first test for a watermark policy?",
          options: [
            "Full Databricks job on prod",
            "Pure function over timestamps in pytest",
            "Only integration tests",
            "Manual notebook runs",
          ],
          answer: 1,
        },
      ],
      body: `# Testing Spark-bound logic in pure Python

Clusters are slow feedback. Extract rules you can test in milliseconds.

## Pattern

\`\`\`python
def is_late(event_ts, watermark_ts) -> bool:
    return event_ts < watermark_ts

# Spark wrapper stays thin
def filter_late(df, watermark_col="watermark"):
    return df.filter(~F.col("event_ts") < F.col(watermark_col))  # prefer UDF-free expr
\`\`\`

Prefer column expressions over Python UDFs for performance — test the **policy**, implement with Catalyst.

## pytest shape

\`\`\`python
def test_is_late():
    assert is_late(1, 2) is True
    assert is_late(3, 2) is False
\`\`\`

For Spark: use local session fixtures and assert \`collect()\` sets.

## Exercises

### Exercise 1
Implement and test \`business_date(ts, tz)\` that floors to local calendar day.

### Exercise 2
Given duplicates, write a test that expects exactly one survivor per \`event_id\`.
`,
    },
    {
      file: "04-idempotent-writers.md",
      slug: "python-idempotent-writers",
      title: "Idempotent writers & retry-safe loads",
      description: "Design loads that can safely re-run: partitioning, merge keys, and exactly-once *enough* semantics.",
      level: "intermediate",
      order: 4,
      durationMinutes: 35,
      topics: ["python", "sql"],
      objectives: [
        "Choose natural merge keys for upserts",
        "Make retries safe with partition overwrite or MERGE",
        "Emit load metrics for observability",
      ],
      cheatSheet: [
        { label: "Partition overwrite", code: "write(..., mode='overwrite', partitionBy=['dt'])" },
        { label: "Merge key", code: "ON t.id = s.id AND t.dt = s.dt" },
      ],
      quiz: [
        {
          question: "A job crashes after writing half a partition. Safest retry pattern?",
          options: [
            "Append again blindly",
            "Overwrite that partition atomically / MERGE with keys",
            "Delete the whole table",
            "Ignore and continue",
          ],
          answer: 1,
        },
      ],
      body: `# Idempotent writers & retry-safe loads

Orchestrators retry. Your writer must tolerate that.

## Strategies

1. **Partition overwrite** for replaceable daily slices.
2. **MERGE/UPSERT** on business keys for mutable entities.
3. **Staging + swap** when you need all-or-nothing visibility.

\`\`\`python
def write_daily(df, path, dt: str):
    (
      df.filter(f"event_date = '{dt}'")
        .write.mode("overwrite")
        .partitionBy("event_date")
        .parquet(f"{path}")
    )
\`\`\`

## Metrics to emit

- rows_in / rows_out / rows_rejected
- max(event_ts), distinct keys
- duration + bytes written

## Exercises

### Exercise 1
Sketch MERGE SQL for a dim table on \`customer_id\` updating attributes and \`updated_at\`.

### Exercise 2
Explain when append-only + compaction beats overwrite.
`,
    },
    {
      file: "05-config-and-secrets.md",
      slug: "python-config-and-secrets",
      title: "Config, secrets, and environment boundaries",
      description: "12-factor style config for DE jobs: typed settings, secret backends, and no credentials in notebooks.",
      level: "beginner",
      order: 5,
      durationMinutes: 25,
      topics: ["python", "general"],
      objectives: [
        "Load typed config from env",
        "Never commit secrets",
        "Separate prod/staging endpoints cleanly",
      ],
      quiz: [
        {
          question: "Where should warehouse passwords live?",
          options: [
            "In the repo README",
            "Hardcoded in notebooks",
            "Secret manager / CI secrets injected at runtime",
            "Git commit messages",
          ],
          answer: 2,
        },
      ],
      body: `# Config, secrets, and environment boundaries

## Typed settings

\`\`\`python
from pydantic import BaseModel

class Settings(BaseModel):
    warehouse: str
    database: str
    dry_run: bool = False

settings = Settings(
    warehouse=os.environ["WH"],
    database=os.environ["DB"],
    dry_run=os.environ.get("DRY_RUN", "0") == "1",
)
\`\`\`

## Rules

- Secrets via env / secret manager only
- \`DRY_RUN\` flags for safe rehearsals
- Fail startup if required config missing

## Exercises

### Exercise 1
List 5 config values that differ between staging and prod for a Snowflake loader.
`,
    },
    {
      file: "06-orchestration-hooks.md",
      slug: "python-orchestration-hooks",
      title: "Orchestration hooks & job entrypoints",
      description: "CLI entrypoints, exit codes, and heartbeat patterns that play well with Airflow, Dagster, or Databricks Jobs.",
      level: "intermediate",
      order: 6,
      durationMinutes: 30,
      topics: ["python", "general"],
      objectives: [
        "Build a clean \`python -m\` entrypoint",
        "Use exit codes and structured logs",
        "Support backfill date ranges",
      ],
      quiz: [
        {
          question: "Why accept \`--start\` and \`--end\` on a batch job?",
          options: [
            "Only for aesthetics",
            "To enable backfills and reprocessing windows",
            "To disable logging",
            "To skip schema checks",
          ],
          answer: 1,
        },
      ],
      body: `# Orchestration hooks & job entrypoints

\`\`\`python
import argparse, sys

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("--start", required=True)
    p.add_argument("--end", required=True)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args(argv)
    run(args.start, args.end, dry_run=args.dry_run)
    return 0

if __name__ == "__main__":
    sys.exit(main())
\`\`\`

Log JSON lines with \`job\`, \`dt\`, \`status\`, \`rows\` so dashboards parse them.

## Exercises

### Exercise 1
Add a \`--partition\` flag and validate YYYY-MM-DD format.
`,
    },
    {
      file: "07-performance-python-de.md",
      slug: "python-performance-de",
      title: "Performance habits for DE Python",
      description: "Vectorization, chunking, avoiding UDFs, and knowing when to push down to SQL/Spark.",
      level: "advanced",
      order: 7,
      durationMinutes: 40,
      topics: ["python", "pyspark", "sql"],
      objectives: [
        "Prefer vectorized ops over row loops",
        "Chunk large extractions",
        "Know when to push compute to the warehouse",
      ],
      cheatSheet: [
        { label: "Avoid iterrows", code: "df['x'] = df['a'] + df['b']" },
        { label: "Chunk read", code: "pd.read_sql(q, con, chunksize=50_000)" },
      ],
      quiz: [
        {
          question: "Python row loops over millions of rows usually means…",
          options: [
            "Optimal Spark plans",
            "You should vectorize or push down to SQL/Spark",
            "Faster than SQL",
            "Better type safety",
          ],
          answer: 1,
        },
      ],
      body: `# Performance habits for DE Python

1. **Vectorize** with pandas/Polars/numpy.
2. **Push down** filters and aggregates to SQL/Spark.
3. **Chunk** extractions; don't materialize 20GB in RAM.
4. Avoid Python UDFs in Spark when expressions exist.

## Exercise

Profile a slow transform with \`cProfile\` or \`pyinstrument\` and list the top 3 callees.
`,
    },
    {
      file: "08-packaging-de-libs.md",
      slug: "python-packaging-de-libs",
      title: "Packaging shared DE libraries",
      description: "Versioned internal packages, wheels for Jobs, and avoiding notebook copy-paste drift.",
      level: "advanced",
      order: 8,
      durationMinutes: 30,
      topics: ["python", "databricks"],
      objectives: [
        "Structure a sharable transforms package",
        "Pin versions in job environments",
        "Document public APIs",
      ],
      quiz: [
        {
          question: "Copy-pasting transforms across notebooks mainly causes…",
          options: [
            "Faster CI",
            "Drift and inconsistent bugfixes",
            "Better security",
            "Automatic schema evolution",
          ],
          answer: 1,
        },
      ],
      body: `# Packaging shared DE libraries

\`\`\`
src/
  company_de/
    __init__.py
    contracts.py
    transforms/
pyproject.toml
\`\`\`

Publish internal wheels; install in Databricks Job clusters / containers. Semver breaking changes carefully.

## Capstone exercise

Extract two transforms from earlier lessons into a tiny package with tests and a README section.
`,
    },
  ],

  sql: [
    {
      file: "01-window-functions-de.md",
      slug: "sql-window-functions-de",
      title: "Window functions for data engineers",
      description: "RANK, LAG/LEAD, running totals, and sessionization patterns used in warehouses daily.",
      level: "beginner",
      order: 1,
      durationMinutes: 35,
      topics: ["sql"],
      objectives: [
        "Use PARTITION BY / ORDER BY correctly",
        "Build SCD-friendly change detection with LAG",
        "Avoid explosive joins when windows suffice",
      ],
      cheatSheet: [
        { label: "Latest per key", code: "ROW_NUMBER() OVER (PARTITION BY id ORDER BY ts DESC)" },
        { label: "Prev value", code: "LAG(status) OVER (PARTITION BY id ORDER BY ts)" },
      ],
      quiz: [
        {
          question: "ROW_NUMBER vs RANK when ties share the same ORDER BY value?",
          options: [
            "They always match",
            "ROW_NUMBER unique; RANK can repeat with gaps",
            "RANK is always unique",
            "ROW_NUMBER skips numbers",
          ],
          answer: 1,
        },
      ],
      body: `# Window functions for data engineers

\`\`\`sql
SELECT *
FROM (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts DESC) AS rn
  FROM events
) e
WHERE rn = 1;
\`\`\`

## Change detection

\`\`\`sql
LAG(status) OVER (PARTITION BY account_id ORDER BY updated_at) AS prev_status
\`\`\`

## Exercises

1. Sessionize events with 30-minute gaps using LAG + cumulative sum.
2. Compute a 7-day running count of orders per customer.
`,
    },
    {
      file: "02-incremental-loads.md",
      slug: "sql-incremental-loads",
      title: "Incremental loads & watermarks",
      description: "High-water marks, late data, and MERGE patterns for trustworthy daily pipelines.",
      level: "intermediate",
      order: 2,
      durationMinutes: 40,
      topics: ["sql", "snowflake", "databricks"],
      objectives: [
        "Track watermarks safely",
        "Handle late-arriving facts",
        "Write idempotent MERGE statements",
      ],
      quiz: [
        {
          question: "A watermark should generally advance to…",
          options: [
            "MIN(ts) of the batch",
            "A conservative MAX(ts) you can re-read from",
            "Random UUID",
            "NULL always",
          ],
          answer: 1,
        },
      ],
      body: `# Incremental loads & watermarks

\`\`\`sql
MERGE INTO mart.orders t
USING staging.orders_delta s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
\`\`\`

Store \`pipeline_state(job, watermark_ts)\`. On failure, do not advance.

## Exercises

1. Design a late-data window of 2 days overlapping the watermark.
2. Write SQL to detect duplicate natural keys in staging.
`,
    },
    {
      file: "03-performance-basics.md",
      slug: "sql-performance-basics",
      title: "SQL performance basics for warehouses",
      description: "Predicate pushdown, clustering/partition pruning, and reading query profiles without fear.",
      level: "intermediate",
      order: 3,
      durationMinutes: 35,
      topics: ["sql", "snowflake", "databricks"],
      objectives: [
        "Filter early and select only needed columns",
        "Understand pruning vs full scans",
        "Spot broadcast vs shuffle joins at a high level",
      ],
      cheatSheet: [
        { label: "Selectivity", code: "WHERE event_date BETWEEN ... AND ..." },
        { label: "Avoid SELECT *", code: "SELECT id, ts, amount FROM ..." },
      ],
      quiz: [
        {
          question: "Applying a function to a filter column often…",
          options: [
            "Helps pruning",
            "Prevents partition/cluster pruning",
            "Deletes data",
            "Creates indexes automatically",
          ],
          answer: 1,
        },
      ],
      body: `# SQL performance basics for warehouses

- Filter on partition/cluster keys **without wrapping** in functions when possible.
- Project fewer columns — wide rows hurt spill.
- Check query profile: spill, shuffle bytes, pruning %.

## Exercises

1. Rewrite \`WHERE DATE(ts) = CURRENT_DATE\` to a range-friendly predicate.
2. Explain why \`SELECT *\` into a BI tool hurts more than in a tiny ad-hoc query.
`,
    },
    {
      file: "04-dimensional-modeling.md",
      slug: "sql-dimensional-modeling",
      title: "Dimensional modeling essentials",
      description: "Facts, dims, grain, SCD2, and star schemas that analytics teams can trust.",
      level: "intermediate",
      order: 4,
      durationMinutes: 45,
      topics: ["sql"],
      objectives: [
        "Declare grain before writing SQL",
        "Model SCD2 dimensions",
        "Avoid fan-out when joining multiple facts",
      ],
      quiz: [
        {
          question: "Grain answers which question?",
          options: [
            "What is one row?",
            "What is the cluster size?",
            "What is the BI tool?",
            "What is the password?",
          ],
          answer: 0,
        },
      ],
      body: `# Dimensional modeling essentials

**Grain first.** Example: one row per \`order_id\` in \`fct_orders\`.

## SCD2 sketch

\`\`\`sql
-- valid_from, valid_to, is_current on dim_customer
\`\`\`

## Exercises

1. Define grain for a clickstream fact at session vs event level tradeoffs.
2. Write a query to fetch the customer dim version active at order time.
`,
    },
    {
      file: "05-data-quality-sql.md",
      slug: "sql-data-quality",
      title: "Data quality checks in SQL",
      description: "Assertions for nulls, uniqueness, referential integrity, and freshness SLAs.",
      level: "beginner",
      order: 5,
      durationMinutes: 30,
      topics: ["sql", "general"],
      objectives: [
        "Encode DQ tests as SQL",
        "Fail pipelines on critical assertions",
        "Track freshness",
      ],
      quiz: [
        {
          question: "A uniqueness check on order_id should return…",
          options: [
            "Rows that violate uniqueness",
            "The warehouse size",
            "Random samples only",
            "Nothing ever",
          ],
          answer: 0,
        },
      ],
      body: `# Data quality checks in SQL

\`\`\`sql
-- duplicates
SELECT order_id, COUNT(*) c FROM fct_orders GROUP BY 1 HAVING COUNT(*) > 1;

-- freshness
SELECT MAX(updated_at) < DATEADD(hour, -6, CURRENT_TIMESTAMP) AS stale FROM fct_orders;
\`\`\`

## Exercises

1. Write a null check for required columns.
2. Write an orphan check: facts whose dim keys are missing.
`,
    },
    {
      file: "06-ctes-and-readability.md",
      slug: "sql-ctes-readability",
      title: "CTEs, readability, and modular SQL",
      description: "Structure complex pipelines with CTEs, naming, and staged logic reviewers can follow.",
      level: "beginner",
      order: 6,
      durationMinutes: 25,
      topics: ["sql"],
      objectives: [
        "Name CTEs by business meaning",
        "Avoid nested spaghetti subqueries",
        "Document assumptions inline",
      ],
      quiz: [
        {
          question: "Good CTE names look like…",
          options: ["a1, a2, a3", "eligible_orders, enriched_orders", "temp, temp2", "x"],
          answer: 1,
        },
      ],
      body: `# CTEs, readability, and modular SQL

\`\`\`sql
WITH eligible_orders AS (
  SELECT * FROM orders WHERE status = 'paid'
),
enriched AS (
  SELECT o.*, c.region
  FROM eligible_orders o
  JOIN dim_customer c ON c.customer_id = o.customer_id AND c.is_current
)
SELECT region, SUM(amount) FROM enriched GROUP BY 1;
\`\`\`

## Exercise

Refactor a 3-level nested subquery into named CTEs.
`,
    },
    {
      file: "07-semi-structured-sql.md",
      slug: "sql-semi-structured",
      title: "Semi-structured data in SQL",
      description: "JSON/VARIANT/STRUCT access patterns across Snowflake and Spark SQL.",
      level: "advanced",
      order: 7,
      durationMinutes: 35,
      topics: ["sql", "snowflake", "databricks"],
      objectives: [
        "Extract nested fields safely",
        "Flatten arrays with care",
        "Know schema-on-read tradeoffs",
      ],
      cheatSheet: [
        { label: "Snowflake path", code: "payload:user.id::string" },
        { label: "Spark get", code: "payload.user.id" },
      ],
      quiz: [
        {
          question: "Flattening arrays before aggregating often…",
          options: [
            "Can multiply rows — watch grain",
            "Never changes row counts",
            "Deletes duplicates",
            "Creates primary keys",
          ],
          answer: 0,
        },
      ],
      body: `# Semi-structured data in SQL

Prefer projecting needed fields into typed columns for marts. Keep raw VARIANT in landing.

## Exercises

1. Extract \`user.id\` and \`items\` array length from a JSON payload.
2. Explain why repeated flatten+join can fan out revenue.
`,
    },
  ],

  databricks: [
    {
      file: "01-lakehouse-fundamentals.md",
      slug: "dbx-lakehouse-fundamentals",
      title: "Lakehouse fundamentals on Databricks",
      description: "Medallion layout, notebooks vs Jobs, and how the lakehouse differs from classic warehouses.",
      level: "beginner",
      order: 1,
      durationMinutes: 30,
      topics: ["databricks"],
      objectives: [
        "Explain bronze/silver/gold responsibilities",
        "Choose Jobs over ad-hoc notebooks for prod",
        "Locate Unity Catalog objects",
      ],
      cheatSheet: [
        {
          label: "Medallion counts",
          code: "SELECT layer, COUNT(*) AS row_count\nFROM (\n  SELECT 'bronze' AS layer FROM bronze_orders\n  UNION ALL\n  SELECT 'silver' FROM silver_orders\n  UNION ALL\n  SELECT 'gold' FROM gold_daily_orders\n) t\nGROUP BY layer\nORDER BY layer;",
          note: "Run this in the local practice lab on this page — not a live workspace.",
        },
      ],
      quiz: [
        {
          question: "Bronze layers typically store…",
          options: [
            "Only executive dashboards",
            "Raw/lightly cleaned landed data",
            "Only SCD2 dims",
            "Secrets",
          ],
          answer: 1,
        },
      ],
      body: `# Lakehouse fundamentals on Databricks

**Bronze** → raw. **Silver** → cleansed, conformed. **Gold** → business marts.

Use **Databricks Jobs** + versioned code for production; notebooks for exploration.

## Exercises

1. Map 3 of your datasets into medallion layers.
2. List what belongs in Unity Catalog vs DBFS scratch paths.
`,
    },
    {
      file: "02-delta-lake-basics.md",
      slug: "dbx-delta-lake-basics",
      title: "Delta Lake basics",
      description: "ACID tables on object storage: MERGE, Time Travel, OPTIMIZE, and vacuum awareness.",
      level: "intermediate",
      order: 2,
      durationMinutes: 40,
      topics: ["databricks", "sql"],
      objectives: [
        "Create and MERGE into Delta tables",
        "Use Time Travel for debugging",
        "Understand OPTIMIZE/ZORDER tradeoffs",
      ],
      cheatSheet: [
        { label: "Merge", code: "MERGE INTO target t USING src s ON t.id = s.id WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *" },
        { label: "Time travel", code: "SELECT * FROM t TIMESTAMP AS OF '2026-09-01'" },
      ],
      quiz: [
        {
          question: "Delta Time Travel helps you…",
          options: [
            "Delete Unity Catalog",
            "Read prior table versions for audit/rollback",
            "Skip ACID",
            "Avoid partitioning forever",
          ],
          answer: 1,
        },
      ],
      body: `# Delta Lake basics

\`\`\`sql
CREATE TABLE sand.events USING DELTA AS SELECT * FROM landing.events;

MERGE INTO sand.events t
USING updates u ON t.event_id = u.event_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
\`\`\`

\`OPTIMIZE\` + \`ZORDER\` for read locality; \`VACUUM\` carefully with retention.

## Exercises

1. Write a MERGE for CDC with deletes.
2. Query a table as of yesterday and diff counts.
`,
    },
    {
      file: "03-spark-sql-performance.md",
      slug: "dbx-spark-sql-performance",
      title: "Spark SQL performance on DBX",
      description: "Partitioning, file sizes, AQE, and Photon-minded habits for faster jobs.",
      level: "advanced",
      order: 3,
      durationMinutes: 45,
      topics: ["databricks", "pyspark", "sql"],
      objectives: [
        "Target healthy file sizes",
        "Use predicate pushdown and partition filters",
        "Read Spark UI for skew/spill",
      ],
      cheatSheet: [
        {
          label: "Filter early",
          code: "SELECT region, COUNT(*) AS n\nFROM silver_orders\nWHERE order_date >= DATE '2026-09-02'\nGROUP BY region\nORDER BY n DESC;",
          note: "Partition-style filter you can run in the local practice lab.",
        },
      ],
      quiz: [
        {
          question: "Countless tiny files usually cause…",
          options: [
            "Faster listings and reads",
            "Slow listing/planning and poor throughput",
            "Free Photon",
            "Automatic SCD2",
          ],
          answer: 1,
        },
      ],
      body: `# Spark SQL performance on DBX

- Compact small files (\`OPTIMIZE\`, auto-optimize where appropriate).
- Filter on partitions early.
- Watch skew: salting or AQE skew join hints when needed.
- Prefer DataFrame/SQL expressions over Python UDFs.

## Exercises

1. From a Spark UI screenshot mindset, list signals of skew.
2. Propose a partitioning key for IoT events.
`,
    },
    {
      file: "04-unity-catalog-governance.md",
      slug: "dbx-unity-catalog",
      title: "Unity Catalog & governance",
      description: "Catalogs, schemas, grants, volume storage, and lineage-minded design.",
      level: "intermediate",
      order: 4,
      durationMinutes: 35,
      topics: ["databricks", "general"],
      objectives: [
        "Navigate three-level namespace",
        "Grant least-privilege access",
        "Separate envs with catalogs",
      ],
      quiz: [
        {
          question: "Unity Catalog three-level namespace is…",
          options: [
            "catalog.schema.table",
            "cluster.notebook.cell",
            "bucket.folder.file only",
            "user.password.host",
          ],
          answer: 0,
        },
      ],
      body: `# Unity Catalog & governance

\`main.silver.orders\` — catalog.schema.table.

Use grants on catalogs/schemas for teams; avoid wide \`ALL PRIVILEGES\` in prod.

## Exercises

1. Draft grants for analysts (read gold) vs engineers (write silver).
2. Explain volumes vs tables for ML artifacts.
`,
    },
    {
      file: "05-jobs-and-workflows.md",
      slug: "dbx-jobs-workflows",
      title: "Jobs, workflows, and deployment",
      description: "Task graphs, clusters vs serverless, retries, and CI-deployed job definitions.",
      level: "intermediate",
      order: 5,
      durationMinutes: 35,
      topics: ["databricks"],
      objectives: [
        "Model multi-task jobs",
        "Configure retries and timeouts",
        "Promote jobs via code, not clicks alone",
      ],
      quiz: [
        {
          question: "Production pipelines should primarily run as…",
          options: [
            "Manual notebook clicks",
            "Scheduled Jobs/Workflows with versioned code",
            "Untracked scratch clusters only",
            "Local laptops only",
          ],
          answer: 1,
        },
      ],
      body: `# Jobs, workflows, and deployment

Multi-task jobs: ingest → transform → DQ → publish. Fail fast on DQ.

Use job clusters or serverless SQL/warehouses appropriately; pin library versions.

## Exercises

1. Design a 4-task DAG with a DQ gate before gold publish.
2. List parameters you'd pass for a backfill.
`,
    },
    {
      file: "06-structured-streaming.md",
      slug: "dbx-structured-streaming",
      title: "Structured Streaming essentials",
      description: "Checkpoints, triggers, watermarks, and exactly-once sinks with Delta.",
      level: "advanced",
      order: 6,
      durationMinutes: 45,
      topics: ["databricks", "pyspark"],
      objectives: [
        "Configure checkpoints correctly",
        "Apply watermarks for late data",
        "Sink to Delta idempotently",
      ],
      quiz: [
        {
          question: "Losing a streaming checkpoint directory typically means…",
          options: [
            "Nothing changes",
            "You may reprocess or need careful recovery",
            "Automatic schema merge",
            "Free storage",
          ],
          answer: 1,
        },
      ],
      body: `# Structured Streaming essentials

\`\`\`python
(
  spark.readStream.format("cloudFiles")...
    .load(path)
    .writeStream
    .format("delta")
    .option("checkpointLocation", ckpt)
    .trigger(availableNow=True)
    .toTable("silver.events")
)
\`\`\`

## Exercises

1. Choose trigger mode for hourly micro-batches vs continuous.
2. Explain watermark vs checkpoint.
`,
    },
    {
      file: "07-dbx-sql-warehouses.md",
      slug: "dbx-sql-warehouses",
      title: "Databricks SQL warehouses & serving",
      description: "Serving gold tables to BI, serverless SQL cost controls, and query history habits.",
      level: "intermediate",
      order: 7,
      durationMinutes: 30,
      topics: ["databricks", "sql"],
      objectives: [
        "Pick warehouse sizes thoughtfully",
        "Use query history for tuning",
        "Separate ETL compute from BI serving",
      ],
      cheatSheet: [
        {
          label: "Serve gold",
          code: "SELECT order_date, region, orders, revenue\nFROM gold_daily_orders\nORDER BY order_date, region;",
          note: "BI-shaped read against gold — run it in the local practice lab.",
        },
      ],
      quiz: [
        {
          question: "Running heavy ETL on the same small SQL warehouse as BI often…",
          options: [
            "Improves SLAs",
            "Contends for resources and hurts dashboards",
            "Deletes Delta logs",
            "Disables Photon",
          ],
          answer: 1,
        },
      ],
      body: `# Databricks SQL warehouses & serving

Serve **gold** curated tables. Monitor spill and queueing in query history. Apply cost controls / budgets.

## Exercise

Draft a policy: which workloads use Jobs clusters vs SQL warehouses.
`,
    },
  ],

  snowflake: [
    {
      file: "01-snowflake-architecture.md",
      slug: "sf-architecture",
      title: "Snowflake architecture for practitioners",
      description: "Storage/compute separation, warehouses, credits, and layered database design.",
      level: "beginner",
      order: 1,
      durationMinutes: 30,
      topics: ["snowflake"],
      objectives: [
        "Explain storage vs compute separation",
        "Size warehouses for workload types",
        "Organize databases/schemas for medallion-like layers",
      ],
      cheatSheet: [
        {
          label: "Account map",
          code: "SELECT database, schema, object_name, object_type\nFROM sf_account_objects\nORDER BY database, schema, object_name;",
          note: "Run this in the local practice lab — not a live Snowflake account.",
        },
      ],
      quiz: [
        {
          question: "Virtual warehouses primarily provide…",
          options: [
            "Permanent storage only",
            "Elastic compute billed by credits",
            "Git hosting",
            "DNS",
          ],
          answer: 1,
        },
      ],
      body: `# Snowflake architecture for practitioners

Independent **storage** and **virtual warehouses**. Suspend idle warehouses; separate ETL vs BI warehouses.

## Exercises

1. Propose warehouse sizes for nightly ETL vs daytime BI.
2. Sketch DB/schema layout for raw/analytics/marts.
`,
    },
    {
      file: "02-time-travel-clones.md",
      slug: "sf-time-travel-clones",
      title: "Time Travel, Fail-safe & Zero-Copy Clones",
      description: "Recover from bad loads, clone environments cheaply, and understand retention.",
      level: "intermediate",
      order: 2,
      durationMinutes: 35,
      topics: ["snowflake"],
      objectives: [
        "Query historical data with AT/BEFORE",
        "Clone tables/databases for dev",
        "Know retention vs Fail-safe boundaries",
      ],
      cheatSheet: [
        { label: "Time travel", code: "SELECT * FROM t AT (TIMESTAMP => '...') " },
        { label: "Clone", code: "CREATE TABLE t_dev CLONE t_prod;" },
      ],
      quiz: [
        {
          question: "Zero-copy clone is valuable because…",
          options: [
            "It always duplicates all bytes immediately",
            "It creates instant copies with deferred storage growth",
            "It deletes Time Travel",
            "It disables RBAC",
          ],
          answer: 1,
        },
      ],
      body: `# Time Travel, Fail-safe & Zero-Copy Clones

\`\`\`sql
CREATE TABLE analytics.orders_clone CLONE analytics.orders;
SELECT * FROM analytics.orders AT (OFFSET => -60*60);
\`\`\`

Use clones for sticky integrations tests without full reloads.

## Exercises

1. Recover a table to pre-bad-MERGE state conceptually.
2. When do you need Fail-safe support vs Time Travel DIY?
`,
    },
    {
      file: "03-streams-and-tasks.md",
      slug: "sf-streams-tasks",
      title: "Streams & Tasks for incremental pipelines",
      description: "Change data capture with Streams, scheduled Tasks, and DAG-like task trees.",
      level: "intermediate",
      order: 3,
      durationMinutes: 40,
      topics: ["snowflake", "sql"],
      objectives: [
        "Create streams on tables",
        "Process METADATA$ACTION correctly",
        "Chain tasks with dependencies",
      ],
      quiz: [
        {
          question: "A Snowflake Stream records…",
          options: [
            "Only warehouse credits",
            "Row-level changes since last consumption offset",
            "UI theme settings",
            "Git commits",
          ],
          answer: 1,
        },
      ],
      body: `# Streams & Tasks for incremental pipelines

\`\`\`sql
CREATE STREAM raw.orders_stream ON TABLE raw.orders;
CREATE TASK load_orders WAREHOUSE = etl_wh SCHEDULE = '5 MINUTE' AS
  MERGE INTO analytics.orders t USING raw.orders_stream s ...;
\`\`\`

## Exercises

1. Handle DELETE actions from a stream in MERGE.
2. Design a task tree: land → clean → mart.
`,
    },
    {
      file: "04-dynamic-tables.md",
      slug: "sf-dynamic-tables",
      title: "Dynamic Tables declarative pipelines",
      description: "TARGET_LAG, refresh modes, and when Dynamic Tables beat hand-rolled tasks.",
      level: "advanced",
      order: 4,
      durationMinutes: 40,
      topics: ["snowflake", "sql"],
      objectives: [
        "Declare Dynamic Tables with lag targets",
        "Understand incremental vs full refresh",
        "Monitor freshness",
      ],
      cheatSheet: [
        {
          label: "Daily mart grain",
          code: "SELECT o.order_date, c.region, COUNT(*) AS orders, ROUND(SUM(o.amount), 2) AS revenue\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nGROUP BY o.order_date, c.region\nORDER BY o.order_date, c.region;",
          note: "Mart-shaped SELECT you can run in the local practice lab.",
        },
      ],
      quiz: [
        {
          question: "TARGET_LAG expresses…",
          options: [
            "Max acceptable staleness for the dynamic table",
            "Warehouse size",
            "Password rotation",
            "UI density",
          ],
          answer: 0,
        },
      ],
      body: `# Dynamic Tables declarative pipelines

\`\`\`sql
CREATE OR REPLACE DYNAMIC TABLE mart.orders_daily
  TARGET_LAG = '15 minutes'
  WAREHOUSE = etl_wh
AS
SELECT date_trunc('day', ordered_at) d, SUM(amount) AS revenue
FROM analytics.orders
GROUP BY 1;
\`\`\`

## Exercises

1. Compare Tasks+Streams vs Dynamic Tables for a simple aggregate mart.
2. Pick a TARGET_LAG for near-real-time ops vs hourly finance.
`,
    },
    {
      file: "05-performance-cost.md",
      slug: "sf-performance-cost",
      title: "Performance & cost control",
      description: "Clustering, search optimization, warehouse sizing, and query profile literacy.",
      level: "advanced",
      order: 5,
      durationMinutes: 45,
      topics: ["snowflake", "sql"],
      objectives: [
        "Read query profiles for pruning and spilling",
        "Apply clustering thoughtfully",
        "Control auto-suspend and multi-cluster",
      ],
      cheatSheet: [
        { label: "Auto suspend", code: "ALTER WAREHOUSE etl SET AUTO_SUSPEND = 60;" },
        { label: "Clustering", code: "ALTER TABLE t CLUSTER BY (event_date, account_id);" },
      ],
      quiz: [
        {
          question: "Leaving a large warehouse running idle primarily wastes…",
          options: ["Credits", "Time Travel history only", "UI themes", "Stages"],
          answer: 0,
        },
      ],
      body: `# Performance & cost control

- Right-size warehouses; enable auto-suspend.
- Cluster large filtered tables on common predicates.
- Avoid SELECT * in scheduled jobs.
- Spillage in profiles → increase warehouse or reduce data width.

## Exercises

1. Propose clustering keys for a 5B-row event table queried by day+account.
2. List 3 cost guardrails for a shared account.
`,
    },
    {
      file: "06-governance-rbac.md",
      slug: "sf-governance-rbac",
      title: "RBAC, roles & data governance",
      description: "Role hierarchy, future grants, masking policies, and least privilege.",
      level: "intermediate",
      order: 6,
      durationMinutes: 35,
      topics: ["snowflake", "general"],
      objectives: [
        "Design role hierarchies",
        "Apply masking for PII",
        "Use future grants for new objects",
      ],
      quiz: [
        {
          question: "Analysts typically should…",
          options: [
            "Own ACCOUNTADMIN daily",
            "Use read roles on curated schemas",
            "Share passwords",
            "Disable MFA",
          ],
          answer: 1,
        },
      ],
      body: `# RBAC, roles & data governance

Hierarchy: \`SYSADMIN\` / custom \`TRANSFORMER\` / \`ANALYST\`. Never day-to-day as \`ACCOUNTADMIN\`.

Masking policies on email/SSN columns; row access policies when needed.

## Exercises

1. Draft roles for loader, transformer, analyst.
2. Write a conceptual masking policy for \`email\`.
`,
    },
    {
      file: "07-snowpark-python.md",
      slug: "sf-snowpark-python",
      title: "Snowpark Python for DE",
      description: "DataFrame API pushdown, stored procedures, and when to use Snowpark vs pure SQL.",
      level: "advanced",
      order: 7,
      durationMinutes: 40,
      topics: ["snowflake", "python"],
      objectives: [
        "Write Snowpark DataFrame transforms",
        "Understand pushdown vs local collect pitfalls",
        "Package logic as procedures/jobs",
      ],
      quiz: [
        {
          question: "Calling \`.collect()\` on a huge Snowpark frame…",
          options: [
            "Keeps all compute in Snowflake optimally",
            "Pulls rows to the client — can OOM",
            "Creates a Dynamic Table",
            "Grants ACCOUNTADMIN",
          ],
          answer: 1,
        },
      ],
      body: `# Snowpark Python for DE

\`\`\`python
from snowflake.snowpark import Session
df = session.table("ANALYTICS.ORDERS")
out = df.filter(df["STATUS"] == "paid").group_by("REGION").agg(df["AMOUNT"].sum())
out.write.save_as_table("MARTS.REVENUE", mode="overwrite")
\`\`\`

Prefer lazy DataFrame ops; avoid collecting large sets.

## Capstone

Port one pandas transform from the Python track into Snowpark or SQL with tests on a sample.
`,
    },
  ],
};

// wipe regenerable core files; keep W1–W8 wave markdown (see wave-lessons.mjs)
for (const track of Object.keys(courses)) {
  const dir = path.join(root, track);
  fs.mkdirSync(dir, { recursive: true });
  const keep = WAVE_FILES_BY_TRACK[track] ?? new Set();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    if (keep.has(f)) continue;
    fs.unlinkSync(path.join(dir, f));
  }
  for (const lesson of courses[track]) {
    writeLesson(track, lesson.file, lesson);
  }
  console.log(`✓ ${track}: ${courses[track].length} lessons`);
}

console.log("Done generating courses.");

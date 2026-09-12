#!/usr/bin/env node
/**
 * W0–W4 content-wave registry.
 * Markdown under content/training is the source of truth (same frontmatter
 * style as existing lessons). This script registers slugs/files so
 * generate-courses.mjs does not wipe wave lessons, and validates they exist.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trainingRoot = path.join(__dirname, "..", "content", "training");

/** @typedef {{ wave: string, track: string, file: string, slug: string, title: string }} WaveLesson */

/** @type {WaveLesson[]} */
export const WAVE_LESSONS = [
  // W1 — true-zero
  { wave: "W1", track: "sql", file: "00-joins-set-logic.md", slug: "sql-joins-set-logic-recap", title: "DE joins & set-logic recap" },
  { wave: "W1", track: "databricks", file: "00-workspace-cluster-basics.md", slug: "dbx-workspace-cluster-basics", title: "Workspace & cluster basics" },
  { wave: "W1", track: "snowflake", file: "00-databases-schemas-warehouses.md", slug: "sf-day0-objects", title: "Databases, schemas & warehouses" },
  // W2 — ingestion
  { wave: "W2", track: "sql", file: "08-deduping-late-data.md", slug: "sql-deduping-late-data", title: "Deduping & late-data patterns" },
  { wave: "W2", track: "snowflake", file: "08-copy-stages-ingestion.md", slug: "sf-copy-stages-ingestion", title: "COPY, stages & ingestion" },
  { wave: "W2", track: "databricks", file: "08-autoloader-ingestion.md", slug: "dbx-autoloader-ingestion", title: "Autoloader / ingestion patterns" },
  // W3 — capstones
  { wave: "W3", track: "snowflake", file: "09-capstone-dynamic-table-mart.md", slug: "sf-capstone-dynamic-table-mart", title: "Capstone — Dynamic Table mart + cost checklist" },
  { wave: "W3", track: "databricks", file: "09-capstone-medallion-job.md", slug: "dbx-capstone-medallion-job", title: "Capstone — bronze→silver→gold Job" },
  { wave: "W3", track: "sql", file: "09-shared-capstone-checklist.md", slug: "sql-shared-capstone-checklist", title: "Shared capstone checklist — Orders to daily revenue mart" },
  { wave: "W3", track: "python", file: "09-capstone-cli-package.md", slug: "python-capstone-cli-package", title: "Capstone — CLI entrypoint, tests, and package" },
  // W4 — depth
  { wave: "W4", track: "sql", file: "10-slowly-changing-dimensions.md", slug: "sql-slowly-changing-dimensions", title: "Slowly changing dimensions in SQL" },
  { wave: "W4", track: "sql", file: "11-explain-plan-lab.md", slug: "sql-explain-plan-lab", title: "Explain-plan reading lab" },
  { wave: "W4", track: "databricks", file: "10-dlt-pipelines.md", slug: "dbx-dlt-pipelines", title: "DLT / declarative pipelines overview" },
  { wave: "W4", track: "databricks", file: "11-liquid-clustering.md", slug: "dbx-liquid-clustering", title: "Liquid clustering / table maintenance lab" },
  { wave: "W4", track: "snowflake", file: "10-zero-copy-clone-dev.md", slug: "sf-zero-copy-clone-dev", title: "Zero-copy clone for DEV workflows lab" },
  { wave: "W4", track: "snowflake", file: "11-cortex-vs-snowpark.md", slug: "sf-cortex-vs-snowpark", title: "Cortex vs Snowpark decision guide" },
  { wave: "W4", track: "ai-data-eng", file: "08-practice-nonsf-agents.md", slug: "ai-de-practice-nonsf-agents", title: "Practice with generic agents & Databricks Assistant" },
  { wave: "W4", track: "git", file: "04-branching-dbt-sql.md", slug: "git-branching-dbt-sql", title: "Branching for dbt/SQL repos" },
  { wave: "W4", track: "git", file: "05-pr-templates-data-diffs.md", slug: "git-pr-templates-data-diffs", title: "PR templates for data diffs" },
  { wave: "W4", track: "prompt-engineering", file: "07-de-role-prompt-library.md", slug: "pe-de-role-prompt-library", title: "DE role prompt library (on-call / PR / incident)" },
  // W5 — ETL builders (one per major tool track)
  { wave: "W5", track: "python", file: "12-etl-pipeline-builder.md", slug: "python-etl-pipeline-builder", title: "Build an ETL job — extract, transform, load" },
  { wave: "W5", track: "sql", file: "12-staging-mart-etl.md", slug: "sql-staging-mart-etl", title: "Build staging→mart ETL with DQ gates" },
  { wave: "W5", track: "databricks", file: "12-medallion-etl-builder.md", slug: "dbx-medallion-etl-builder", title: "Build medallion ETL — Autoloader to gold" },
  { wave: "W5", track: "snowflake", file: "12-warehouse-etl-builder.md", slug: "sf-warehouse-etl-builder", title: "Build warehouse ETL — COPY, Streams, Dynamic Tables" },
  // W6 — Aurora SQL exercise path (clustered categories; original DE copy)
  { wave: "W6", track: "sql", file: "13-select-filter-nulls.md", slug: "sql-select-filter-nulls", title: "SELECT, filters, NULLs, and LIMIT" },
  { wave: "W6", track: "sql", file: "14-dml-write-path.md", slug: "sql-dml-write-path", title: "INSERT, UPDATE, DELETE on staging" },
  { wave: "W6", track: "sql", file: "15-aggregates-group-having.md", slug: "sql-aggregates-group-having", title: "Aggregates, GROUP BY, and HAVING" },
  { wave: "W6", track: "sql", file: "16-patterns-aliases-case.md", slug: "sql-patterns-aliases-case", title: "LIKE, IN, BETWEEN, aliases, and CASE" },
  { wave: "W6", track: "sql", file: "17-exists-any-all.md", slug: "sql-exists-any-all", title: "EXISTS, ANY, and ALL as set filters" },
  { wave: "W6", track: "sql", file: "18-ddl-constraints.md", slug: "sql-ddl-constraints", title: "Tables, constraints, and indexes" },
  { wave: "W6", track: "sql", file: "19-dates-injection.md", slug: "sql-dates-injection", title: "Warehouse dates and injection-safe filters" },
  // W7 — sibling exercise paths (DBX + SF + Python; original DE copy)
  { wave: "W7", track: "databricks", file: "13-spark-select-nulls.md", slug: "dbx-spark-select-nulls", title: "Spark SQL SELECT, NULLs, and LIMIT" },
  { wave: "W7", track: "databricks", file: "14-delta-write-preview.md", slug: "dbx-delta-write-preview", title: "Delta write preview — MERGE without mutating" },
  { wave: "W7", track: "databricks", file: "15-gold-aggregates.md", slug: "dbx-gold-aggregates", title: "Gold aggregates — GROUP BY and HAVING" },
  { wave: "W7", track: "databricks", file: "16-silver-patterns-case.md", slug: "dbx-silver-patterns-case", title: "Silver cleaning — LIKE, IN, CASE" },
  { wave: "W7", track: "databricks", file: "17-semi-joins-leftovers.md", slug: "dbx-semi-joins-leftovers", title: "Semi-joins — leftover bronze keys" },
  { wave: "W7", track: "databricks", file: "18-delta-table-contracts.md", slug: "dbx-delta-table-contracts", title: "Delta table contracts and schema" },
  { wave: "W7", track: "databricks", file: "19-dates-partition-filters.md", slug: "dbx-dates-partition-filters", title: "Dates, partition filters, injection-safe SQL" },
  { wave: "W7", track: "snowflake", file: "13-select-filter-nulls.md", slug: "sf-select-filter-nulls", title: "SELECT, filters, NULLs on SAMPLE" },
  { wave: "W7", track: "snowflake", file: "14-dml-write-path.md", slug: "sf-dml-write-path", title: "INSERT, UPDATE, MERGE on staging" },
  { wave: "W7", track: "snowflake", file: "15-aggregates-group-having.md", slug: "sf-aggregates-group-having", title: "Aggregates, GROUP BY, HAVING for marts" },
  { wave: "W7", track: "snowflake", file: "16-patterns-aliases-case.md", slug: "sf-patterns-aliases-case", title: "LIKE, IN, BETWEEN, aliases, CASE" },
  { wave: "W7", track: "snowflake", file: "17-exists-semi-joins.md", slug: "sf-exists-semi-joins", title: "EXISTS and leftover SAMPLE keys" },
  { wave: "W7", track: "snowflake", file: "18-ddl-constraints.md", slug: "sf-ddl-constraints", title: "Tables, constraints, clustering keys" },
  { wave: "W7", track: "snowflake", file: "19-dates-injection.md", slug: "sf-dates-injection", title: "Dates, Time Travel windows, bind-safe filters" },
  { wave: "W7", track: "python", file: "13-none-dicts-rows.md", slug: "python-none-dicts-rows", title: "None, dicts, and pipeline rows" },
  { wave: "W7", track: "python", file: "14-functions-pure-transforms.md", slug: "python-functions-pure-transforms", title: "Functions — pure transforms, I/O at the edges" },
  { wave: "W7", track: "python", file: "15-pathlib-extracts.md", slug: "python-pathlib-extracts", title: "pathlib extracts — land files on purpose" },
  { wave: "W7", track: "python", file: "16-exceptions-retries.md", slug: "python-exceptions-retries", title: "Exceptions and retry-shaped handling" },
  { wave: "W7", track: "python", file: "17-datetimes-watermarks.md", slug: "python-datetimes-watermarks", title: "datetimes and incremental watermarks" },
  { wave: "W7", track: "python", file: "18-comprehensions-chunks.md", slug: "python-comprehensions-chunks", title: "Comprehensions and chunked extracts" },
  { wave: "W7", track: "python", file: "19-logging-not-print.md", slug: "python-logging-not-print", title: "logging — not print — for ETL jobs" },
  // W8 — richer local lab datasets (catalogs / schemas / views / metric-style tables)
  { wave: "W8", track: "sql", file: "20-catalog-views-metrics.md", slug: "sql-catalog-views-metrics", title: "Catalogs, schemas, views, and metric-style tables" },
  { wave: "W8", track: "databricks", file: "20-catalog-views-metrics.md", slug: "dbx-catalog-views-metrics", title: "Catalogs, views, and metric views (local)" },
  { wave: "W8", track: "snowflake", file: "20-catalog-views-metrics.md", slug: "sf-catalog-views-metrics", title: "Databases, views, and semantic metrics (local)" },
];

export const WAVE_FILES_BY_TRACK = WAVE_LESSONS.reduce((acc, l) => {
  (acc[l.track] ??= new Set()).add(l.file);
  return acc;
}, /** @type {Record<string, Set<string>>} */ ({}));

export const WAVE_SLUGS = WAVE_LESSONS.map((l) => l.slug);

export function waveRedirects() {
  return WAVE_LESSONS.flatMap((l) => {
    const stem = l.file.replace(/\.md$/, "");
    const stemNoPrefix = stem.replace(/^\d+-/, "");
    const dest = `/training/${l.track}/${l.slug}`;
    const rows = [
      { source: `/training/${l.track}/${stem}`, destination: dest, permanent: true },
    ];
    if (stemNoPrefix !== stem && stemNoPrefix !== l.slug) {
      rows.push({
        source: `/training/${l.track}/${stemNoPrefix}`,
        destination: dest,
        permanent: true,
      });
    }
    return rows;
  });
}

export function validateWaveLessons() {
  const missing = [];
  for (const l of WAVE_LESSONS) {
    const full = path.join(trainingRoot, l.track, l.file);
    if (!fs.existsSync(full)) missing.push(`${l.track}/${l.file}`);
  }
  return missing;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const missing = validateWaveLessons();
  if (missing.length) {
    console.error("Missing wave lesson files:\n" + missing.map((m) => `  - ${m}`).join("\n"));
    process.exit(1);
  }
  console.log(`✓ ${WAVE_LESSONS.length} W1–W8 lessons present`);
  for (const wave of ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]) {
    const rows = WAVE_LESSONS.filter((l) => l.wave === wave);
    console.log(`  ${wave}: ${rows.map((r) => r.slug).join(", ")}`);
  }
}

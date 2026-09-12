---
slug: sql-staging-mart-etl
track: sql
title: "Build staging→mart ETL with DQ gates"
description: "One SQL pipeline: incremental extract into staging, fail-closed data-quality gates, MERGE to current, then publish a daily revenue mart — without advancing the watermark on failure."
level: intermediate
order: 12
durationMinutes: 30
topics: [sql, snowflake, databricks]
dialect: mixed
objectives:
  - "Land an incremental window into a replaceable staging table"
  - "Fail the load when uniqueness, null, or freshness gates return violations"
  - "MERGE staging into current, publish mart.orders_daily, then advance the watermark"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Incremental extract → staging"
    code: "-- Dialect: ANSI-shaped (run in your warehouse)\nCREATE OR REPLACE TABLE staging.orders_delta AS\nSELECT order_id, customer_id, amount, status, updated_at, ordered_at\nFROM raw.orders\nWHERE updated_at > (SELECT watermark_ts FROM pipeline_state WHERE job = 'orders_etl')\n  AND updated_at <= DATEADD(day, 2, CURRENT_TIMESTAMP());  -- overlap window"
    note: "Staging is disposable. Raw stays the replay log. Copy into Snowflake or Spark SQL."
  - label: "DQ gate (violations must be 0)"
    code: "-- dq_uniqueness_gate — 0 rows required\nSELECT order_id, COUNT(*) AS c\nFROM staging.orders_delta\nGROUP BY 1\nHAVING COUNT(*) > 1;\n\n-- dq_null_amount — 0 rows required\nSELECT *\nFROM staging.orders_delta\nWHERE amount IS NULL OR order_id IS NULL;"
    note: "Gates return violations. If any row comes back, do not MERGE and do not move the watermark."
  - label: "MERGE current + publish mart"
    code: "-- Dialect: Spark SQL / Databricks (explicit columns in Snowflake)\nMERGE INTO mart.orders_current t\nUSING staging.orders_latest s\nON t.order_id = s.order_id\nWHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;\n\nCREATE OR REPLACE TABLE mart.orders_daily AS\nSELECT DATE_TRUNC('DAY', ordered_at) AS event_date,\n       SUM(amount) AS revenue,\n       COUNT(*) AS order_cnt\nFROM mart.orders_current\nWHERE status = 'paid'\nGROUP BY 1;"
    note: "Silver grain = one row per order_id. Gold grain = one row per event_date."
quiz:
  - question: "When should pipeline_state.watermark_ts advance?"
    options:
      - "As soon as staging is created"
      - "After DQ gates pass and the MERGE + mart publish succeed"
      - "Before extract, to save time"
      - "Never — watermarks are decorative"
    answer: 1
    explanation: "Advance last. A failed MERGE must be re-readable from the old watermark."
  - question: "A uniqueness DQ gate should return…"
    options:
      - "The warehouse size"
      - "Rows that violate uniqueness (empty set = pass)"
      - "Always one dummy row"
      - "The gold mart itself"
    answer: 1
    explanation: "Treat DQ as queries whose result set must be empty. Fail the job if not."
  - question: "Why land into staging instead of MERGEing raw → mart in one statement?"
    options:
      - "So you can inspect, dedupe, and gate before publish"
      - "Because staging is billed less"
      - "To skip incremental filters"
      - "To disable Time Travel"
    answer: 0
    explanation: "Staging is the airlock. DQ and latest-per-key happen there, then current/mart update."
---

This is the **SQL ETL builder**. It assembles [incremental loads](/training/sql/sql-incremental-loads) and [DQ checks](/training/sql/sql-data-quality) into one **staging → gate → current → mart** path. Shared story: **Orders → late events → daily revenue mart**.

> **Dialects:** extract/freshness sketches use Snowflake `DATEADD`. `MERGE … UPDATE SET *` is Spark SQL / Databricks — list columns explicitly on Snowflake. Do not mix syntax in one worksheet.

The SQL **local practice lab** (DuckDB, not a live warehouse) lives on the exercise-path lessons and the [joins recap](/training/sql/sql-joins-set-logic-recap). This builder is MERGE/DDL-heavy — copy the TryIt cards into your warehouse. Honest chrome: not a live runner on this page.

## Pipeline

```
raw.orders  →  staging.orders_delta  →  DQ gates  →  mart.orders_current  →  mart.orders_daily
                     ↑                                                         (gold)
              overlap the watermark
```

| Object | Grain | Mutable? |
|--------|-------|----------|
| `raw.orders` | One landed event / file row | Append-only |
| `staging.orders_delta` | This run's window (dups allowed until you fold) | Replace each run |
| `mart.orders_current` | One `order_id` (latest `updated_at`) | MERGE |
| `mart.orders_daily` | One `event_date` | Rebuild or replace slice |

## 1. Incremental extract

```sql
-- Dialect: Snowflake-shaped
CREATE OR REPLACE TABLE staging.orders_delta AS
SELECT order_id, customer_id, amount, status, updated_at, ordered_at
FROM raw.orders
WHERE updated_at > (SELECT watermark_ts FROM pipeline_state WHERE job = 'orders_etl')
  AND updated_at <= DATEADD(day, 2, (
        SELECT watermark_ts FROM pipeline_state WHERE job = 'orders_etl'
      ));
```

The **+2 days** overlap re-reads late refunds. If you only take `updated_at > watermark`, yesterday's gold lies.

Fold dups **in staging** before MERGE ([late-data lesson](/training/sql/sql-deduping-late-data)):

```sql
CREATE OR REPLACE TABLE staging.orders_latest AS
SELECT *
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) AS rn
  FROM staging.orders_delta
) s
WHERE rn = 1;
```

## 2. DQ gates (fail closed)

Run as a job step. **Non-zero violation rows = fail.** Do not MERGE.

```sql
-- dq_uniqueness_gate
SELECT order_id, COUNT(*) AS c
FROM staging.orders_latest
GROUP BY 1
HAVING COUNT(*) > 1;

-- dq_nulls
SELECT *
FROM staging.orders_latest
WHERE amount IS NULL OR order_id IS NULL OR ordered_at IS NULL;

-- dq_freshness (Snowflake); Spark: CURRENT_TIMESTAMP() - INTERVAL 6 HOURS
SELECT MAX(updated_at) < DATEADD(hour, -6, CURRENT_TIMESTAMP()) AS stale
FROM staging.orders_latest;
```

Orphans (facts whose dim is missing) belong here too — same “return violations” shape.

## 3. MERGE current, then mart

```sql
-- Dialect: Spark SQL / Databricks
MERGE INTO mart.orders_current t
USING staging.orders_latest s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

```sql
CREATE OR REPLACE TABLE mart.orders_daily AS
SELECT
  DATE_TRUNC('DAY', ordered_at) AS event_date,
  SUM(amount) AS revenue,
  COUNT(*) AS order_cnt
FROM mart.orders_current
WHERE status = 'paid'
GROUP BY 1;
```

`CREATE OR REPLACE` for the daily grain is fine while the table is small. Incremental MERGE on `event_date` wins when gold is huge and you only touched a few days — then overwrite **those** dates, not the whole history.

## 4. Advance the watermark last

```sql
UPDATE pipeline_state
SET watermark_ts = (SELECT MAX(updated_at) FROM staging.orders_latest)
WHERE job = 'orders_etl';
```

Only after gates + MERGE + mart succeed. On failure, the next run re-reads the same window.

Scorecard: [shared capstone checklist](/training/sql/sql-shared-capstone-checklist). Warehouse twins: [Databricks medallion ETL](/training/databricks/dbx-medallion-etl-builder), [Snowflake warehouse ETL](/training/snowflake/sf-warehouse-etl-builder).

## Exercises

1. Rewrite the freshness predicate in Spark SQL (`INTERVAL`) and keep the same 6-hour SLA.
2. Add an orphan gate: `orders_current.customer_id` missing from `dim_customer`.
3. Decide: full `CREATE OR REPLACE` of `orders_daily` vs MERGE on `event_date` for a 3-year mart. When does replace win?

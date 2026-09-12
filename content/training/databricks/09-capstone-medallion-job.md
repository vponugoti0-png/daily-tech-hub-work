---
slug: dbx-capstone-medallion-job
track: databricks
title: "Capstone — bronze→silver→gold Job"
description: "Wire a Databricks Job: Autoloader bronze, late-data silver, daily revenue gold — with a DQ gate before publish."
level: advanced
order: 9
durationMinutes: 45
topics: [databricks, pyspark, sql]
objectives:
  - "Sketch a 4-task Job: land → silver → DQ → gold"
  - "Keep checkpoints and schema locations off scratch paths"
  - "Publish gold only after uniqueness + freshness checks"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Gold daily revenue"
    code: "CREATE OR REPLACE TABLE main.gold.orders_daily AS\nSELECT date_trunc('DAY', ordered_at) AS event_date,\n       SUM(amount) AS revenue,\n       COUNT(*) AS order_cnt\nFROM main.silver.orders\nWHERE status = 'paid'\nGROUP BY 1;"
    note: "Silver is one row per order_id. Gold is one row per event_date."
  - label: "DQ gate (fail the Job)"
    code: "SELECT order_id, COUNT(*) c\nFROM main.silver.orders\nGROUP BY 1\nHAVING COUNT(*) > 1;\n-- 0 rows required, else fail task"
    note: "Do not publish gold if silver keys are duplicate."
quiz:
  - question: "In this capstone, gold should be published…"
    options:
      - "From the raw Autoloader table with SELECT *"
      - "After a DQ gate on silver (uniqueness / freshness)"
      - "Only from a SQL warehouse named scratch"
      - "By clicking Run All on an all-purpose cluster"
    answer: 1
    explanation: "Jobs: land → clean → check → publish. DQ is a task, not a hope."
  - question: "Bronze vs silver for late refunds?"
    options:
      - "Bronze stays append-only files; silver MERGE/latest-state"
      - "Bronze deletes history"
      - "Gold is the only table that may exist"
      - "Unity Catalog is skipped"
    answer: 0
    explanation: "Bronze is the replay log. Silver applies late events. Gold aggregates."
---

Capstone for Databricks. Shared story: **Orders → late events → daily revenue mart**. Copy-ready Autoloader → silver → gold lives in [Build medallion ETL](/training/databricks/dbx-medallion-etl-builder). Use the [shared checklist](/training/sql/sql-shared-capstone-checklist) as the scorecard.

## Job graph

```
[1 land Autoloader] → [2 silver MERGE] → [3 DQ] → [4 gold orders_daily]
```

- Task 1: [Autoloader](/training/databricks/dbx-autoloader-ingestion) `availableNow` into `main.bronze.orders`.
- Task 2: latest-per-`order_id` + MERGE into `main.silver.orders` (overlap window).
- Task 3: fail on duplicate keys, null amounts, stale `max(ordered_at)`.
- Task 4: overwrite or replace `main.gold.orders_daily`.

Production runs as a **Job** with a job cluster (day-0 habit), not Run All.

## Silver MERGE (sketch)

```sql
MERGE INTO main.silver.orders t
USING main.staging.orders_latest s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

Prefer **explicit columns** in real PRs. `*` is a workshop sketch.

## Gold

```sql
CREATE OR REPLACE TABLE main.gold.orders_daily AS
SELECT
  date_trunc('DAY', ordered_at) AS event_date,
  SUM(amount) AS revenue,
  COUNT(*) AS order_cnt
FROM main.silver.orders
WHERE status = 'paid'
GROUP BY 1;
```

Same grain as the Snowflake Dynamic Table capstone — compare notes across tracks.

## Exercises

1. List Job parameters you would pass for a 7-day backfill (`start`, `end`, `overlap_days`).
2. Write the uniqueness DQ as a query that returns **violations** (rows that should be empty).
3. Decide: gold as `CREATE OR REPLACE` vs incremental MERGE on `event_date`. When does replace win?

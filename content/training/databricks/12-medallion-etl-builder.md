---
slug: dbx-medallion-etl-builder
track: databricks
title: "Build medallion ETL — Autoloader to gold"
description: "Copy-ready Autoloader bronze → late-aware silver MERGE → DQ gate → gold daily mart, scheduled as a Databricks Job with availableNow — not Run All on an all-purpose cluster."
level: intermediate
order: 12
durationMinutes: 30
topics: [databricks, pyspark, sql]
objectives:
  - "Land new files to bronze with Autoloader (cloudFiles) and a durable checkpoint"
  - "Fold late events into silver with latest-per-order_id MERGE"
  - "Fail the Job on DQ violations before publishing gold.orders_daily"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Autoloader bronze (availableNow)"
    code: "(spark.readStream.format(\"cloudFiles\")\n  .option(\"cloudFiles.format\", \"json\")\n  .option(\"cloudFiles.schemaLocation\", schema_path)\n  .option(\"cloudFiles.inferColumnTypes\", \"true\")\n  .option(\"cloudFiles.schemaEvolutionMode\", \"rescue\")\n  .load(src)\n  .writeStream.format(\"delta\")\n  .option(\"checkpointLocation\", ckpt)\n  .trigger(availableNow=True)\n  .toTable(\"main.bronze.orders\"))"
    note: "availableNow drains new files and exits — Job-friendly. Checkpoint + schemaLocation are not scratch paths."
  - label: "Silver latest + MERGE"
    code: "CREATE OR REPLACE TABLE main.staging.orders_latest AS\nSELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY order_id ORDER BY updated_at DESC\n  ) AS rn\n  FROM main.bronze.orders\n  WHERE updated_at >= current_timestamp() - INTERVAL 2 DAYS\n) s WHERE rn = 1;\n\nMERGE INTO main.silver.orders t\nUSING main.staging.orders_latest s\nON t.order_id = s.order_id\nWHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;"
    note: "Bronze stays append-only. Silver is one row per order_id. Prefer explicit columns in PRs."
  - label: "DQ then gold"
    code: "-- 0 rows required\nSELECT order_id, COUNT(*) c FROM main.silver.orders GROUP BY 1 HAVING COUNT(*) > 1;\n\nCREATE OR REPLACE TABLE main.gold.orders_daily AS\nSELECT date_trunc('DAY', ordered_at) AS event_date,\n       SUM(amount) AS revenue,\n       COUNT(*) AS order_cnt\nFROM main.silver.orders\nWHERE status = 'paid'\nGROUP BY 1;"
    note: "Copy SQL into a workspace, or practice SELECT-shaped gold in the local lab on lakehouse / day-0 lessons."
quiz:
  - question: "In this builder, gold is published…"
    options:
      - "Directly from Autoloader bronze with SELECT *"
      - "After silver MERGE and a DQ gate that must return zero violations"
      - "Only from an all-purpose cluster named scratch"
      - "By deleting the checkpoint each run"
    answer: 1
    explanation: "Land → fold late events → check → publish. DQ is a Job task, not a hope."
  - question: "Why keep Autoloader checkpointLocation off ephemeral DBFS scratch?"
    options:
      - "Scratch paths are faster"
      - "Losing the checkpoint can reprocess files or force a careful recovery"
      - "Unity Catalog forbids volumes"
      - "Gold cannot live in a catalog"
    answer: 1
    explanation: "The checkpoint is the ingestion watermark. Treat it like state."
  - question: "availableNow vs continuous for a daily revenue mart?"
    options:
      - "availableNow (or a triggered micro-batch) — drain files, exit, let the Job finish"
      - "Continuous only — marts cannot be batch"
      - "Neither — use Run All"
      - "availableNow deletes bronze"
    answer: 0
    explanation: "Daily/hourly marts want a finite task. Continuous is for low-latency ops."
---

This is the **Databricks ETL builder**: a copy-ready **Autoloader → bronze → silver → DQ → gold** path. It sits between [Autoloader / ingestion](/training/databricks/dbx-autoloader-ingestion) (landing only) and the [Job capstone](/training/databricks/dbx-capstone-medallion-job) (scorecard + graph). Shared story: **Orders → late events → daily revenue mart**.

Local Practice Lab (DuckDB) is on **day-0 / lakehouse / warehouse** lessons — not a live workspace. These builder snippets are **copy-to-practice** cards for your Job notebook. Jump to [lakehouse fundamentals](/training/databricks/dbx-lakehouse-fundamentals#lab) to run SELECT-shaped gold.

## Job graph

```
[1 Autoloader bronze] → [2 silver MERGE] → [3 DQ] → [4 gold orders_daily]
```

Production: **Databricks Job** + job cluster (or serverless job), pinned runtime. Not Run All on all-purpose.

## 1. Bronze — Autoloader

```python
(spark.readStream.format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaLocation", schema_path)   # Volume / UC path
  .option("cloudFiles.inferColumnTypes", "true")
  .option("cloudFiles.schemaEvolutionMode", "rescue")
  .load(src)
  .writeStream.format("delta")
  .option("checkpointLocation", ckpt)                 # same: durable
  .trigger(availableNow=True)
  .toTable("main.bronze.orders"))
```

- Bronze is **append-only** files/events. Duplicates allowed.
- Hint required fields (`order_id`, `amount`, `updated_at`); surprises go to `_rescued_data`.
- `availableNow=True` drains what is there and stops — one Job task.

`spark.read.format("json").load(...)` is a one-off. Autoloader is what you schedule.

## 2. Silver — late events

Overlap a late window, fold to latest `order_id`, MERGE.

```sql
CREATE OR REPLACE TABLE main.staging.orders_latest AS
SELECT * FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) AS rn
  FROM main.bronze.orders
  WHERE updated_at >= current_timestamp() - INTERVAL 2 DAYS
) s
WHERE rn = 1;

MERGE INTO main.silver.orders t
USING main.staging.orders_latest s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

`UPDATE SET *` is a workshop sketch. List columns in the PR. SQL fold patterns: [deduping & late data](/training/sql/sql-deduping-late-data).

## 3. DQ gate

Fail the Job if any of these return rows (or `stale = true`):

```sql
SELECT order_id, COUNT(*) AS c
FROM main.silver.orders
GROUP BY 1
HAVING COUNT(*) > 1;

SELECT * FROM main.silver.orders
WHERE amount IS NULL OR order_id IS NULL;

SELECT MAX(updated_at) < current_timestamp() - INTERVAL 6 HOURS AS stale
FROM main.silver.orders;
```

## 4. Gold

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

Same grain as the Snowflake Dynamic Table capstone. Incremental MERGE on `event_date` when gold is large and only a few days moved.

Serve gold from a **SQL warehouse**, not the ETL job cluster ([warehouses lesson](/training/databricks/dbx-sql-warehouses)).

## Exercises

1. Write Job parameters for a 7-day backfill: `start`, `end`, `overlap_days`.
2. Name two paths that must not live on ephemeral scratch: `schemaLocation` and `checkpointLocation`.
3. Compare this builder to [DLT](/training/databricks/dbx-dlt-pipelines): which layer would you declare as a streaming table vs a materialized view?

---
slug: sf-warehouse-etl-builder
track: snowflake
title: "Build warehouse ETL — COPY, Streams, Dynamic Tables"
description: "One Snowflake ETL: COPY INTO from a stage, consume a Stream with a Task MERGE into silver, then a Dynamic Table (or Task) for the daily revenue mart — with load-history DQ."
level: intermediate
order: 12
durationMinutes: 30
topics: [snowflake, sql]
objectives:
  - "Land files idempotently with a stage, file format, and COPY INTO"
  - "Process a Stream in a Task MERGE, including METADATA$ACTION"
  - "Publish gold as a Dynamic Table (or a downstream Task) with an explicit warehouse and lag"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Stage + COPY INTO"
    code: "CREATE OR REPLACE FILE FORMAT analytics.raw.csv_ff\n  TYPE = CSV SKIP_HEADER = 1 FIELD_OPTIONALLY_ENCLOSED_BY = '\"';\n\nCOPY INTO analytics.raw.orders\nFROM @analytics.raw.orders_ext\nFILE_FORMAT = (FORMAT_NAME = 'analytics.raw.csv_ff')\nPATTERN = '.*orders_.*[.]csv'\nON_ERROR = 'ABORT_STATEMENT';"
    note: "COPY is file-aware (skips loaded files). It is not row-level dedupe. Raw stays replayable."
  - label: "Stream + Task MERGE (silver)"
    code: "CREATE STREAM IF NOT EXISTS analytics.raw.orders_stream ON TABLE analytics.raw.orders;\n\nCREATE OR REPLACE TASK analytics.silver.load_orders\n  WAREHOUSE = etl_wh\n  SCHEDULE = 'USING CRON 15 * * * * UTC'\nAS\nMERGE INTO analytics.silver.orders t\nUSING analytics.raw.orders_stream s\n  ON t.order_id = s.order_id\nWHEN MATCHED AND s.METADATA$ACTION = 'DELETE' THEN DELETE\nWHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET\n  t.amount = s.amount, t.status = s.status, t.updated_at = s.updated_at\nWHEN NOT MATCHED AND s.METADATA$ACTION <> 'DELETE' THEN INSERT\n  (order_id, amount, status, updated_at, ordered_at)\n  VALUES (s.order_id, s.amount, s.status, s.updated_at, s.ordered_at);"
    note: "Consuming the stream in MERGE advances the offset. Failed tasks must not be 'fixed' by skipping the stream."
  - label: "Dynamic Table gold"
    code: "CREATE OR REPLACE DYNAMIC TABLE analytics.gold.orders_daily\n  TARGET_LAG = '1 hour'\n  WAREHOUSE = etl_wh\nAS\nSELECT DATE_TRUNC('day', ordered_at) AS event_date,\n       SUM(amount) AS revenue,\n       COUNT(*) AS order_cnt\nFROM analytics.silver.orders\nWHERE status = 'paid'\nGROUP BY 1;"
    note: "Declarative lag-targeted mart. Practice SELECT-shaped gold in the local lab on day-0 / architecture lessons."
quiz:
  - question: "COPY INTO vs the Stream/Task MERGE — who does which job?"
    options:
      - "COPY lands files into raw; Stream+Task (or a MERGE job) folds row changes into silver"
      - "COPY builds the gold mart"
      - "Streams replace file formats"
      - "Dynamic Tables load S3"
    answer: 0
    explanation: "Stages + COPY are the file door. Streams/Tasks or SQL MERGE apply change. DTs (or Tasks) publish marts."
  - question: "When is a Dynamic Table a better gold than a hand-rolled Task?"
    options:
      - "Simple declarative aggregates with a freshness target (TARGET_LAG)"
      - "You need custom METADATA$ACTION delete handling in the same statement"
      - "You want to paste account passwords"
      - "Always — Tasks are deprecated"
    answer: 0
    explanation: "DTs shine for lag-targeted SELECT marts. Keep Tasks when you need explicit CDC/MERGE control."
  - question: "Why check COPY_HISTORY (or row counts) before enabling the silver Task?"
    options:
      - "Load history is the first ingestion DQ — bad files should not flow into MERGE"
      - "It disables Time Travel"
      - "It creates a Stream automatically"
      - "Gold cannot refresh otherwise"
    answer: 0
    explanation: "File-level success ≠ row-level quality. Gate on history + nulls before CDC consume."
---

This is the **Snowflake ETL builder**: **stage → COPY → Stream/Task silver → Dynamic Table gold**. It ties together [COPY & stages](/training/snowflake/sf-copy-stages-ingestion), [Streams & Tasks](/training/snowflake/sf-streams-tasks), and [Dynamic Tables](/training/snowflake/sf-dynamic-tables). Shared story: **Orders → late events → daily revenue mart**.

Local Practice Lab is on **day-0 / architecture / Dynamic Table** lessons — not a live account. Samples here are copy cards. Open [day-0 objects](/training/snowflake/sf-day0-objects#lab) to run SELECT-shaped catalog/mart SQL.

Use a dedicated **`etl_wh`**. Do not share it with BI ([architecture](/training/snowflake/sf-architecture)).

## End-to-end

```
@stage files  →  COPY raw.orders  →  Stream  →  Task MERGE silver.orders
                                                      ↓
                                         Dynamic Table gold.orders_daily
```

| Layer | Object | Mechanism |
|-------|--------|-----------|
| Land | `analytics.raw.orders` | Internal/external stage + `COPY INTO` (or Snowpipe) |
| Change | `analytics.raw.orders_stream` | Stream on raw |
| Silver | `analytics.silver.orders` | Task `MERGE` + `METADATA$ACTION` |
| Gold | `analytics.gold.orders_daily` | Dynamic Table `TARGET_LAG` **or** a downstream Task |

## 1. Land with COPY

```sql
CREATE STAGE IF NOT EXISTS analytics.raw.orders_ext
  URL = 's3://example-bucket/orders/'
  STORAGE_INTEGRATION = s3_int;

CREATE OR REPLACE FILE FORMAT analytics.raw.csv_ff
  TYPE = CSV
  SKIP_HEADER = 1
  FIELD_OPTIONALLY_ENCLOSED_BY = '"';

COPY INTO analytics.raw.orders
FROM @analytics.raw.orders_ext
FILE_FORMAT = (FORMAT_NAME = 'analytics.raw.csv_ff')
PATTERN = '.*orders_.*[.]csv'
ON_ERROR = 'ABORT_STATEMENT';
```

COPY skips already-loaded files (unless `FORCE`). Two files can still share an `order_id` — that is a later MERGE.

**Ingestion DQ** before you resume Tasks:

```sql
SELECT *
FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(
  TABLE_NAME => 'ANALYTICS.RAW.ORDERS',
  START_TIME => DATEADD('hour', -24, CURRENT_TIMESTAMP())
));
```

Finance drops: `ABORT_STATEMENT`. Dirty clickstream: `CONTINUE` plus a rescued-row metric.

## 2. Silver — Stream + Task

```sql
CREATE STREAM IF NOT EXISTS analytics.raw.orders_stream
  ON TABLE analytics.raw.orders;

CREATE OR REPLACE TASK analytics.silver.load_orders
  WAREHOUSE = etl_wh
  SCHEDULE = 'USING CRON 15 * * * * UTC'
AS
MERGE INTO analytics.silver.orders t
USING analytics.raw.orders_stream s
  ON t.order_id = s.order_id
WHEN MATCHED AND s.METADATA$ACTION = 'DELETE' THEN DELETE
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET
  t.amount = s.amount,
  t.status = s.status,
  t.updated_at = s.updated_at,
  t.ordered_at = s.ordered_at
WHEN NOT MATCHED AND s.METADATA$ACTION <> 'DELETE' THEN INSERT
  (order_id, amount, status, updated_at, ordered_at)
  VALUES (s.order_id, s.amount, s.status, s.updated_at, s.ordered_at);
```

`ALTER TASK … RESUME` after you trust COPY_HISTORY. Consuming the stream in a successful MERGE advances the offset — treat failed runs as **replay**, not “skip and hope.”

## 3. Gold — Dynamic Table (default)

```sql
CREATE OR REPLACE DYNAMIC TABLE analytics.gold.orders_daily
  TARGET_LAG = '1 hour'
  WAREHOUSE = etl_wh
AS
SELECT
  DATE_TRUNC('day', ordered_at) AS event_date,
  SUM(amount) AS revenue,
  COUNT(*) AS order_cnt
FROM analytics.silver.orders
WHERE status = 'paid'
GROUP BY 1;
```

**Pick DT** when gold is a declarative aggregate with a freshness target. **Pick a Task** when you need custom CDC, odd deletes, or a DQ stored procedure that cannot live in a `SELECT`.

Cost/freshness scorecard: [DT mart capstone](/training/snowflake/sf-capstone-dynamic-table-mart). SQL-shaped gates: [staging→mart ETL](/training/sql/sql-staging-mart-etl).

## Exercises

1. Add `METADATA$ISUPDATE` handling notes: is an update one DELETE+INSERT in the stream or a single UPDATE row for your table type?
2. Write a Task `AFTER analytics.silver.load_orders` that fails if silver has duplicate `order_id`.
3. Choose `TARGET_LAG` for ops (15 min) vs finance (1 hour) and name the warehouse each should use.

---
slug: dbx-delta-write-preview
track: databricks
title: "Delta write preview — MERGE without mutating"
description: "Treat Delta MERGE / UPDATE / DELETE as a contract: preview the set, land in bronze/silver, then mutate a disposable table. The local lab is read-only."
level: beginner
order: -6
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Preview the exact keys a MERGE would match or insert before you run it"
  - "Prefer MERGE into silver over UPDATE-in-place on gold"
  - "Know the local lab refuses DML — copy Delta writes into a workspace"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Preview rows a write would touch"
    code: "SELECT order_id, region, status, amount\nFROM bronze_orders\nWHERE status = 'ok' AND order_date <= DATE '2026-09-02'\nORDER BY order_id;"
    note: "Lab v1 is SELECT/WITH only. Run this preview here, then copy MERGE into a Databricks notebook."
  - label: "Upsert-shaped join (Delta idea)"
    code: "SELECT\n  COALESCE(u.order_id, t.order_id) AS order_id,\n  COALESCE(u.region, t.region) AS region,\n  COALESCE(u.status, t.status) AS status,\n  COALESCE(u.amount, t.amount) AS amount\nFROM silver_orders t\nFULL OUTER JOIN bronze_orders u ON t.order_id = u.order_id\nORDER BY order_id;"
    note: "DuckDB stand-in for MERGE INTO … WHEN MATCHED / NOT MATCHED. Spark SQL / Delta syntax differs."
  - label: "MERGE into silver (workspace)"
    code: "-- Dialect: Spark SQL / Delta (workspace only)\nMERGE INTO silver.orders t\nUSING bronze.orders_delta u\nON t.order_id = u.order_id\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;"
    note: "Silver is the airlock. Do not MERGE directly into a BI gold table from a laptop notebook."
quiz:
  - question: "Why preview bronze keys before MERGE into silver?"
    options:
      - "Preview is always cheaper than storage"
      - "You can inspect match vs insert counts before silver changes"
      - "MERGE cannot update status"
      - "INSERT is illegal on Delta"
    answer: 1
    explanation: "A FULL OUTER join (or MERGE metrics) tells you what will match. If the set looks wrong, drop the delta and reload."
  - question: "The local practice lab refuses INSERT/UPDATE/DELETE. What should you run there?"
    options:
      - "A Python runtime"
      - "A SELECT that previews the rows a MERGE would touch"
      - "CREATE SECRET"
      - "dbutils.fs.mount"
    answer: 1
    explanation: "Lab v1 is read-only against local DuckDB tables. Preview first, mutate in the workspace."
  - question: "A production DELETE FROM gold.orders with no WHERE…"
    options:
      - "Is the fastest safe truncate"
      - "Can empty the mart — require a keyed predicate you can re-select"
      - "Only drops NULLs"
      - "Is the same as OPTIMIZE"
    answer: 1
    explanation: "Unqualified DELETE is a wipe. Prefer replacing a silver table, or DELETE with a keyed window you previewed. OPTIMIZE is maintenance, not a write strategy."
---

Delta writes are how gold goes wrong. This lesson is **preview-first**: inspect the landing, then MERGE a disposable silver table. The **local practice lab** only runs `SELECT` / `WITH` — use it to preview the set, then copy Delta DML into a workspace.

## MERGE is a join you can name

`WHEN MATCHED` is the inner set. `WHEN NOT MATCHED` is the leftover bronze keys. Preview both before you schedule the Job.

```sql
-- Lab-safe preview (run here)
SELECT order_id, status, amount
FROM bronze_orders
WHERE status = 'ok';
```

Then in Databricks:

```sql
-- Dialect: Spark SQL / Delta (workspace)
MERGE INTO silver.orders t
USING bronze.orders_delta u
ON t.order_id = u.order_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

Tie MATCHED to a business rule (same `order_id`, newer file), not “touch every row.”

## UPDATE / DELETE

Update **keys you can name**. Delete is a filter you cannot undo without Time Travel or a bronze replay. Prefer `CREATE OR REPLACE` on a staging Delta table over deleting from gold.

## Exercises

1. Run the upsert-shaped join in the lab and list `order_id`s that exist only in bronze.
2. Sketch `MERGE INTO silver.orders` for one date partition.
3. Explain why `DELETE FROM gold.orders_daily` with no WHERE is not an incremental Job.

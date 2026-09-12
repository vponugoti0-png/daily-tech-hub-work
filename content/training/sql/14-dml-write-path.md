---
slug: sql-dml-write-path
track: sql
title: "INSERT, UPDATE, DELETE on staging"
description: "Treat writes as a contract: insert into replaceable staging, update only a previewed set, delete with a WHERE you can re-run. The local lab previews rows — it does not mutate."
level: beginner
order: -6
durationMinutes: 25
topics: [sql]
objectives:
  - "Land rows into a disposable staging table instead of writing facts in place"
  - "Preview the exact set an UPDATE or DELETE would touch before you run it"
  - "Prefer INSERT … SELECT from a constrained query over VALUES in production jobs"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Preview rows a write would touch"
    code: "SELECT order_id, status, amount, order_date\nFROM aurora_orders\nWHERE status = 'pending' AND order_date <= DATE '2026-09-02'\nORDER BY order_id;"
    note: "The local practice lab is read-only. Run this preview here, then copy the UPDATE into your warehouse."
  - label: "INSERT … SELECT into staging (warehouse)"
    code: "-- Dialect: ANSI-shaped (copy into your warehouse — not the local lab)\nCREATE OR REPLACE TABLE staging.aurora_orders_delta AS\nSELECT order_id, customer_id, order_date, status, amount, promo_code\nFROM raw.aurora_orders\nWHERE order_date >= DATE '2026-09-01';"
    note: "Staging is disposable. Raw stays the replay log. Do not UPDATE raw."
  - label: "UPDATE / DELETE with a keyed WHERE"
    code: "-- Dialect: ANSI-shaped (warehouse only)\nUPDATE staging.aurora_orders_delta\nSET status = 'paid'\nWHERE status = 'pending' AND order_id IN (1003);\n\nDELETE FROM staging.aurora_orders_delta\nWHERE status = 'cancelled' AND order_date < DATE '2026-01-01';"
    note: "No WHERE-less UPDATE/DELETE. Re-run the SELECT preview after the write."
quiz:
  - question: "Why land an incremental into staging instead of UPDATEing the mart in place?"
    options:
      - "Staging is always cheaper"
      - "You can inspect, gate, and replay before the mart changes"
      - "UPDATE cannot change status"
      - "INSERT is illegal on facts"
    answer: 1
    explanation: "Staging is the airlock. If the set looks wrong, drop it and reload from raw."
  - question: "The local practice lab refuses INSERT/UPDATE/DELETE. What should you run there?"
    options:
      - "A Python runtime"
      - "A SELECT that previews the rows a write would touch"
      - "CREATE SECRET"
      - "A stored procedure call"
    answer: 1
    explanation: "Lab v1 is read-only SELECT/WITH against local DuckDB tables. Preview first, mutate in the warehouse."
  - question: "A production DELETE without a WHERE clause…"
    options:
      - "Is the fastest way to truncate a mart safely"
      - "Can empty the table — require a predicate you can re-select"
      - "Only drops NULLs"
      - "Is the same as INSERT … SELECT"
    answer: 1
    explanation: "Unqualified DELETE is a wipe. Prefer CREATE OR REPLACE of a staging table, or DELETE with a keyed window you previewed."
---

Writes are how marts go wrong. This lesson is **staging-first**: land, preview, then mutate a disposable table. The **local practice lab** on this page only runs `SELECT` / `WITH` — use it to preview the set, then copy DML into Snowflake, Spark SQL, or Postgres.

## INSERT

`VALUES` is for fixtures. Jobs use `INSERT … SELECT` (or `CREATE OR REPLACE TABLE … AS SELECT`) from a windowed query.

```sql
-- Dialect: ANSI-shaped (warehouse)
INSERT INTO staging.aurora_orders_delta (order_id, customer_id, status, amount)
SELECT order_id, customer_id, status, amount
FROM raw.aurora_orders
WHERE order_date = DATE '2026-09-10';
```

`INSERT INTO … SELECT` copies a result set. It is not a stored procedure. Column lists keep a new raw field from landing in the wrong order.

## UPDATE

Update **keys you can name**. Preview first:

```sql
-- Lab-safe preview (run here)
SELECT order_id, status
FROM aurora_orders
WHERE status = 'pending';
```

Then in the warehouse:

```sql
UPDATE staging.aurora_orders_delta
SET status = 'paid'
WHERE order_id = 1003 AND status = 'pending';
```

Tie the SET to a business rule (`pending` → `paid` after capture), not “touch every row.”

## DELETE

Delete is a filter you cannot undo without raw. Prefer replacing a staging table over deleting from a mart. If you must delete, the WHERE should be a query you already ran as a SELECT.

## Exercises

1. Write a SELECT that lists `aurora_orders` rows a job would mark `paid` (status `pending`, `order_date` on or before `2026-09-02`).
2. Sketch `CREATE OR REPLACE TABLE staging.aurora_orders_delta AS SELECT …` for one date.
3. Explain why `DELETE FROM mart.orders` with no WHERE is not an incremental strategy.

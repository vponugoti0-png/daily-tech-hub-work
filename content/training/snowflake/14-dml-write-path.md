---
slug: sf-dml-write-path
track: snowflake
title: "INSERT, UPDATE, MERGE on staging"
description: "Treat writes as a contract: insert into replaceable staging, MERGE from a Stream, delete with a WHERE you can re-run. The local lab previews rows — it does not mutate."
level: beginner
order: -6
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Land rows into disposable staging instead of UPDATEing a Dynamic Table in place"
  - "Preview the exact set an UPDATE or MERGE would touch"
  - "Prefer INSERT … SELECT / MERGE from a constrained query over VALUES in Tasks"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Preview rows a write would touch"
    code: "SELECT order_id, status, amount, order_date\nFROM sf_orders\nWHERE status = 'pending' AND order_date <= DATE '2026-09-02'\nORDER BY order_id;"
    note: "The local practice lab is read-only. Run this preview here, then copy MERGE into a Snowflake worksheet."
  - label: "INSERT … SELECT into staging (account)"
    code: "-- Dialect: Snowflake (copy into your account — not the local lab)\nCREATE OR REPLACE TABLE analytics.staging.orders_delta AS\nSELECT order_id, customer_id, order_date, status, amount, promo_code\nFROM analytics.raw.orders\nWHERE order_date >= DATE '2026-09-01';"
    note: "Staging is disposable. Raw stays the replay log. Do not UPDATE raw."
  - label: "MERGE from a stream-shaped set (account)"
    code: "-- Dialect: Snowflake (account only)\nMERGE INTO analytics.analytics.orders t\nUSING analytics.staging.orders_delta s\nON t.order_id = s.order_id\nWHEN MATCHED THEN UPDATE SET status = s.status, amount = s.amount\nWHEN NOT MATCHED THEN INSERT *;"
    note: "No WHERE-less UPDATE/DELETE. Re-run the SELECT preview after the write. Streams + Tasks wrap this shape."
  - label: "Preview pending writes"
    code: "SELECT order_id, status, amount, order_date\nFROM sf_orders\nWHERE status = 'pending' AND order_date <= DATE '2026-09-02';"
    note: "Read-only lab. Preview the MERGE set, then copy DML to an account."
quiz:
  - question: "Why land an incremental into staging instead of UPDATEing the mart in place?"
    options:
      - "Staging is always cheaper than credits"
      - "You can inspect, gate, and replay before the mart changes"
      - "UPDATE cannot change status"
      - "INSERT is illegal on facts"
    answer: 1
    explanation: "Staging is the airlock. If the set looks wrong, drop it and reload from raw or Time Travel."
  - question: "The local practice lab refuses INSERT/UPDATE/DELETE. What should you run there?"
    options:
      - "A Python runtime"
      - "A SELECT that previews the rows a write would touch"
      - "CREATE SECRET"
      - "A stored procedure call"
    answer: 1
    explanation: "Lab v1 is read-only SELECT/WITH against local DuckDB tables. Preview first, mutate in the account."
  - question: "A production DELETE FROM mart.orders with no WHERE…"
    options:
      - "Is the fastest safe truncate"
      - "Can empty the table — require a predicate you can re-select"
      - "Only drops NULLs"
      - "Is the same as UNDROP"
    answer: 1
    explanation: "Unqualified DELETE is a wipe. Prefer CREATE OR REPLACE of staging, or DELETE with a keyed window. UNDROP is a recovery hatch, not a strategy."
  - question: "MERGE without a preview SELECT is how you…"
    options:
      - "Save credits always"
      - "Update the wrong grain — preview pending / matched keys first"
      - "Enable Time Travel"
      - "Skip RBAC"
    answer: 1
    explanation: "The dml-preview sample is the habit."
  - question: "Why won’t this lab run MERGE?"
    options:
      - "Snowflake cannot MERGE"
      - "Guard allows SELECT/WITH only — writes belong in an account you can Time Travel"
      - "MERGE is deprecated"
      - "Streams replace MERGE"
    answer: 1
    explanation: "Honest engine."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Writes are how marts go wrong. This lesson is **staging-first**: land, preview, then MERGE a disposable table. The **local practice lab** only runs `SELECT` / `WITH`.

## INSERT

`VALUES` is for fixtures. Tasks use `INSERT … SELECT` (or `CREATE OR REPLACE TABLE … AS SELECT`) from a windowed query or a Stream.

```sql
-- Dialect: Snowflake (account)
INSERT INTO analytics.staging.orders_delta (order_id, customer_id, status, amount)
SELECT order_id, customer_id, status, amount
FROM analytics.raw.orders
WHERE order_date = DATE '2026-09-03';
```

## UPDATE / MERGE

Update **keys you can name**. Preview first in the lab, then MERGE in the account. Tie MATCHED to a business rule, not “touch every row.”

## DELETE

Delete is a filter you cannot undo without Time Travel or raw. Prefer replacing staging over deleting from a Dynamic Table.

## Exercises

1. Write a SELECT that lists `sf_orders` rows a job would mark `paid` (status `pending`).
2. Sketch `CREATE OR REPLACE TABLE analytics.staging.orders_delta AS SELECT …` for one date.
3. Explain why `DELETE FROM mart.orders` with no WHERE is not an incremental Task.

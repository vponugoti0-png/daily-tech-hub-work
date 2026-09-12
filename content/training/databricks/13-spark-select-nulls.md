---
slug: dbx-spark-select-nulls
track: databricks
title: "Spark SQL SELECT, NULLs, and LIMIT"
description: "Lakehouse-flavored SELECT: project bronze/silver grain, filter with AND/OR, treat NULL amount as unknown, and cap exploration with LIMIT — not a production incremental."
level: beginner
order: -7
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Write a grain-safe Spark SQL SELECT against bronze or silver, not SELECT * into gold"
  - "Treat NULL measures as unknown — IS NULL / IS NOT NULL, never amount = NULL"
  - "Use LIMIT as a notebook sample cap, not a Job watermark"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Silver rows, newest first"
    code: "SELECT order_id, order_date, region, status, amount\nFROM silver_orders\nWHERE status <> 'returned'\nORDER BY order_date DESC, order_id DESC\nLIMIT 5;"
    note: "Run in the local practice lab (DuckDB stand-in). Spark SQL LIMIT is a sample — Jobs filter on a date partition or Autoloader checkpoint."
  - label: "Bronze NULL amount (corrupt landings)"
    code: "SELECT order_id, order_date, region, status, amount\nFROM bronze_orders\nWHERE amount IS NULL OR status = 'corrupt'\nORDER BY order_id;"
    note: "amount = NULL matches zero rows. Silver in this seed drops corrupt bronze — that is the quality contract, not a silent coerce-to-zero."
  - label: "AND / OR without surprise"
    code: "SELECT order_id, region, status, amount\nFROM silver_orders\nWHERE region IN ('west', 'east')\n  AND NOT (amount < 10)\n  AND (status = 'ok' OR status = 'returned')\nORDER BY order_id;"
    note: "Parenthesize OR. catalog.schema.table is the Unity Catalog name; this lab uses unqualified local tables."
quiz:
  - question: "A bronze landing has amount IS NULL and status = 'corrupt'. What should silver do?"
    options:
      - "Coerce amount to 0 and keep the row as ok"
      - "Drop or quarantine the row so gold never sums a fake zero"
      - "SELECT DISTINCT amount"
      - "LIMIT 1 in the Job"
    answer: 1
    explanation: "Corrupt bronze is a quality event. Zero-filling hides the landing bug and lies in gold revenue."
  - question: "LIMIT 5 on a silver extract for a daily gold Job…"
    options:
      - "Is a fine production incremental"
      - "Is a notebook/lab sample — production uses a partition window or Autoloader checkpoint"
      - "Replaces ORDER BY"
      - "Drops NULLs automatically"
    answer: 1
    explanation: "LIMIT is exploration. Pipelines prove completeness with a date partition, a watermark, or a streaming offset."
  - question: "WHERE amount = NULL on bronze_orders returns…"
    options:
      - "Every corrupt row"
      - "Zero rows — use IS NULL"
      - "The gold mart"
      - "A Unity Catalog volume"
    answer: 1
    explanation: "NULL equality is unknown. IS NULL is the predicate. Three-level names do not change that."
---

True-zero Spark SQL for lakehouse work. Guest-friendly — run the samples in the **local practice lab** on this page (DuckDB in the browser, not a live Databricks workspace).

## Project the layer you mean

```sql
-- Dialect: Spark SQL-shaped (lab is DuckDB)
SELECT order_id, region, status, amount
FROM silver_orders
WHERE status <> 'corrupt'
ORDER BY order_date, order_id;
```

One row in `silver_orders` is one `order_id`. `SELECT DISTINCT region` is a **dimension** question. `SELECT DISTINCT amount` usually hid a duplicate-key bug.

In a notebook, `SELECT *` is fine. In a silver contract, list columns so a new Autoloader field cannot silently change the grain.

Unity Catalog names look like `main.silver.orders`. This lab’s tables are local stand-ins (`bronze_orders`, `silver_orders`, `gold_daily_orders`).

## NULL is unknown

Bronze in this seed has a corrupt landing with `amount` NULL. `amount = NULL` filters **zero** rows. Use `IS NULL`. Do not `COALESCE(amount, 0)` on the way to gold unless the product owner named that default.

## LIMIT vs a Job window

Spark SQL and SQL warehouses: `LIMIT n`. All-purpose notebooks use it to peek. A scheduled Job uses `order_date` (or a streaming checkpoint), not `LIMIT 1000`.

## Exercises

1. Select west-region silver rows ordered by `amount` descending, limited to 5.
2. Count bronze rows whose `amount` is NULL without using `= NULL`.
3. Explain why a gold Job that `LIMIT`s 100 rows is not an incremental Autoloader pipeline.

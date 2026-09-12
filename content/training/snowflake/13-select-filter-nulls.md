---
slug: sf-select-filter-nulls
track: snowflake
title: "SELECT, filters, NULLs on SAMPLE"
description: "Warehouse-flavored SELECT: project SAMPLE grain, filter with AND/OR, treat NULL promo as unknown, and cap exploration with LIMIT — not a Task watermark."
level: beginner
order: -7
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Write a grain-safe SELECT against SAMPLE-style orders, not SELECT * into a Dynamic Table"
  - "Treat NULL promo_code as unknown — IS NULL / IS NOT NULL"
  - "Use LIMIT as a worksheet sample, not a Stream/Task incremental"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Paid SAMPLE orders, newest first"
    code: "SELECT o.order_id, c.region, o.status, o.amount, o.promo_code\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nORDER BY o.order_date DESC, o.order_id DESC\nLIMIT 5;"
    note: "Run in the local practice lab (DuckDB stand-in). Snowflake LIMIT / TOP is a sample — Tasks filter on a stream offset or a date window."
  - label: "NULL-aware promo gap"
    code: "SELECT\n  COUNT(*) AS orders,\n  COUNT(promo_code) AS with_promo,\n  COUNT(*) - COUNT(promo_code) AS missing_promo\nFROM sf_orders;"
    note: "COUNT(col) skips NULLs. promo_code = NULL is never TRUE. database.schema.table is the Snowflake name; this lab uses unqualified local tables."
  - label: "AND / OR without surprise"
    code: "SELECT order_id, status, amount, promo_code\nFROM sf_orders\nWHERE status IN ('paid', 'pending')\n  AND NOT (amount < 15)\n  AND (promo_code IS NOT NULL OR amount >= 20)\nORDER BY order_id;"
    note: "Parenthesize OR. The warehouse name is compute — it is not in the table path."
  - label: "North / LATAM paid"
    code: "SELECT o.order_id, c.region, o.amount, o.promo_code\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid' AND c.region IN ('north', 'latam');"
    note: "Wave A1 SAMPLE customers. promo_code = NULL is never TRUE."
quiz:
  - question: "You need every paid sf_orders row, including unknown promo_code. Which predicate is safe?"
    options:
      - "WHERE promo_code = NULL"
      - "WHERE promo_code IS NULL OR promo_code IS NOT NULL — and also status = 'paid'"
      - "WHERE status = 'paid'"
      - "WHERE DISTINCT promo_code"
    answer: 2
    explanation: "Filter the business status. Equality to NULL is never true. DISTINCT is a projection, not a WHERE clause."
  - question: "LIMIT 5 on a paid-order extract for a Dynamic Table…"
    options:
      - "Is a fine production incremental"
      - "Is a worksheet/lab sample — production incrementals use a stream, a date window, or the DT lag"
      - "Replaces ORDER BY"
      - "Drops NULLs automatically"
    answer: 1
    explanation: "LIMIT/TOP is exploration. Pipelines prove completeness with a watermark, a stream, or a lag you can name."
  - question: "SELECT DISTINCT amount on SAMPLE orders usually means…"
    options:
      - "A correct gold grain"
      - "You hid a duplicate-key bug or asked a dimension question"
      - "Time Travel is on"
      - "The warehouse is XSMALL"
    answer: 1
    explanation: "DISTINCT hides grain. Name the key first. Revenue uses SUM/GROUP BY, not DISTINCT amount."
  - question: "COUNT(promo_code) on sf_orders counts…"
    options:
      - "All SAMPLE orders"
      - "Rows with a non-NULL promo — COUNT(*) is the order count"
      - "Warehouses"
      - "Time Travel versions"
    answer: 1
    explanation: "Same NULL lesson as Aurora SQL."
  - question: "LIMIT 5 on a SAMPLE worksheet is…"
    options:
      - "A Task incremental"
      - "A sample cap — Tasks / DTs use a stream or a date window"
      - "How you drop pending rows"
      - "A clone"
    answer: 1
    explanation: "Exploration vs pipeline."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

True-zero Snowflake SQL for warehouse work. Guest-friendly — run the samples in the **local practice lab** on this page (DuckDB in the browser, **not a live Snowflake account**).

## Project the grain you mean

```sql
-- Dialect: Snowflake-shaped (lab is DuckDB)
SELECT o.order_id, c.region, o.status, o.amount
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
WHERE o.status <> 'pending'
ORDER BY o.order_date, o.order_id;
```

One row in `sf_orders` is one `order_id`. `SELECT DISTINCT region` is a **dimension** question.

Snowflake names look like `analytics.raw.orders`. This lab’s tables are local stand-ins (`sf_orders`, `sf_customers`). The **warehouse** (`learn_wh`) is compute — it does not appear in the table path.

## NULL is unknown

`promo_code = NULL` filters **zero** rows. Use `IS NULL`. `COUNT(promo_code)` is “how many rows have a code,” not “how many orders.”

## LIMIT vs TOP vs a Task

Worksheets: `LIMIT n` or `TOP n`. A Stream + Task or Dynamic Table uses a change set or a lag, not `LIMIT 1000`.

## Exercises

1. Select paid `sf_orders` in the west region ordered by `amount` descending, limited to 5.
2. Count orders whose `promo_code` is NULL without using `= NULL`.
3. Explain why a Dynamic Table that `LIMIT`s 100 rows is not an incremental.

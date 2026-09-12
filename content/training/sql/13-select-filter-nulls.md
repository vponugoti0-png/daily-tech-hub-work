---
slug: sql-select-filter-nulls
track: sql
title: "SELECT, filters, NULLs, and LIMIT"
description: "Aurora-flavored SELECT: project the grain you mean, filter with AND/OR/NOT, sort, treat NULL as unknown, and cap result sets with LIMIT."
level: beginner
order: -7
durationMinutes: 30
topics: [sql]
objectives:
  - "Write a grain-safe SELECT with DISTINCT only when the grain is a unique key"
  - "Combine WHERE predicates with AND / OR / NOT without changing the question"
  - "Treat NULL as unknown — use IS NULL / IS NOT NULL, and LIMIT (or TOP) as a sample, not a metric"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Paid orders, newest first"
    code: "SELECT order_id, status, amount, promo_code\nFROM aurora_orders\nWHERE status = 'paid'\nORDER BY order_date DESC, order_id DESC\nLIMIT 5;"
    note: "LIMIT (Snowflake/DuckDB/Postgres) or QUALIFY/TOP (warehouse dialects) is a sample cap — never a substitute for a date window in ETL."
  - label: "AND / OR / NOT without surprise"
    code: "SELECT order_id, status, amount\nFROM aurora_orders\nWHERE status IN ('paid', 'pending')\n  AND NOT (amount < 10)\n  AND (promo_code IS NOT NULL OR amount >= 20)\nORDER BY order_id;"
    note: "Parenthesize OR. NOT IN plus a NULL list is a foot-gun — prefer NOT EXISTS later, or IS NOT NULL first."
  - label: "NULL-aware promo gap"
    code: "SELECT\n  COUNT(*) AS orders,\n  COUNT(promo_code) AS with_promo,\n  COUNT(*) - COUNT(promo_code) AS missing_promo\nFROM aurora_orders;"
    note: "COUNT(col) skips NULLs. promo_code = NULL is never TRUE. Run this shape in the local practice lab."
  - label: "North + EMEA paid"
    code: "SELECT o.order_id, c.region, o.amount\nFROM aurora_orders o\nJOIN aurora_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid' AND c.region IN ('north', 'emea')\nORDER BY o.amount DESC;"
    note: "Wave A1 extra customers. Run it in the local lab — not a live warehouse."
quiz:
  - question: "You need every paid aurora_orders row, including rows whose promo_code is unknown. Which predicate is safe?"
    options:
      - "WHERE promo_code = NULL"
      - "WHERE promo_code IS NULL OR promo_code IS NOT NULL — and also status = 'paid'"
      - "WHERE status = 'paid'"
      - "WHERE DISTINCT promo_code"
    answer: 2
    explanation: "Filter the business status. Equality to NULL is never true. DISTINCT is a projection, not a WHERE clause."
  - question: "When is SELECT DISTINCT the right default on a fact table?"
    options:
      - "Always — duplicates are always a bug"
      - "Only when you have already named the grain and the leftover columns are a unique key"
      - "Whenever LIMIT 10 feels slow"
      - "Instead of GROUP BY for revenue"
    answer: 1
    explanation: "DISTINCT hides a grain bug. Name the key first. Revenue uses SUM/GROUP BY, not DISTINCT amount."
  - question: "LIMIT 5 on a paid-order extract for a daily mart…"
    options:
      - "Is a fine production incremental"
      - "Is a lab/sample cap — production incrementals use a watermark or date window"
      - "Replaces ORDER BY"
      - "Drops NULLs automatically"
    answer: 1
    explanation: "LIMIT/TOP is for exploration. Pipelines filter on load time or a high-watermark, then prove completeness."
  - question: "WHERE amount != 0 drops which rows you might have wanted?"
    options:
      - "Only zeros"
      - "Zeros and also NULLs — NULL compared with != is unknown, not true"
      - "Only VIP promos"
      - "Nothing — != is NULL-safe"
    answer: 1
    explanation: "NULL is unknown. Use IS NOT NULL if you mean “has an amount,” then compare."
  - question: "A SELECT for a daily mart should prefer…"
    options:
      - "LIMIT 1000 and hope"
      - "A date window or watermark predicate, then prove completeness"
      - "SELECT DISTINCT amount"
      - "ORDER BY RANDOM()"
    answer: 1
    explanation: "LIMIT is a sample cap. Pipelines filter on load time or a high-watermark."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

True-zero SELECT for warehouse work. Guest-friendly — run the samples in the **local practice lab** on this page (DuckDB in the browser, not a live warehouse).

### Seed demo (5 rows)

These five rows are a slice of `aurora_orders` in the local lab — the same seed the Practice editor runs. No second dataset.

| order_id | customer_id | order_date | status | amount | promo_code |
|----------|-------------|------------|--------|--------|------------|
| 1001 | 1 | 2026-09-01 | paid | 42.50 | FALL26 |
| 1002 | 2 | 2026-09-01 | paid | 18.00 | NULL |
| 1003 | 1 | 2026-09-02 | pending | 99.00 | FALL26 |
| 1004 | 3 | 2026-09-02 | cancelled | 12.00 | WIN25 |
| 1005 | 2 | 2026-09-03 | paid | 64.25 | VIP |

```sql
SELECT order_id, customer_id, order_date, status, amount, promo_code
FROM aurora_orders
ORDER BY order_id
LIMIT 5;
```

## Project the grain you mean

```sql
-- Dialect: ANSI
SELECT order_id, customer_id, status, amount
FROM aurora_orders
WHERE status <> 'cancelled'
ORDER BY order_date, order_id;
```

One row in `aurora_orders` is one `order_id`. If you `SELECT DISTINCT region` you asked a **dimension** question. If you `SELECT DISTINCT amount` you probably hid a duplicate-key bug.

`SELECT *` is fine in a lab. In a staging contract, list columns so a new raw field cannot silently change the grain.

## AND, OR, NOT

`AND` narrows. `OR` widens. `NOT` flips a predicate — it does not flip NULL to TRUE.

```sql
-- Paid or pending, but skip tiny cancelled-looking leftovers
SELECT order_id, status, amount
FROM aurora_orders
WHERE (status = 'paid' OR status = 'pending')
  AND NOT amount < 1
ORDER BY order_id;
```

Prefer `status IN ('paid', 'pending')` over a long OR chain. Parenthesize mixed AND/OR so a reviewer cannot misread the question.

## NULL is unknown

`promo_code = NULL` filters **zero** rows. Use `IS NULL` / `IS NOT NULL`. Aggregates skip NULL inputs: `COUNT(promo_code)` is “how many rows have a code,” not “how many orders.”

## LIMIT vs TOP

DuckDB, Postgres, Spark SQL: `LIMIT n`. SQL Server-shaped warehouses: `SELECT TOP (n)`. Snowflake also has `LIMIT`. All of them are **sample caps**. A daily incremental uses `order_date` or `updated_at`, not `LIMIT 1000`.

## Exercises

1. Select paid `aurora_orders` in the west region (join `aurora_customers`) ordered by `amount` descending, limited to 5.
2. Count orders whose `promo_code` is NULL vs not NULL without using `= NULL`.
3. Rewrite an `OR` chain of three statuses as `IN`. Explain why `NOT IN (SELECT promo_code …)` is unsafe if that subquery can return NULL.

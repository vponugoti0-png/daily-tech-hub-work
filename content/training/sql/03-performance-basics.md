---
slug: sql-performance-basics
track: sql
title: "SQL performance basics for warehouses"
description: "Predicate pushdown, clustering/partition pruning, and reading query profiles without fear."
level: intermediate
order: 3
durationMinutes: 35
topics: [sql, snowflake, databricks]
dialect: ANSI
objectives:
  - "Filter early and select only needed columns"
  - "Understand pruning vs full scans"
  - "Spot broadcast vs shuffle joins at a high level"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Selectivity"
    code: "SELECT order_id, status, amount\nFROM aurora_orders\nWHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-04';"
    note: "Filter on the date column as a column — wrapping it in a function blocks pruning."
  - label: "Avoid SELECT *"
    code: "SELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE status = 'paid';"
    note: "Name the columns you will shuffle or serve."
  - label: "Aggregate after the filter"
    code: "SELECT c.region, COUNT(*) AS n, ROUND(SUM(o.amount), 2) AS revenue\nFROM aurora_orders o\nJOIN aurora_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.region;"
    note: "WHERE then GROUP BY. Do not SUM(order.amount) after joining items."
quiz:
  - question: "Applying a function to a filter column often…"
    options:
      - "Helps pruning"
      - "Prevents partition/cluster pruning"
      - "Deletes data"
      - "Creates indexes automatically"
    answer: 1
  - question: "Filter on order_date early because…"
    options:
      - "Dates are prettier"
      - "Warehouses can prune partitions / micro-partitions and read less data"
      - "WHERE is deprecated"
      - "ORDER BY is enough"
    answer: 1
    explanation: "Predicate pushdown / pruning. SELECT * plus a late filter is a full scan habit."
  - question: "SELECT * in a production mart extract is risky because…"
    options:
      - "Stars are illegal in SQL"
      - "A new raw column silently changes I/O and maybe grain"
      - "* is slower to type"
      - "DuckDB cannot expand *"
    answer: 1
    explanation: "List the contract columns. Labs can use *."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# SQL performance basics for warehouses

> **Dialect:** ANSI / warehouse-agnostic concepts (pruning behavior is similar on Snowflake clustering keys and Spark/Databricks partitions).

- Filter on partition/cluster keys **without wrapping** in functions when possible.
- Project fewer columns — wide rows hurt spill.
- Check query profile: spill, shuffle bytes, pruning %.

```sql
-- Dialect: ANSI (range-friendly predicate; prefer this over wrapping the column)
WHERE ts >= CURRENT_DATE
  AND ts <  CURRENT_DATE + INTERVAL '1' DAY
```

## Exercises

1. Rewrite `WHERE DATE(ts) = CURRENT_DATE` to a range-friendly predicate.
2. Explain why `SELECT *` into a BI tool hurts more than in a tiny ad-hoc query.

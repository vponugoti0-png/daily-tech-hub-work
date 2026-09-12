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
    code: "SELECT order_id, amount\nFROM orders\nWHERE event_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-07';"
    note: "Bare date columns prune. Wrapping the column in a function often blocks it."
  - label: "Avoid SELECT *"
    code: "SELECT order_id, event_date, amount FROM orders;"
    note: "Project the contract. * pulls unused VARIANT and wrecks scan cost."
  - label: "Filter before join"
    code: "SELECT o.order_id, c.region\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nWHERE o.event_date >= DATE '2026-09-01';"
    note: "Push the date window to the fact side before the shuffle."
quiz:
  - question: "Applying a function to a filter column often…"
    options:
      - "Helps pruning"
      - "Prevents partition/cluster pruning"
      - "Deletes data"
      - "Creates indexes automatically"
    answer: 1
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

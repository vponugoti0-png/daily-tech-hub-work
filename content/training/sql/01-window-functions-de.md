---
slug: sql-window-functions-de
track: sql
title: "Window functions for data engineers"
description: "RANK, LAG/LEAD, running totals, and sessionization patterns used in warehouses daily."
level: beginner
order: 1
durationMinutes: 35
topics: [sql]
dialect: ANSI
objectives:
  - "Use PARTITION BY / ORDER BY correctly"
  - "Build SCD-friendly change detection with LAG"
  - "Avoid explosive joins when windows suffice"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Latest per key"
    code: "SELECT *\nFROM (\n  SELECT o.*,\n    ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) AS rn\n  FROM orders o\n) t\nWHERE rn = 1;"
    note: "ROW_NUMBER is unique per partition. Filter rn = 1 for current grain."
  - label: "Prev value"
    code: "SELECT order_id, status,\n  LAG(status) OVER (PARTITION BY order_id ORDER BY updated_at) AS prev_status\nFROM orders;"
    note: "LAG is SCD-friendly change detection — no self-join required."
  - label: "Running total"
    code: "SELECT order_date, amount,\n  SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_amt\nFROM orders;"
    note: "Windows beat explosive self-joins for running metrics."
quiz:
  - question: "ROW_NUMBER vs RANK when ties share the same ORDER BY value?"
    options:
      - "They always match"
      - "ROW_NUMBER unique; RANK can repeat with gaps"
      - "RANK is always unique"
      - "ROW_NUMBER skips numbers"
    answer: 1
---

# Window functions for data engineers

> **Dialect:** ANSI SQL (portable across Snowflake, Spark SQL, and most warehouses).

```sql
-- Dialect: ANSI
SELECT *
FROM (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts DESC) AS rn
  FROM events
) e
WHERE rn = 1;
```

## Change detection

```sql
-- Dialect: ANSI
LAG(status) OVER (PARTITION BY account_id ORDER BY updated_at) AS prev_status
```

## Exercises

1. Sessionize events with 30-minute gaps using LAG + cumulative sum.
2. Compute a 7-day running count of orders per customer.

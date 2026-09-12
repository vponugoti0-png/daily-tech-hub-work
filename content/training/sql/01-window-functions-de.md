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
    code: "SELECT order_id, customer_id, order_date, amount,\n  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn\nFROM aurora_orders;"
    note: "Keep rn = 1 for the current row. Copy into a warehouse — this lesson is not a lab host."
  - label: "Prev value"
    code: "SELECT order_id, status, amount,\n  LAG(status) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_status\nFROM aurora_orders;"
    note: "LAG is change detection. A join to the previous load is usually worse."
  - label: "Running revenue"
    code: "SELECT order_date, amount,\n  SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_amount\nFROM aurora_orders\nWHERE status = 'paid';"
    note: "Windows do not explode grain the way a self-join can."
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

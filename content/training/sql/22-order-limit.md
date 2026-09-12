---
slug: sql-ex-order-limit
track: sql
title: "ORDER BY and the LIMIT / TOP mindset"
description: "Sort result rows and cap them with LIMIT — the portable cousin of SELECT TOP."
level: beginner
order: 22
durationMinutes: 18
topics: [sql]
objectives:
  - "Sort by one or more columns, including descending freight"
  - "Treat LIMIT / FETCH FIRST / TOP as the same habit: sort, then cap"
  - "Know that ORDER BY without a cap is a full sort — spend it on purpose"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "ORDER BY freight DESC"
    code: "SELECT order_id, freight, status\nFROM lab_orders\nWHERE freight IS NOT NULL\nORDER BY freight DESC;"
    note: "DESC for highest first. NULL freight is filtered so the sort stays honest."
  - label: "LIMIT 3 (TOP mindset)"
    code: "SELECT order_id, freight, status\nFROM lab_orders\nWHERE freight IS NOT NULL\nORDER BY freight DESC\nLIMIT 3;"
    note: "SQL Server writes SELECT TOP 3 … ORDER BY. Same idea: cap after sort."
  - label: "Two-key sort"
    code: "SELECT company, region, city\nFROM lab_customers\nORDER BY region, company;"
    note: "First key groups, second key breaks ties. Add a unique column if you need a stable order."
quiz:
  - question: "Which pair matches “three highest freight orders”?"
    options:
      - "ORDER BY freight ASC LIMIT 3"
      - "ORDER BY freight DESC LIMIT 3"
      - "LIMIT 3 with no ORDER BY"
      - "SELECT TOP freight FROM lab_orders"
    answer: 1
    explanation: "Highest means DESC. A LIMIT without ORDER BY is an arbitrary cap, not a ranking."
  - question: "SELECT TOP 5 … ORDER BY order_date in SQL Server is closest to…"
    options:
      - "FETCH a random 5 rows"
      - "ORDER BY order_date LIMIT 5 (or FETCH FIRST 5 ROWS ONLY)"
      - "GROUP BY order_date HAVING COUNT(*) = 5"
      - "DISTINCT 5 order_date values"
    answer: 1
    explanation: "TOP, LIMIT, and FETCH FIRST are dialect clothes for “sort, then take N.”"
  - question: "ORDER BY region, company DESC sorts…"
    options:
      - "Both columns descending"
      - "region ascending (default), company descending"
      - "company first, then region"
      - "Only company — region is ignored"
    answer: 1
    explanation: "ASC/DESC applies to the key it follows. Unspecified keys default to ASC."
---

Sorting is a presentation (and a ranking) tool. Capping the result is how `SELECT TOP`, `LIMIT`, and `FETCH FIRST` all think. Run the highest-freight sample in the local lab.

## ORDER BY

```sql
-- Dialect: ANSI
SELECT company, region, city
FROM lab_customers
ORDER BY region, company;
```

- Default direction is `ASC`.
- `DESC` flips one key.
- You may sort by a select-list alias in many warehouses; sorting by a column you did not project is also legal.

A warehouse `ORDER BY` on an un-capped extract can be expensive. Use it when the consumer needs a stable sequence (top-N, pagination, a deterministic file).

## SELECT TOP vs LIMIT

SQL Server / Access-style:

```sql
SELECT TOP 3 order_id, freight
FROM lab_orders
WHERE freight IS NOT NULL
ORDER BY freight DESC;
```

Portable lab form (DuckDB / Postgres / Spark):

```sql
SELECT order_id, freight, status
FROM lab_orders
WHERE freight IS NOT NULL
ORDER BY freight DESC
LIMIT 3;
```

ANSI also has `FETCH FIRST 3 ROWS ONLY`. Same mindset: **sort, then cap**. `LIMIT` without `ORDER BY` is “some 3 rows,” not “the top 3.”

## Ties

Two rows with freight `12.00` are not ranked unless you add a tie-breaker (`order_id`). Top-N reports should name the extra key.

## Exercises

1. Sort customers by `company` descending.
2. Return the two earliest `lab_orders` by `order_date`, then `order_id`.
3. Write the SQL Server `TOP` twin of `ORDER BY freight DESC LIMIT 3`.

Covers Order By and Select Top as one habit.

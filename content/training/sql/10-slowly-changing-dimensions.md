---
slug: sql-slowly-changing-dimensions
track: sql
title: "Slowly changing dimensions in SQL"
description: "SCD1 vs SCD2, valid_from/valid_to, is_current, and point-in-time joins from orders to the customer dim."
level: intermediate
order: 10
durationMinutes: 40
topics: [sql]
objectives:
  - "Choose SCD1 vs SCD2 for an attribute"
  - "Write a point-in-time join from a fact to SCD2"
  - "Close out the previous current row on change"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Point-in-time join"
    code: "SELECT o.order_id, c.region\nFROM fct_orders o\nJOIN dim_customer c\n  ON c.customer_id = o.customer_id\n AND o.ordered_at >= c.valid_from\n AND o.ordered_at <  COALESCE(c.valid_to, TIMESTAMP '9999-12-31');"
    note: "Do not join only on is_current if you need the region at order time."
  - label: "Close previous current row"
    code: "UPDATE dim_customer\nSET valid_to = :as_of, is_current = FALSE\nWHERE customer_id = :id AND is_current;"
    note: "Then INSERT the new version with valid_from = :as_of."
quiz:
  - question: "SCD2 is the right default when…"
    options:
      - "You only care about the latest attribute and history is noise"
      - "Analytics must reconstruct the attribute as it was at event time"
      - "You want to skip grain"
      - "You are storing files in a stage"
    answer: 1
    explanation: "SCD2 keeps versions. SCD1 overwrites. Pick per column, not per mood."
  - question: "Joining facts to dim_customer using only is_current…"
    options:
      - "Always reconstructs history correctly"
      - "Applies today's attributes to yesterday's orders"
      - "Creates a Dynamic Table"
      - "Dedupes bronze"
    answer: 1
    explanation: "Current-only joins rewrite the past. Use valid_from/valid_to for PIT."
---

Dimensional modeling named SCD2. This lab writes the SQL.

## SCD1 vs SCD2

| Type | Behavior | Example |
|------|----------|---------|
| SCD1 | Overwrite | Fix a typo in `email` |
| SCD2 | New version row | `region` or `segment` changed |

Same dim can mix both: overwrite email, version region.

## Table shape

```sql
-- Dialect: ANSI
-- dim_customer
-- customer_sk, customer_id, region, valid_from, valid_to, is_current
```

- `customer_id` is the natural key (repeats across versions).
- `customer_sk` is the surrogate (unique per version).
- `is_current` is a convenience filter — **not** a substitute for PIT predicates.

## Apply a change

1. Find the current row for `customer_id`.
2. If tracked attributes are unchanged, do nothing (or touch `updated_at` only).
3. Else `UPDATE` that row: `valid_to = as_of`, `is_current = false`.
4. `INSERT` the new version: `valid_from = as_of`, `valid_to` null/sentinel, `is_current = true`.

Warehouse MERGE can do both branches in one statement if you stage “changed keys.”

## Point-in-time from orders

```sql
SELECT o.order_id, c.region
FROM fct_orders o
JOIN dim_customer c
  ON c.customer_id = o.customer_id
 AND o.ordered_at >= c.valid_from
 AND o.ordered_at < COALESCE(c.valid_to, TIMESTAMP '9999-12-31');
```

Half-open intervals `[valid_from, valid_to)` avoid double matches. Agree the convention in the PR.

## Exercises

1. Classify `email`, `region`, and `created_at` as SCD1, SCD2, or immutable.
2. Write a query that returns customers with more than one `is_current = true` (should be empty).
3. Explain why a daily revenue mart that groups by `region` must use PIT, not current-only.

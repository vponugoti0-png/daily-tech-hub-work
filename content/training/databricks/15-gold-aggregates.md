---
slug: dbx-gold-aggregates
track: databricks
title: "Gold aggregates — GROUP BY and HAVING"
description: "COUNT / SUM / AVG at a named gold grain. WHERE filters silver rows; HAVING filters groups. Never aggregate after a fan-out join."
level: beginner
order: -5
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Build a gold daily mart grain with GROUP BY date and region"
  - "Use HAVING for group-level floors the BI warehouse can trust"
  - "Refuse to SUM(order.amount) after joining a many-side items table"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Gold daily revenue (seed mart)"
    code: "SELECT order_date, region, orders, revenue\nFROM gold_daily_orders\nORDER BY order_date, region;"
    note: "This lab’s gold is pre-aggregated. Warehouses serve gold — keep the Job off the BI SQL warehouse."
  - label: "Rebuild the grain from silver"
    code: "SELECT order_date, region,\n       COUNT(*) AS orders,\n       ROUND(SUM(amount), 2) AS revenue\nFROM silver_orders\nWHERE status <> 'returned'\nGROUP BY order_date, region\nORDER BY order_date, region;"
    note: "WHERE drops returns before the group. Grain = one row per date × region."
  - label: "HAVING: busy regions"
    code: "SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount\nFROM silver_orders\nWHERE status = 'ok'\nGROUP BY region\nHAVING SUM(amount) >= 40\nORDER BY amount DESC;"
    note: "HAVING sees aggregates. You cannot put SUM(amount) >= 40 in WHERE."
quiz:
  - question: "COUNT(*) vs COUNT(amount) on bronze_orders?"
    options:
      - "They always match"
      - "COUNT(*) is rows; COUNT(amount) skips NULL amounts"
      - "COUNT(amount) counts distinct amounts only"
      - "COUNT(*) ignores corrupt rows"
    answer: 1
    explanation: "COUNT(col) skips NULLs. Status filters belong in WHERE. DISTINCT is a separate keyword."
  - question: "A reviewer asks for regions whose ok-status amount is at least 40. Where does that threshold go?"
    options:
      - "WHERE SUM(amount) >= 40"
      - "HAVING SUM(amount) >= 40 after GROUP BY region"
      - "LIMIT 40"
      - "ZORDER BY 40"
    answer: 1
    explanation: "WHERE cannot see group totals. HAVING filters groups after GROUP BY. ZORDER is layout, not a predicate."
  - question: "You join a line-items table to silver_orders and SUM(o.amount). What happens?"
    options:
      - "Revenue stays at order grain"
      - "Orders with multiple SKUs fan out and revenue double-counts"
      - "HAVING deletes the extras"
      - "Liquid clustering cancels the join"
    answer: 1
    explanation: "Many-side joins multiply fact rows. Aggregate items first, or sum qty * unit_price at item grain."
---

Gold is a **named grain**, not “whatever the notebook printed.” The **local practice lab** already has `gold_daily_orders` — compare it to a `GROUP BY` you write on `silver_orders`.

## WHERE then GROUP BY then HAVING

```sql
SELECT order_date, region,
       COUNT(*) AS orders,
       ROUND(SUM(amount), 2) AS revenue
FROM silver_orders
WHERE status <> 'returned'
GROUP BY order_date, region
HAVING COUNT(*) >= 1
ORDER BY order_date, region;
```

`WHERE` drops rows. `HAVING` drops groups. Mixing them is how a mart silently loses a region.

## Serve gold, compute elsewhere

SQL warehouses are for BI on gold. The Job that builds gold should run on a job cluster or serverless job — same habit as the [workspace day-0](/training/databricks/dbx-workspace-cluster-basics) lesson.

## Exercises

1. Rebuild `gold_daily_orders` from `silver_orders` in the lab and compare row counts.
2. Add `HAVING SUM(amount) >= 15` and name which date/region pairs drop.
3. Write one sentence on why you would not `SUM(silver_orders.amount)` after joining an items explode.

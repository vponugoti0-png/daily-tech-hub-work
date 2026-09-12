---
slug: sql-ex-aggregates
track: sql
title: "Aggregates, GROUP BY, and HAVING"
description: "MIN, MAX, COUNT, SUM, AVG plus GROUP BY / HAVING on paid commerce lines."
level: beginner
order: 25
durationMinutes: 22
topics: [sql]
objectives:
  - "Compute MIN / MAX / COUNT / SUM / AVG at a declared grain"
  - "GROUP BY every non-aggregated select column"
  - "Filter groups with HAVING after WHERE has filtered rows"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Five aggregates"
    code: "SELECT COUNT(*) AS orders,\n       MIN(freight) AS min_freight,\n       MAX(freight) AS max_freight,\n       ROUND(SUM(freight), 2) AS freight_sum,\n       ROUND(AVG(freight), 2) AS freight_avg\nFROM lab_orders\nWHERE freight IS NOT NULL;"
    note: "COUNT(*) is rows. COUNT(freight) would skip NULLs — we already filtered them."
  - label: "GROUP BY region"
    code: "SELECT c.region, COUNT(*) AS orders, ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue\nFROM lab_orders o\nJOIN lab_customers c ON c.customer_id = o.customer_id\nJOIN lab_order_items i ON i.order_id = o.order_id\nWHERE o.status <> 'cancelled'\nGROUP BY c.region\nORDER BY revenue DESC;"
    note: "Grain is region. Do not select company without grouping it."
  - label: "HAVING on revenue"
    code: "SELECT c.region, ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue\nFROM lab_orders o\nJOIN lab_customers c ON c.customer_id = o.customer_id\nJOIN lab_order_items i ON i.order_id = o.order_id\nWHERE o.status <> 'cancelled'\nGROUP BY c.region\nHAVING SUM(i.quantity * i.unit_price) >= 20\nORDER BY revenue DESC;"
    note: "WHERE is pre-aggregate. HAVING is post-aggregate."
quiz:
  - question: "HAVING SUM(amount) > 20 filters…"
    options:
      - "Individual rows before they group"
      - "Groups after aggregation"
      - "Only NULL groups"
      - "The same moment as WHERE"
    answer: 1
    explanation: "WHERE cannot see SUM(…). HAVING runs after GROUP BY."
  - question: "Pick the SQL that counts customers per region."
    options:
      - "SELECT region, COUNT(*) FROM lab_customers;"
      - "SELECT region, COUNT(*) FROM lab_customers GROUP BY region;"
      - "SELECT COUNT(region) WHERE GROUP BY region;"
      - "SELECT region AGG COUNT FROM lab_customers;"
    answer: 1
    explanation: "Every non-aggregated select column must appear in GROUP BY (or be functionally dependent — do not rely on that)."
  - question: "COUNT(*) vs COUNT(email) on lab_customers…"
    options:
      - "They always match"
      - "COUNT(email) skips NULL emails, COUNT(*) does not"
      - "COUNT(*) skips NULLs in every column"
      - "COUNT(email) is illegal"
    answer: 1
    explanation: "Two missing emails in this seed make COUNT(email) smaller than COUNT(*)."
---

Aggregates collapse rows. `GROUP BY` names the grain. `HAVING` keeps or drops **groups**. Run the revenue-by-region sample in the local lab.

## The five workhorses

| Function | Meaning on a set |
|----------|------------------|
| `MIN` / `MAX` | Extremes (skips NULL) |
| `COUNT(*)` | Row count |
| `COUNT(col)` | Non-null col count |
| `SUM` | Total (skips NULL) |
| `AVG` | Mean of non-null values |

```sql
-- Dialect: ANSI
SELECT COUNT(*) AS orders,
       MIN(freight) AS min_freight,
       MAX(freight) AS max_freight,
       ROUND(SUM(freight), 2) AS freight_sum,
       ROUND(AVG(freight), 2) AS freight_avg
FROM lab_orders
WHERE freight IS NOT NULL;
```

## GROUP BY

```sql
SELECT c.region,
       COUNT(*) AS orders,
       ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue
FROM lab_orders o
JOIN lab_customers c ON c.customer_id = o.customer_id
JOIN lab_order_items i ON i.order_id = o.order_id
WHERE o.status <> 'cancelled'
GROUP BY c.region;
```

Select-list rule: each column is aggregated **or** grouped. Adding `c.company` without grouping it is a grain bug (and an error in strict ANSI).

## HAVING vs WHERE

```sql
WHERE o.status <> 'cancelled'          -- drop rows first
GROUP BY c.region
HAVING SUM(i.quantity * i.unit_price) >= 20   -- drop skinny groups
```

`WHERE` cannot use `SUM`. `HAVING` should not replace a row filter you could have written cheaper in `WHERE`.

## Exercises

1. `MAX(unit_price)` and `MIN(unit_price)` on `lab_products`.
2. Count orders per `status`.
3. Keep only statuses with at least two orders (`HAVING COUNT(*) >= 2`).

Covers Min/Max, Count, Sum, Avg, Group By, and Having.

---
slug: sql-ex-foundations-capstone
track: sql
title: "Foundations capstone — commerce quiz"
description: "Tie the SQL foundations spine together: filters, joins, aggregates, CASE, nulls, and safety on the Aurora commerce seed."
level: beginner
order: 33
durationMinutes: 25
topics: [sql]
objectives:
  - "Choose the right clause cluster for a commerce question"
  - "Read a grain-safe SELECT that joins customers, orders, items, and products"
  - "Spot the mutation / DDL / injection habit that does not belong in the local lab"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Paid revenue by category"
    code: "SELECT p.category,\n  COUNT(*) AS lines,\n  ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue\nFROM lab_orders o\nJOIN lab_order_items i ON i.order_id = o.order_id\nJOIN lab_products p ON p.product_id = i.product_id\nJOIN lab_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\n  AND c.region <> 'south'\nGROUP BY p.category\nORDER BY revenue DESC;"
    note: "Capstone grain: paid lines × product category, west/east/midwest only."
  - label: "EXISTS + CASE recap"
    code: "SELECT c.company,\n  CASE\n    WHEN EXISTS (\n      SELECT 1 FROM lab_orders o\n      WHERE o.customer_id = c.customer_id AND o.status = 'paid'\n    ) THEN 'has_paid'\n    ELSE 'no_paid'\n  END AS paid_flag\nFROM lab_customers c\nORDER BY c.company;"
    note: "Semi-join plus a label — no fan-out of customer rows."
  - label: "Next: DE path"
    code: "-- After this quiz: CTEs → windows → DQ → incrementals\n-- Start: /training/sql/sql-ctes-readability\n-- Lab stays SELECT/WITH. DML/DDL stay in worksheets."
    note: "Foundations are the on-ramp. Analytics engineering lessons keep their catalog numbers."
quiz:
  - question: "Paid revenue by category should filter cancelled rows in…"
    options:
      - "HAVING, because status is an aggregate"
      - "WHERE, before GROUP BY, so cancelled lines never enter the sum"
      - "ORDER BY"
      - "A stored procedure only"
    answer: 1
    explanation: "Status is a row property. WHERE drops cancelled lines cheaply; HAVING would need an aggregate you do not want."
  - question: "Pick the SQL that lists companies still missing an email."
    options:
      - "WHERE email = NULL"
      - "WHERE email IS NULL"
      - "WHERE email <> ''"
      - "HAVING email IS NULL without GROUP BY"
    answer: 1
    explanation: "IS NULL is the missing-value test. = NULL is unknown."
  - question: "Joining items to orders then SUM(o.freight) usually…"
    options:
      - "Keeps freight at order grain"
      - "Fans freight out once per line and over-states it"
      - "Deletes unpaid orders"
      - "Is required for DISTINCT"
    answer: 1
    explanation: "Many-side joins multiply the one-side measure. Aggregate items first, or sum a line-grain column."
  - question: "Which habit belongs in an app talking to this schema?"
    options:
      - "sql = \"SELECT * FROM lab_customers WHERE city = '\" + city + \"'\""
      - "Bind city as a parameter on WHERE city = ?"
      - "GRANT CONTROL to the browser lab role"
      - "Store freight as FLOAT for extra precision"
    answer: 1
    explanation: "Parameters beat concatenation. The lab is not your production role model for grants or money types."
  - question: "After foundations, the recommended DE reading still includes…"
    options:
      - "A new top-level Lab nav item"
      - "CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured → Build staging→mart ETL"
      - "Only stored procedures"
      - "Python runtime lab (do not build)"
    answer: 1
    explanation: "Catalog numbers on the warehouse lessons stay put. No new header nav. Python lab remains a team hold."
---

Capstone for the foundations spine: one commerce question, then a quiz that mixes the clusters (select, where, order/limit, DML mindset, nulls, aggregates, LIKE/IN/BETWEEN, joins/union, exists/CASE, CTAS, DDL, dates/operators, safety).

Run **Paid revenue by category** in the local lab. Then take the quiz — Try again is available, and each item has an explanation (the “show why” twin of a show-answer button).

## The question

> Paid line revenue by product category, excluding south-region customers. Grain is category, not order.

```sql
-- Dialect: ANSI
SELECT p.category,
       COUNT(*) AS lines,
       ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue
FROM lab_orders o
JOIN lab_order_items i ON i.order_id = o.order_id
JOIN lab_products p ON p.product_id = i.product_id
JOIN lab_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
  AND c.region <> 'south'
GROUP BY p.category
ORDER BY revenue DESC;
```

Check yourself:

- `WHERE` (not `HAVING`) drops cancelled / pending and south.
- Joins stay at **line** grain; we sum `quantity * unit_price`, not `o.freight`.
- `GROUP BY p.category` matches the select list.
- South’s Gulf Cart paid order should not land in merch/coffee totals.

## What you are not running here

| Habit | Where it lives |
|-------|----------------|
| `INSERT` / `UPDATE` / `DELETE` | Worksheets — [DML lesson](/training/sql/sql-ex-dml-mutations) |
| CTAS / `INSERT SELECT` / procedures | [CTAS lesson](/training/sql/sql-ex-warehouse-ctas) |
| `CREATE TABLE` + constraints | [DDL lesson](/training/sql/sql-ex-ddl-constraints) |
| Bind parameters, types, hosting | [Safety lesson](/training/sql/sql-ex-safety-types) |

## Next

Analytics engineering on this same track: [CTEs](/training/sql/sql-ctes-readability) → windows → DQ → incrementals → [staging→mart ETL](/training/sql/sql-staging-mart-etl).

## Exercises

1. Add `HAVING SUM(i.quantity * i.unit_price) >= 30` and say which categories survive.
2. Rewrite the south exclusion as `c.region IN ('west', 'east', 'midwest')`.
3. Write (do not run) a CTAS `paid_category_revenue AS` around the capstone SELECT.

Original capstone — categories mapped from a public SQL exercise index, wording and items are Aurora’s.

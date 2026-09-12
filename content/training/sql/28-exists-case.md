---
slug: sql-ex-exists-case
track: sql
title: "EXISTS, ANY/ALL, and CASE"
description: "Semi-joins with EXISTS, quantified comparisons (ANY / ALL), and CASE labels on commerce rows."
level: beginner
order: 28
durationMinutes: 20
topics: [sql]
objectives:
  - "Filter with EXISTS / NOT EXISTS instead of joining just to test presence"
  - "Read ANY and ALL as quantified comparisons"
  - "Label rows with CASE (simple and searched)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "EXISTS paid customer"
    code: "SELECT c.company,\n  CASE\n    WHEN EXISTS (\n      SELECT 1 FROM lab_orders o\n      WHERE o.customer_id = c.customer_id AND o.status = 'paid'\n    ) THEN 'has_paid'\n    ELSE 'no_paid'\n  END AS paid_flag\nFROM lab_customers c\nORDER BY c.company;"
    note: "EXISTS is a semi-join. SELECT 1 is a habit — the subquery does not need output columns."
  - label: "ANY / ALL"
    code: "SELECT product_name, unit_price\nFROM lab_products\nWHERE unit_price > ALL (SELECT COALESCE(freight, 0) FROM lab_orders)\nORDER BY unit_price;"
    note: "ALL means greater than every freight. ANY means greater than at least one."
  - label: "Searched CASE"
    code: "SELECT order_id, status,\n  CASE\n    WHEN status = 'paid' THEN 'closed'\n    WHEN status = 'pending' THEN 'open'\n    ELSE 'review'\n  END AS bucket\nFROM lab_orders\nORDER BY order_id;"
    note: "CASE is a row expression, not a WHERE. ELSE catches cancelled."
quiz:
  - question: "EXISTS (SELECT 1 FROM lab_orders o WHERE o.customer_id = c.customer_id) is true when…"
    options:
      - "The customer has at least one order"
      - "The customer has no orders"
      - "Every customer has the same order"
      - "The subquery returns a column named 1"
    answer: 0
    explanation: "EXISTS only cares whether a row appears. The select list is ignored."
  - question: "unit_price > ALL (SELECT freight …) means…"
    options:
      - "Greater than the minimum freight"
      - "Greater than every freight in the subquery"
      - "Greater than any one freight — same as ANY"
      - "Greater than the average freight"
    answer: 1
    explanation: "ALL is “every.” ANY / SOME is “at least one.” An empty ALL subquery is vacuously true in ANSI — know your dialect."
  - question: "Pick the CASE that labels cancelled as review."
    options:
      - "CASE status = cancelled REVIEW"
      - "CASE WHEN status = 'cancelled' THEN 'review' ELSE status END"
      - "IF status cancelled review"
      - "DECODE cancelled AS review"
    answer: 1
    explanation: "Searched CASE uses WHEN predicates. Simple CASE (CASE status WHEN 'cancelled' THEN …) is the compact twin."
---

Three tools that show up on every “intermediate SQL” checklist: `EXISTS`, `ANY` / `ALL`, and `CASE`. Run the EXISTS + CASE sample in the local lab.

## EXISTS

```sql
-- Dialect: ANSI
SELECT c.company
FROM lab_customers c
WHERE EXISTS (
  SELECT 1
  FROM lab_orders o
  WHERE o.customer_id = c.customer_id
    AND o.status = 'paid'
);
```

That is a **semi-join**: keep customers who have a matching paid order, without multiplying customer rows. `NOT EXISTS` is the anti-join (customers with no paid order — Lakeside Mart is cancelled-only in this seed).

Prefer `NOT EXISTS` over `NOT IN` when the inner key can be `NULL`.

## ANY and ALL

```sql
-- More expensive than every billed freight
SELECT product_name, unit_price
FROM lab_products
WHERE unit_price > ALL (SELECT freight FROM lab_orders WHERE freight IS NOT NULL);

-- At least one freight is smaller
SELECT product_name, unit_price
FROM lab_products
WHERE unit_price > ANY (SELECT freight FROM lab_orders WHERE freight IS NOT NULL);
```

`SOME` is an alias for `ANY`. These read well; a `MAX`/`MIN` rewrite is often clearer for reviewers (`unit_price > (SELECT MAX(freight) …)` equals `> ALL` on non-null freight).

## CASE

Simple:

```sql
CASE status
  WHEN 'paid' THEN 'closed'
  WHEN 'pending' THEN 'open'
  ELSE 'review'
END
```

Searched (predicates):

```sql
CASE
  WHEN freight IS NULL THEN 'unknown'
  WHEN freight >= 10 THEN 'heavy'
  ELSE 'light'
END
```

`CASE` is an expression. It does not drop rows. Combine with `WHERE` or `HAVING` if you need a filter.

## Exercises

1. List products that `EXISTS` on a `lab_order_items` row.
2. Rewrite `> ALL (SELECT freight …)` with `MAX`.
3. `CASE` discontinued products as `'retired'` else `'active'`.

Covers Exists, Any/All, and CASE Expression.

---
slug: sql-exists-any-all
track: sql
title: "EXISTS, ANY, and ALL as set filters"
description: "Semi-join and comparison-to-a-set patterns: EXISTS / NOT EXISTS first, then ANY / ALL only when a scalar comparison is clearer than a join."
level: beginner
order: -3
durationMinutes: 25
topics: [sql]
objectives:
  - "Filter parents with EXISTS so children cannot fan out the grain"
  - "Prefer NOT EXISTS over NOT IN when the subquery can return NULL"
  - "Read ANY / ALL as comparisons to a set — rewrite as a join or scalar when the review is clearer"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "EXISTS — customers with a paid order"
    code: "SELECT c.customer_id, c.region, c.email\nFROM aurora_customers c\nWHERE EXISTS (\n  SELECT 1\n  FROM aurora_orders o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'paid'\n)\nORDER BY c.customer_id;"
    note: "Semi-join: one customer row even if they have four paid tickets. Run it in the local practice lab."
  - label: "NOT EXISTS — no paid order yet"
    code: "SELECT c.customer_id, c.region, c.status\nFROM aurora_customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM aurora_orders o\n  WHERE o.customer_id = c.customer_id AND o.status = 'paid'\n);"
    note: "Anti-join. Safer than NOT IN (SELECT customer_id …) when keys can be NULL."
  - label: "Scalar stand-in for > ANY"
    code: "SELECT o.order_id, o.amount, c.region\nFROM aurora_orders o\nJOIN aurora_customers c ON c.customer_id = o.customer_id\nWHERE o.amount > (\n  SELECT AVG(amount) FROM aurora_orders WHERE status = 'paid'\n)\nORDER BY o.amount DESC;"
    note: "amount > ANY (SELECT amount FROM …) is easy to misread. A named scalar (avg paid ticket) reviews faster."
  - label: "Refunded orders (EXISTS)"
    code: "SELECT o.order_id, o.status, o.amount\nFROM aurora_orders o\nWHERE EXISTS (\n  SELECT 1 FROM aurora_refunds r WHERE r.order_id = o.order_id\n);"
    note: "EXISTS is a semi-join. It does not fan out when a refund table grows."
quiz:
  - question: "Why use EXISTS instead of joining aurora_orders when you only need customers who paid?"
    options:
      - "EXISTS is always faster"
      - "EXISTS keeps customer grain; a join can duplicate customers with many paid orders"
      - "JOIN cannot use status"
      - "EXISTS writes a stored procedure"
    answer: 1
    explanation: "EXISTS is a filter, not a column source. Joining the many-side without aggregating fans out the parent."
  - question: "NOT IN (SELECT customer_id FROM aurora_orders) is risky when…"
    options:
      - "The subquery is empty"
      - "The subquery can return NULL keys — the whole NOT IN becomes unknown"
      - "You also use LIMIT"
      - "The table is named aurora_orders"
    answer: 1
    explanation: "A single NULL in the IN-list makes NOT IN unknown for every row. NOT EXISTS does not have that trap."
  - question: "x > ALL (SELECT amount FROM paid) means…"
    options:
      - "x is greater than at least one paid amount"
      - "x is greater than every paid amount (greater than the max)"
      - "x equals the average"
      - "x is NULL"
    answer: 1
    explanation: "> ALL is “greater than the largest.” > ANY is “greater than at least one.” Write MAX/MIN if that is what you mean."
  - question: "EXISTS vs JOIN to aurora_refunds when you only need “has a refund”?"
    options:
      - "JOIN is always safer"
      - "EXISTS keeps order grain; a JOIN can duplicate orders if two refunds land"
      - "EXISTS deletes the refunds"
      - "They always return the same row count"
    answer: 1
    explanation: "Semi-join for existence. Join when you need refund columns — and name that grain."
  - question: "amount > (SELECT AVG(amount) FROM …) is a…"
    options:
      - "Correlated delete"
      - "Scalar subquery comparison — read it before reaching for ANY/ALL"
      - "Window function"
      - "DDL constraint"
    answer: 1
    explanation: "ANY/ALL are easy to misread. Start with a scalar, then upgrade if you must."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Set filters without changing grain. Joins that **add columns** live in the [DE joins recap](/training/sql/sql-joins-set-logic-recap). This page is **does a child row exist?**

## EXISTS / NOT EXISTS

```sql
-- Dialect: ANSI
SELECT c.customer_id, c.region
FROM aurora_customers c
WHERE EXISTS (
  SELECT 1
  FROM aurora_orders o
  WHERE o.customer_id = c.customer_id
    AND o.status = 'paid'
);
```

`SELECT 1` is a convention — EXISTS only cares whether a row appears. Correlated `o.customer_id = c.customer_id` is the join key.

`NOT EXISTS` is the anti-join: customers with no paid ticket (including `churned` / `latam` in the lab seed if they never paid).

## ANY and ALL

```sql
-- Shape, not a lab requirement
WHERE amount > ANY (SELECT amount FROM aurora_orders WHERE status = 'paid')
WHERE amount > ALL (SELECT amount FROM aurora_orders WHERE status = 'paid')
```

| Form | Plain English |
|------|----------------|
| `> ANY` | Greater than at least one value (greater than the min of that set) |
| `> ALL` | Greater than every value (greater than the max) |

If you mean “above average paid ticket,” write `> (SELECT AVG(amount) …)` and name it in a CTE. Reviewers should not have to decode ANY/ALL under a pager.

The local lab sample uses that scalar form. ANY/ALL syntax varies slightly by warehouse; the meaning does not.

## Exercises

1. List `aurora_customers` who have at least one `paid` order — EXISTS, not a join.
2. List customers with **no** paid order using NOT EXISTS.
3. Rewrite “amount greater than every paid amount” as a comparison to `MAX(amount)` and explain why that is clearer than `> ALL`.

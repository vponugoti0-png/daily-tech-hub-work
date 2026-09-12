---
slug: sf-exists-semi-joins
track: snowflake
title: "EXISTS and leftover SAMPLE keys"
description: "Semi-join and anti-join patterns: EXISTS / NOT EXISTS first, then ANY / ALL only when a scalar comparison is clearer than a join."
level: beginner
order: -3
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Filter parents with EXISTS so children cannot fan out the grain"
  - "Prefer NOT EXISTS over NOT IN when the subquery can return NULL"
  - "Find customers with no SAMPLE orders as a quality leftover"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Customers with a paid order (EXISTS)"
    code: "SELECT c.customer_id, c.region, c.status\nFROM sf_customers c\nWHERE EXISTS (\n  SELECT 1\n  FROM sf_orders o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'paid'\n)\nORDER BY c.customer_id;"
    note: "Semi-join: one customer row even if they have many paid tickets. Run it in the local practice lab."
  - label: "Customers with no orders (NOT EXISTS)"
    code: "SELECT c.customer_id, c.region, c.status\nFROM sf_customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM sf_orders o\n  WHERE o.customer_id = c.customer_id\n)\nORDER BY c.customer_id;"
    note: "Anti-join. This seed’s leftover is the churned west customer with no SAMPLE orders."
  - label: "Scalar stand-in for > ANY"
    code: "SELECT o.order_id, o.amount, c.region\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.amount > (\n  SELECT AVG(amount) FROM sf_orders WHERE status = 'paid'\n)\nORDER BY o.amount DESC;"
    note: "amount > ANY (SELECT …) is easy to misread. A named scalar (avg paid ticket) reviews faster."
quiz:
  - question: "Why use EXISTS instead of joining sf_orders when you only need customers who paid?"
    options:
      - "EXISTS is always cheaper on credits"
      - "EXISTS keeps customer grain; a join can duplicate customers with many paid orders"
      - "JOIN cannot use status"
      - "EXISTS writes a stored procedure"
    answer: 1
    explanation: "EXISTS is a filter, not a column source. Joining the many-side without aggregating fans out the parent."
  - question: "NOT IN (SELECT customer_id FROM sf_orders) is risky when…"
    options:
      - "The subquery is empty"
      - "The subquery can return NULL keys — the whole NOT IN becomes unknown"
      - "You also use LIMIT"
      - "The table is named sf_orders"
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
  - question: "The seed’s leftover customer is…"
    options:
      - "A paid VIP"
      - "The churned west customer with no orders — NOT EXISTS"
      - "etl_wh"
      - "A clone"
    answer: 1
    explanation: "Anti-join. Do not JOIN then DISTINCT to fake existence."
  - question: "EXISTS does not fan out because…"
    options:
      - "It is a semi-join — true/false per outer row"
      - "Snowflake forbids multiple orders"
      - "It is a warehouse"
      - "It deletes the inner table"
    answer: 0
    explanation: "Existence, not projection."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Leftover keys are a **metric** — a dim customer with no fact, or a Stream row that failed a gate.

The **local practice lab** has `sf_customers` 1–3 and orders only for 1–2. Run the anti-join here.

## EXISTS keeps grain

```sql
SELECT c.customer_id, c.region
FROM sf_customers c
WHERE EXISTS (
  SELECT 1 FROM sf_orders o
  WHERE o.customer_id = c.customer_id AND o.status = 'paid'
);
```

## NOT EXISTS vs NOT IN

Prefer `NOT EXISTS` when keys can be NULL. Same foot-gun as ANSI / Spark SQL.

## Exercises

1. Run the no-orders sample and name the leftover `customer_id`.
2. Rewrite that anti-join as a `LEFT JOIN … WHERE o.customer_id IS NULL`.
3. Explain why leftover-key count belongs next to Dynamic Table freshness, not instead of it.

---
slug: sql-ex-where-logic
track: sql
title: "WHERE, AND, OR, and NOT"
description: "Filter commerce rows with WHERE plus AND / OR / NOT — keep predicates off the SELECT list."
level: beginner
order: 21
durationMinutes: 18
topics: [sql]
objectives:
  - "Put row filters in WHERE, not in the select list"
  - "Combine predicates with AND / OR and group them with parentheses"
  - "Negate a condition with NOT without turning unknowns into surprises"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "AND — paid and west"
    code: "SELECT o.order_id, c.company, o.status\nFROM lab_orders o\nJOIN lab_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\n  AND c.region = 'west';"
    note: "AND means both must be true. Paid-only in the west."
  - label: "OR — two statuses"
    code: "SELECT order_id, status, freight\nFROM lab_orders\nWHERE status = 'pending' OR status = 'cancelled';"
    note: "OR widens the set. Parentheses help when you mix AND and OR."
  - label: "NOT — exclude cancelled"
    code: "SELECT order_id, status\nFROM lab_orders\nWHERE NOT status = 'cancelled';"
    note: "NOT status = 'cancelled' is the same idea as status <> 'cancelled'."
quiz:
  - question: "Which filter keeps paid west orders and drops everyone else?"
    options:
      - "WHERE status = 'paid' OR region = 'west'"
      - "WHERE status = 'paid' AND region = 'west'"
      - "WHERE NOT status = 'paid' AND region = 'west'"
      - "SELECT status = 'paid' AND region = 'west'"
    answer: 1
    explanation: "AND requires both predicates. OR would keep unpaid west rows and paid rows from other regions."
  - question: "WHERE status = 'paid' OR status = 'pending' AND region = 'west' is risky because…"
    options:
      - "OR is illegal next to AND"
      - "AND binds tighter than OR unless you add parentheses"
      - "region cannot be compared in WHERE"
      - "SQL evaluates left-to-right only"
    answer: 1
    explanation: "Write (status = 'paid' OR status = 'pending') AND region = 'west' when that is the intent."
  - question: "Pick the SQL that excludes cancelled orders."
    options:
      - "WHERE status NOT 'cancelled'"
      - "WHERE NOT status = 'cancelled'"
      - "WHERE status = NOT 'cancelled'"
      - "WHERE EXCLUDE cancelled"
    answer: 1
    explanation: "NOT applies to a boolean predicate. The portable twin is status <> 'cancelled'."
---

`WHERE` decides which rows enter the result. `AND`, `OR`, and `NOT` combine those predicates. Run the paid-west sample in the local lab — still SELECT-only.

## WHERE is the row gate

```sql
-- Dialect: ANSI
SELECT order_id, status, freight
FROM lab_orders
WHERE status = 'paid';
```

Comparisons (`=`, `<>`, `<`, `>`, `<=`, `>=`) live here. Putting `status = 'paid'` in the `SELECT` list only adds a true/false column — it does not drop rows.

## AND, OR, parentheses

```sql
SELECT o.order_id, c.company, c.region, o.status
FROM lab_orders o
JOIN lab_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
  AND c.region = 'west';
```

`AND` narrows. `OR` widens. Mix them only with parentheses:

```sql
WHERE (o.status = 'paid' OR o.status = 'pending')
  AND c.region <> 'south';
```

Without parentheses, `AND` binds tighter than `OR` in ANSI — easy to keep the wrong unpaid rows.

## NOT

```sql
SELECT order_id, status
FROM lab_orders
WHERE NOT status = 'cancelled';
```

`NOT` flips a predicate. It does not invent a third answer for `NULL` — a `NULL` freight compared with `=` is unknown, and `WHERE` drops unknowns. The next nulls lesson covers that trap.

## Exercises

1. List orders that are `pending` **or** `cancelled`.
2. List customers in `east` or `midwest` whose company is not Harbor Goods.
3. Rewrite `NOT status = 'paid'` as a comparison without `NOT`.

Covers the Where / And / Or / Not exercise cluster with Aurora commerce rows.

---
slug: sql-patterns-aliases-case
track: sql
title: "LIKE, IN, BETWEEN, aliases, and CASE"
description: "Pattern filters and label expressions for warehouse reviews: LIKE / wildcards, IN, BETWEEN, table aliases, and CASE buckets — not stored procedures."
level: beginner
order: -4
durationMinutes: 25
topics: [sql]
objectives:
  - "Choose LIKE, IN, or BETWEEN instead of an OR-chain of equalities"
  - "Alias tables and output columns so a reviewer can see the grain"
  - "Bucket measures with CASE as an expression in the same SELECT"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "LIKE / IN / BETWEEN on promos"
    code: "SELECT order_id, promo_code, amount\nFROM aurora_orders\nWHERE promo_code LIKE 'F%'\n   OR promo_code IN ('VIP', 'FLASH')\n   OR amount BETWEEN 15 AND 50\nORDER BY order_id;"
    note: "% is any suffix. _ is one character. BETWEEN is inclusive. Run it in the local practice lab."
  - label: "Aliases that name the grain"
    code: "SELECT o.order_id,\n       c.region AS customer_region,\n       o.amount AS order_amount\nFROM aurora_orders AS o\nJOIN aurora_customers AS c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid';"
    note: "o / c are table aliases. customer_region is a column alias — keep it honest (it is not order region unless you say so)."
  - label: "CASE size buckets"
    code: "SELECT order_id, amount,\n  CASE\n    WHEN amount >= 80 THEN 'large'\n    WHEN amount >= 20 THEN 'mid'\n    ELSE 'small'\n  END AS size_bucket\nFROM aurora_orders\nWHERE status <> 'cancelled'\nORDER BY amount DESC;"
    note: "CASE is a column expression. It is not a stored procedure and it does not change the row count by itself."
  - label: "IN / LIKE on new regions"
    code: "SELECT order_id, promo_code, amount\nFROM aurora_orders\nWHERE promo_code LIKE 'E%'\n   OR promo_code IN ('VIP', 'FLASH', 'EMEA26');"
    note: "EMEA26 is a Wave A1 promo. LIKE 'E%' is a pattern, not a regex lesson."
quiz:
  - question: "LIKE 'F%' on promo_code matches…"
    options:
      - "Only the exact code F"
      - "Codes that start with F (FALL26, FLASH, …)"
      - "Codes that contain F anywhere, always"
      - "NULL promos"
    answer: 1
    explanation: "% is a wildcard for any suffix. NULL never LIKE-matches. Use ILIKE only when the dialect is case-insensitive and you mean it."
  - question: "amount BETWEEN 15 AND 50 is…"
    options:
      - "Exclusive of 15 and 50"
      - "Inclusive of both ends"
      - "The same as LIKE"
      - "Illegal with DATE columns"
    answer: 1
    explanation: "BETWEEN is inclusive. For dates, that means both endpoints are in the window — document the timezone/date grain."
  - question: "Why alias aurora_orders as o and amount as order_amount?"
    options:
      - "Aliases make the query faster"
      - "Short table names plus honest column names keep joins and grain readable"
      - "CASE requires aliases"
      - "IN does not work without aliases"
    answer: 1
    explanation: "Aliases are documentation. A column named amount after a join is ambiguous; order_amount states the grain."
  - question: "CASE in a SELECT is…"
    options:
      - "A stored procedure"
      - "An expression that returns a column — keep buckets in one SELECT so reviewers see the grain"
      - "A write that updates gold"
      - "Illegal in DuckDB"
    answer: 1
    explanation: "CASE is a column. It does not persist a constraint."
  - question: "Prefer IN ('paid','pending') over OR-chains because…"
    options:
      - "OR is deprecated"
      - "Reviewers can see the set; a long OR chain hides a missing parenthesis with AND"
      - "IN ignores NULLs differently in a good way always"
      - "IN is required by ANSI for status"
    answer: 1
    explanation: "Readability and fewer AND/OR surprises. Still watch NOT IN + NULL."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Filters and labels. None of this is a stored-proc tutorial — it is how reviewers read a SELECT.

## LIKE and wildcards

```sql
-- Dialect: ANSI
SELECT order_id, promo_code
FROM aurora_orders
WHERE promo_code LIKE 'F%';     -- FALL26, FLASH
```

| Pattern | Means |
|---------|--------|
| `F%` | Starts with F |
| `%26` | Ends with 26 |
| `F_LL26` | F + one char + LL26 |
| `F\%` (escape) | Literal F% when you need it |

`LIKE` does not match NULL. Leading `%` can disable a prefix index — fine in this lab, expensive on a large fact.

## IN and BETWEEN

`promo_code IN ('VIP', 'FLASH')` is a set membership test. `amount BETWEEN 15 AND 50` is `amount >= 15 AND amount <= 50`. Use `IN` for a short discrete list; use a bridge table when the list is a dimension.

`NOT IN (SELECT …)` plus a NULL in the subquery yields no rows. Prefer `NOT EXISTS` (next lesson) for anti-joins.

## Aliases

`FROM aurora_orders AS o` is a table alias. `o.amount AS order_amount` is a column alias. After a join, unqualified `amount` is a review comment waiting to happen.

## CASE

`CASE` is an expression. It labels rows; it does not loop, and it is not `CREATE PROCEDURE`.

```sql
CASE
  WHEN amount >= 80 THEN 'large'
  WHEN amount >= 20 THEN 'mid'
  ELSE 'small'
END AS size_bucket
```

Order WHEN clauses from specific to general. Put `ELSE` so a new amount cannot fall out as NULL by accident.

## Exercises

1. Find orders whose promo starts with `F` **or** is in `('VIP')`.
2. Alias the paid-order join so every selected column has a grain-honest name.
3. Bucket `aurora_orders.amount` into `large` / `mid` / `small` and count rows per bucket (GROUP BY the CASE, or wrap it in a CTE).

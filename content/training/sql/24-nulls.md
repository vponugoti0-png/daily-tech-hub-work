---
slug: sql-ex-nulls
track: sql
title: "NULL values and NULL functions"
description: "IS NULL, three-valued logic, and COALESCE / IFNULL-style fills on missing emails and freight."
level: beginner
order: 24
durationMinutes: 20
topics: [sql]
objectives:
  - "Test missing values with IS NULL / IS NOT NULL, never = NULL"
  - "Explain why WHERE freight = NULL returns no rows"
  - "Fill display defaults with COALESCE (and name the warehouse twins)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "IS NULL — missing emails"
    code: "SELECT company, city, email\nFROM lab_customers\nWHERE email IS NULL\nORDER BY company;"
    note: "Harbor Goods and Gulf Cart ship without an email in this seed."
  - label: "COALESCE fill"
    code: "SELECT company, city, COALESCE(email, 'unspecified') AS email_filled\nFROM lab_customers\nORDER BY company;"
    note: "COALESCE walks arguments and returns the first non-NULL. Portable NULL function."
  - label: "NULL freight gate"
    code: "SELECT order_id, freight, status\nFROM lab_orders\nWHERE freight IS NOT NULL\nORDER BY order_id;"
    note: "Order 103 is pending with NULL freight — it drops out of SUM unless you coalesce."
quiz:
  - question: "WHERE email = NULL returns…"
    options:
      - "Every customer with a missing email"
      - "No rows — unknown is not true"
      - "A syntax error in every warehouse"
      - "Rows where email is the string 'NULL'"
    answer: 1
    explanation: "NULL = NULL is unknown. WHERE keeps only TRUE. Use IS NULL."
  - question: "Which expression labels missing mail as unspecified?"
    options:
      - "email = 'unspecified'"
      - "COALESCE(email, 'unspecified')"
      - "ISNULL = email"
      - "email OR 'unspecified'"
    answer: 1
    explanation: "COALESCE (ANSI), IFNULL (MySQL/DuckDB), NVL (Oracle/Snowflake) are the NULL-function family."
  - question: "SUM(freight) on lab_orders ignores NULL freight. That means…"
    options:
      - "The pending row is treated as zero automatically"
      - "Aggregates skip NULLs; coalesce to 0 if zero is the business meaning"
      - "SUM fails if any freight is NULL"
      - "You must DELETE NULL rows first"
    answer: 1
    explanation: "COUNT(freight) also skips NULLs; COUNT(*) does not. Be explicit when zero and missing differ."
---

`NULL` is “unknown,” not the string `'NULL'` and not zero. Harbor Goods and Gulf Cart have no email; order 103 has no freight yet. Run the `COALESCE` sample in the local lab.

## Tests: IS NULL

```sql
-- Dialect: ANSI
SELECT company, email
FROM lab_customers
WHERE email IS NULL;
```

`IS NOT NULL` is the twin. `email = NULL` is never true — three-valued logic turns the comparison into **unknown**, and `WHERE` drops unknowns.

`NOT email IS NULL` is `email IS NOT NULL`. `NOT (email = 'alex@aurora.example')` still drops the NULL-email rows, because `NOT unknown` is unknown.

## NULL functions

| Habit | ANSI / most warehouses | Other names |
|-------|------------------------|-------------|
| First non-null | `COALESCE(a, b, c)` | `IFNULL` (two-arg), `NVL`, `NVL2` |
| Null-if match | `NULLIF(a, b)` | — |
| If-null then | `COALESCE(a, 0)` | `ISNULL(a, 0)` (SQL Server) |

```sql
SELECT company,
       COALESCE(email, 'unspecified') AS email_filled
FROM lab_customers;
```

`COALESCE` is the function to memorize. Warehouse-specific twins (`IFNULL`, `NVL`, `ISNULL`) do the same two-argument fill.

```sql
SELECT order_id,
       COALESCE(freight, 0) AS freight_or_zero
FROM lab_orders;
```

Only coerce to `0` when zero is the **business** meaning. Pending freight is often still unknown.

## Aggregates and NULL

`SUM`, `AVG`, `MIN`, `MAX`, and `COUNT(column)` skip NULLs. `COUNT(*)` counts rows. A `MIN(email)` will ignore missing mail rather than treat it as the lowest string.

## Exercises

1. List orders where `freight IS NULL`.
2. Return `COALESCE(email, city)` as a contact fallback.
3. Explain why `WHERE NOT (freight > 10)` does not return the NULL-freight order.

Covers Null Values and NULL Functions as one cluster.

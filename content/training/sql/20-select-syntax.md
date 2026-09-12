---
slug: sql-ex-select-syntax
track: sql
title: "SELECT, DISTINCT, and statement shape"
description: "SQL syntax, SELECT lists, and SELECT DISTINCT on an Aurora commerce seed — the first foundations exercise."
level: beginner
order: 20
durationMinutes: 18
topics: [sql]
objectives:
  - "Read a SELECT statement as clauses, not a blob of keywords"
  - "Project only the columns a downstream job needs"
  - "Use DISTINCT when the grain is unique labels, not when you meant GROUP BY"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Project customers"
    code: "SELECT customer_id, company, city, region\nFROM lab_customers\nORDER BY customer_id;"
    note: "Name columns. SELECT * is fine for peeking, noisy for a mart."
  - label: "SELECT DISTINCT regions"
    code: "SELECT DISTINCT region\nFROM lab_customers\nORDER BY region;"
    note: "Distinct labels. If you also need counts, that is GROUP BY — next aggregates lesson."
  - label: "Statement shape"
    code: "SELECT company, city\nFROM lab_customers\nWHERE region = 'west';"
    note: "Clause order is fixed: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY."
quiz:
  - question: "Which statement lists each region only once from lab_customers?"
    options:
      - "SELECT region UNIQUE FROM lab_customers;"
      - "SELECT DISTINCT region FROM lab_customers;"
      - "SELECT region FROM lab_customers GROUP ALL;"
      - "SELECT ONLY region FROM lab_customers;"
    answer: 1
    explanation: "DISTINCT is the keyword that collapses duplicate projected values. UNIQUE is a constraint, not a SELECT modifier."
  - question: "Why prefer naming columns instead of SELECT * in a warehouse job?"
    options:
      - "SELECT * is illegal in ANSI SQL"
      - "Named lists survive schema drift and keep the contract obvious"
      - "SELECT * is always slower than DISTINCT"
      - "Warehouses reject star projections"
    answer: 1
    explanation: "A new column in the source silently changes * output. Jobs should declare the contract."
  - question: "SELECT DISTINCT company, region from five customers with two west rows returns…"
    options:
      - "Always five rows"
      - "One row per unique (company, region) pair"
      - "One row total"
      - "An error unless you GROUP BY"
    answer: 1
    explanation: "DISTINCT applies to the whole select list. Two different west companies stay two rows."
---

Foundations start here: how a `SELECT` is shaped, what you project, and when `DISTINCT` is the right tool. Guest-friendly — run the samples in the **local practice lab** on this page (DuckDB in the browser, not a live warehouse).

The seed is a tiny commerce set: `lab_customers`, `lab_orders`, `lab_products`, `lab_order_items`, `lab_employees`. Harbor Goods sits in Boston with a missing email; Aurora Market is Seattle.

## Syntax is clause order

SQL is not executed top-to-bottom the way you read it, but you **write** clauses in a fixed order:

```sql
-- Dialect: ANSI
SELECT company, city
FROM lab_customers
WHERE region = 'west';
```

| Clause | Job |
|--------|-----|
| `SELECT` | What columns (or expressions) come out |
| `FROM` | Which table or join |
| `WHERE` | Which rows survive |
| `ORDER BY` | How the result is sorted (next lesson) |

Keywords are not case-sensitive. Identifiers in this lab are lowercase. End one statement at a time — the local lab rejects stacked `;` batches.

## SELECT lists

Project only what the next step needs:

```sql
SELECT customer_id, company, region
FROM lab_customers;
```

`SELECT *` is a peek, not a contract. Analytics jobs name columns so a new `notes` field on customers does not leak into a dashboard extract.

## SELECT DISTINCT

`DISTINCT` collapses duplicate **projected** rows. Use it for “which labels exist,” not as a substitute for a grain-safe `GROUP BY`.

```sql
SELECT DISTINCT region
FROM lab_customers
ORDER BY region;
```

If you need `region` plus a count, wait for the aggregates lesson — `DISTINCT` will not give you `COUNT`.

## Exercises

1. Write a `SELECT` that returns `company` and `city` for every customer.
2. Write a `SELECT DISTINCT` that lists `city` values.
3. Explain in one sentence why `SELECT DISTINCT region, city` can return more rows than `SELECT DISTINCT region`.

Original Aurora drills — mapped from common SQL exercise **categories** (syntax, select, select distinct), not copied from any quiz bank.

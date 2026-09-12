---
slug: sql-ex-dates-operators
track: sql
title: "Dates, operators, and comments"
description: "Order dates, comparison / arithmetic / concatenation operators, and SQL comments — with a lab-safe SELECT."
level: beginner
order: 31
durationMinutes: 18
topics: [sql]
objectives:
  - "Filter and compare DATE values without treating them as strings"
  - "Use arithmetic, comparison, logical, and concatenation operators on purpose"
  - "Document SQL with -- and /* */ without breaking the SELECT-only lab guard"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Date window"
    code: "SELECT order_id, order_date, freight /* billed weight */\nFROM lab_orders\nWHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-05'\nORDER BY order_date, order_id;"
    note: "DATE literals beat '2026-09-02' strings. BETWEEN is inclusive."
  - label: "Operators"
    code: "SELECT product_name,\n       unit_price * 1.08 AS price_with_tax,\n       unit_price >= 15 AS is_premium,\n       category || ':' || product_name AS label\nFROM lab_products\nORDER BY product_id;"
    note: "Arithmetic, comparison, concatenation. Logical AND/OR live in WHERE."
  - label: "Inline comment"
    code: "SELECT order_id, freight /* pending rows may be NULL */\nFROM lab_orders\nWHERE freight IS NOT NULL;"
    note: "A leading -- comment would fail the lab's SELECT/WITH start-guard. Keep comments after SELECT."
quiz:
  - question: "DATE '2026-09-03' compared with order_date is better than the string '2026-09-03' because…"
    options:
      - "Strings cannot appear in SQL"
      - "A typed date avoids lexical surprises and matches a DATE column"
      - "Warehouses reject ISO strings"
      - "BETWEEN only works on numbers"
    answer: 1
    explanation: "Typed DATE / TIMESTAMP literals keep comparisons in date logic, not text sort."
  - question: "Which line is a comment that leaves the statement as SELECT?"
    options:
      - "-- SELECT order_id FROM lab_orders"
      - "SELECT order_id /* grain: one order */ FROM lab_orders"
      - "REM SELECT order_id"
      - "# SELECT order_id FROM lab_orders"
    answer: 1
    explanation: "/* */ can sit inside a SELECT. A first-line -- makes the lab see a comment, not SELECT. # is MySQL-ish, not this lab."
  - question: "unit_price * 1.08 + 2 uses…"
    options:
      - "Only logical operators"
      - "Arithmetic operators (* and +) with usual precedence (* before +)"
      - "BETWEEN"
      - "UNION"
    answer: 1
    explanation: "* / bind tighter than + -. Parentheses when the tax-plus-fee order matters."
---

Dates, operators, and comments show up in every worksheet. Run the date-window sample in the local lab — comments stay **inline** so the statement still starts with `SELECT`.

## Dates

```sql
-- Dialect: ANSI
SELECT order_id, order_date, freight
FROM lab_orders
WHERE order_date >= DATE '2026-09-03'
ORDER BY order_date;
```

Compare dates as dates. `hire_date` on `lab_employees` is the same type family. Functions differ by platform (`DATEADD`, `DATE_DIFF`, `INTERVAL`); the habit is: store `DATE`/`TIMESTAMP`, filter with typed literals, and pick a timezone story for timestamps (this seed is date-only).

Half-open windows (`>= start AND < next_day`) avoid the “23:59:59” trap when you later add times.

## Operators

| Family | Examples | Lives in |
|--------|----------|----------|
| Arithmetic | `+ - * /` | SELECT / WHERE |
| Comparison | `= <> < > <= >=` | WHERE / CASE / HAVING |
| Logical | `AND OR NOT` | WHERE / HAVING |
| Concatenation | `\|\|` (ANSI), `CONCAT()` | SELECT |
| Membership / range | `IN`, `BETWEEN`, `LIKE` | WHERE |

```sql
SELECT product_name,
       unit_price * 1.08 AS price_with_tax,
       category || ':' || product_name AS label
FROM lab_products
WHERE unit_price >= 10
  AND discontinued = 0;
```

Precedence: arithmetic first, then comparison, then `NOT` / `AND` / `OR`. When unsure, parenthesize.

## Comments

```sql
SELECT order_id,
       freight /* billed weight; NULL means pending */
FROM lab_orders
WHERE freight IS NOT NULL;
```

- `--` comments through end of line.
- `/* … */` can wrap a phrase or a block.

The local lab only accepts statements that **start** with `SELECT` or `WITH`. A file-level `-- note` above the query is fine in a warehouse; here it trips the guard. Keep practice comments beside the select list.

## Exercises

1. List employees hired on or after `DATE '2022-01-01'`.
2. Compute `quantity * unit_price` as `line_amount` on `lab_order_items`.
3. Add an inline `/* grain */` comment to a `SELECT` that still runs in the lab.

Covers Dates, Operators, and Comments.

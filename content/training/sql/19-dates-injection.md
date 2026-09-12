---
slug: sql-dates-injection
track: sql
title: "Warehouse dates and injection-safe filters"
description: "Inclusive date windows, dialect date functions, and why app SQL binds parameters instead of gluing user strings — awareness, not an exploit cookbook."
level: beginner
order: -1
durationMinutes: 25
topics: [sql]
objectives:
  - "Filter DATE columns with inclusive windows (BETWEEN or >= / < next day)"
  - "Call out dialect date helpers without mixing them in one worksheet"
  - "Explain why bound parameters beat string-glued predicates in application SQL"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Inclusive date window (lab)"
    code: "SELECT order_id, order_date, status, amount\nFROM aurora_orders\nWHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-04'\nORDER BY order_date, order_id;"
    note: "BETWEEN on DATE is inclusive. Run this in the local practice lab — literals are fine in a lesson; apps should bind the dates."
  - label: "Half-open day window (preferred in ETL)"
    code: "SELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE order_date >= DATE '2026-09-02'\n  AND order_date <  DATE '2026-09-05';"
    note: "Half-open [start, next) survives timestamps. Document the grain: DATE vs TIMESTAMP_TZ."
  - label: "Bind the filter (application shape)"
    code: "-- Application / dbt: bind :start_date and :end_date\nSELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE order_date >= :start_date\n  AND order_date <  :end_date\n  AND status = :status;"
    note: "The engine receives values, not SQL text. Never concatenate a request querystring into this WHERE."
  - label: "Late paid window"
    code: "SELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE status = 'paid'\n  AND order_date >= DATE '2026-09-06'\nORDER BY order_date;"
    note: "Bind dates. Do not glue a form string into this predicate."
quiz:
  - question: "order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-04' includes…"
    options:
      - "Only 2026-09-03"
      - "2026-09-02, 2026-09-03, and 2026-09-04"
      - "Every row in aurora_orders"
      - "Only rows with NULL dates"
    answer: 1
    explanation: "BETWEEN is inclusive on both ends. For timestamps, prefer >= start AND < next_day so 23:59:59 does not fall out."
  - question: "A web form puts the raw string 2026-09-02' OR '1'='1 into a glued WHERE clause. What is the DE response?"
    options:
      - "Ship it — OR makes the dashboard faster"
      - "Do not glue user text into SQL; bind a typed date parameter (or reject the input in the app)"
      - "Add a stored procedure that concatenates faster"
      - "SELECT * is enough protection"
    answer: 1
    explanation: "Injection is a string-construction bug. Bind parameters (or a warehouse bind) so the date cannot change the statement."
  - question: "DATEADD vs INTERVAL — what should a reviewer ask?"
    options:
      - "Whether both appear in the same untested worksheet"
      - "Whether the query uses LIKE"
      - "Whether PRIMARY KEY is on amount"
      - "Whether LIMIT is 5"
    answer: 0
    explanation: "Snowflake-shaped DATEADD and Spark/DuckDB INTERVAL are different dialects. Pick one per worksheet and test it."
  - question: "BETWEEN DATE '2026-09-02' AND DATE '2026-09-04' is…"
    options:
      - "Exclusive on both ends"
      - "Inclusive on a DATE column"
      - "A string comparison"
      - "Illegal in DuckDB"
    answer: 1
    explanation: "BETWEEN on DATE is inclusive. Know the bound before you write a watermark."
  - question: "Why bind a date parameter instead of concatenating the UI string?"
    options:
      - "Concatenation is faster"
      - "Glued strings are injection and dialect bugs — bind a DATE"
      - "Parameters are deprecated"
      - "Warehouses ignore WHERE"
    answer: 1
    explanation: "Injection-safe filters are a habit, even in internal tools."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Dates are filters. Injection is a **construction** bug. This page stays at awareness: bind values, type them, and never turn a request string into SQL text.

### Seed demo (5 rows)

These five rows are a slice of `aurora_orders` in the local lab — the same seed the Practice editor runs. No second dataset.

| order_id | customer_id | order_date | status | amount | promo_code |
|----------|-------------|------------|--------|--------|------------|
| 1001 | 1 | 2026-09-01 | paid | 42.50 | FALL26 |
| 1002 | 2 | 2026-09-01 | paid | 18.00 | NULL |
| 1003 | 1 | 2026-09-02 | pending | 99.00 | FALL26 |
| 1004 | 3 | 2026-09-02 | cancelled | 12.00 | WIN25 |
| 1005 | 2 | 2026-09-03 | paid | 64.25 | VIP |

```sql
SELECT order_id, customer_id, order_date, status, amount, promo_code
FROM aurora_orders
ORDER BY order_id
LIMIT 5;
```

## Inclusive vs half-open

```sql
-- Dialect: ANSI
-- Inclusive DATE endpoints
WHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-04'

-- Half-open — safer once the column is TIMESTAMP
WHERE order_date >= DATE '2026-09-02'
  AND order_date <  DATE '2026-09-05'
```

Run the inclusive sample in the **local practice lab**. The lab seed uses `DATE`, so BETWEEN and the half-open form agree.

`CURRENT_DATE` / `CURRENT_TIMESTAMP` are session-tz sensitive. Name the timezone in the job, not in a comment after an incident.

## Dialect helpers (do not mix)

| Need | Snowflake-shaped | Spark / DuckDB-shaped |
|------|------------------|------------------------|
| Add a day | `DATEADD(day, 1, order_date)` | `order_date + INTERVAL 1 DAY` |
| Truncate to day | `DATE_TRUNC('DAY', ts)` | `DATE_TRUNC('day', ts)` |
| Difference | `DATEDIFF(day, a, b)` | `DATE_DIFF('day', a, b)` (names vary) |

Pick one dialect per worksheet. The [staging→mart builder](/training/sql/sql-staging-mart-etl) already warns about mixed `DATEADD`.

## Injection-safe filters

Application SQL (API, notebook parameter, BI “custom SQL”) must **bind** `start_date`, `end_date`, `status`. The database sees a typed value. It does not parse the user’s string as syntax.

Unsafe shape (do not write this in an app):

```text
"WHERE order_date = '" + user_input + "'"
```

A crafted `user_input` can close the quote and add another predicate. Defense is boring on purpose: parameterized queries, allow-listed sort columns, and no dynamic SQL from request bodies. This is not a pentest lab and not a stored-proc deep dive.

Warehouse roles still matter: the lab user should not be the account admin. That is [governance](/training/snowflake/sf-governance-rbac), not this page.

## Exercises

1. Run the inclusive window `2026-09-02` … `2026-09-04` in the local lab and count rows.
2. Rewrite it as a half-open window ending `2026-09-05`.
3. In two sentences: why a bound `:start_date` is safer than concatenating a form field, and what you would allow-list if the UI lets users pick a sort column.

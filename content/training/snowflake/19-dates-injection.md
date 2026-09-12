---
slug: sf-dates-injection
track: snowflake
title: "Dates, Time Travel windows, bind-safe filters"
description: "Inclusive date windows, Time Travel as-of versions, and why worksheets bind parameters instead of gluing user strings — awareness, not an exploit cookbook."
level: beginner
order: -1
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Filter DATE columns with inclusive or half-open windows"
  - "Read a Time Travel stand-in as a versioned as-of, not a second grain"
  - "Explain why bound parameters beat string-glued predicates in app SQL"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Inclusive date window"
    code: "SELECT order_id, order_date, status, amount\nFROM sf_orders\nWHERE order_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-02'\nORDER BY order_date, order_id;"
    note: "BETWEEN on DATE is inclusive. Run this in the local practice lab — literals are fine in a lesson; apps should bind the dates."
  - label: "Time-travel stand-in"
    code: "SELECT order_id, amount, as_of_version\nFROM sf_orders_history\nWHERE as_of_version = 1\nORDER BY order_id;"
    note: "DuckDB stand-in for SELECT … AT (TIMESTAMP => …) or BEFORE (STATEMENT => …). Snowflake Time Travel syntax differs."
  - label: "Bind the filter (application shape)"
    code: "-- Application / dbt: bind :start_date and :end_date\nSELECT order_id, order_date, amount\nFROM sf_orders\nWHERE order_date >= :start_date\n  AND order_date <  :end_date\n  AND status = :status;"
    note: "The engine receives values, not SQL text. Never concatenate a request querystring into this WHERE."
quiz:
  - question: "order_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-02' includes…"
    options:
      - "Only 2026-09-01"
      - "2026-09-01 and 2026-09-02"
      - "Every row in sf_orders"
      - "Only rows with NULL dates"
    answer: 1
    explanation: "BETWEEN is inclusive on both ends. For timestamps, prefer >= start AND < next_day."
  - question: "A web form puts the raw string 2026-09-02' OR '1'='1 into a glued WHERE clause. What is the DE response?"
    options:
      - "Ship it — OR makes the dashboard faster"
      - "Do not glue user text into SQL; bind a typed date parameter (or reject the input in the app)"
      - "Add a stored procedure that concatenates faster"
      - "SELECT * is enough protection"
    answer: 1
    explanation: "Injection is a string-construction bug. Bind parameters so the date cannot change the statement."
  - question: "as_of_version = 1 in this lab is a stand-in for…"
    options:
      - "A second grain of sf_orders"
      - "Time Travel / AT (TIMESTAMP) — same keys, prior values"
      - "A virtual warehouse"
      - "DYNAMIC_TABLE refresh"
    answer: 1
    explanation: "History rows are versions of the same order_id, not extra facts. Do not UNION them into gold without picking one version."
  - question: "AT (TIMESTAMP => …) in an account is Time Travel. In this lab you…"
    options:
      - "Run AT against Snowflake"
      - "Use sf_orders_history versions as a stand-in, then copy AT syntax to an account"
      - "ATTACH the account"
      - "Disable the guard"
    answer: 1
    explanation: "Syntax differs. Habit matches."
  - question: "Gluing a form date into WHERE order_date = '…' is bad because…"
    options:
      - "Dates cannot be strings ever"
      - "Injection + type bugs — bind a DATE parameter"
      - "BETWEEN is exclusive"
      - "Time Travel forbids dates"
    answer: 1
    explanation: "Bind-safe filters."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Date windows keep incrementals honest. Time Travel is **the same grain, earlier**. The **local practice lab** is not Snowflake — the habit still transfers: filter dates, bind parameters, pick one as-of version.

## Inclusive vs half-open

```sql
WHERE order_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-02'

WHERE order_date >= DATE '2026-09-01'
  AND order_date <  DATE '2026-09-03'
```

`DATEADD` vs `INTERVAL` — pick one dialect per worksheet. Do not mix them untested.

## Time Travel is not a second fact

`sf_orders_history` in this lab has `order_id` 101 at version 1 (amount 10.00) and version 2 (12.50). That is one order, two as-of values. `AT (TIMESTAMP => …)` in an account is the same idea.

## Do not glue user strings

This lesson is awareness, not a payload catalog. Bind `:start_date` in the app or dbt.

## Exercises

1. Run the inclusive window and name which `order_id`s remain.
2. Compare `as_of_version = 1` vs `2` for order 101.
3. Write one sentence you would put in a PR when someone concatenates a Streamlit text box into a WHERE.

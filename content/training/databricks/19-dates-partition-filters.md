---
slug: dbx-dates-partition-filters
track: databricks
title: "Dates, partition filters, injection-safe SQL"
description: "Inclusive date windows, partition-prune habits for Spark SQL, and why notebooks bind parameters instead of gluing widget strings — awareness, not an exploit cookbook."
level: beginner
order: -1
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Filter DATE columns with inclusive or half-open windows"
  - "Put the partition-like column in WHERE so Spark can prune"
  - "Explain why widgets/bind parameters beat string-glued predicates"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Partition-style date filter"
    code: "SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount\nFROM silver_orders\nWHERE order_date >= DATE '2026-09-02'\nGROUP BY region\nORDER BY n DESC;"
    note: "Filter on partition-like columns early — same habit as Spark SQL. Run it in the local practice lab."
  - label: "Inclusive date window"
    code: "SELECT order_id, order_date, region, amount\nFROM silver_orders\nWHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-03'\nORDER BY order_date, order_id;"
    note: "BETWEEN on DATE is inclusive. For TIMESTAMP, prefer >= start AND < next_day."
  - label: "Bind the filter (notebook / Job)"
    code: "-- Widget / Job parameter: bind start_date — do not glue it\nSELECT order_id, order_date, amount\nFROM silver_orders\nWHERE order_date >= :start_date\n  AND order_date <  :end_date\n  AND status = :status;"
    note: "The engine receives values, not SQL text. Never concatenate a dashboard querystring into this WHERE."
quiz:
  - question: "order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-03' includes…"
    options:
      - "Only 2026-09-02"
      - "2026-09-02 and 2026-09-03"
      - "Every silver row"
      - "Only NULL dates"
    answer: 1
    explanation: "BETWEEN is inclusive on both ends. For timestamps, prefer half-open [start, next) so 23:59:59 does not fall out."
  - question: "A notebook widget pastes the raw string 2026-09-02' OR '1'='1 into a glued WHERE. What is the DE response?"
    options:
      - "Ship it — OR makes Photon faster"
      - "Do not glue widget text into SQL; bind a typed date parameter (or reject the input)"
      - "Add a Scala UDF that concatenates faster"
      - "SELECT * is enough protection"
    answer: 1
    explanation: "Injection is a string-construction bug. Bind parameters so the date cannot change the statement."
  - question: "Why put order_date in WHERE on a partitioned silver table?"
    options:
      - "It changes the grain"
      - "The engine can skip files/partitions — you still write the predicate"
      - "It replaces MERGE"
      - "It grants SELECT"
    answer: 1
    explanation: "Pruning only happens if the filter is in the query. A CASE on a string date often disables it."
  - question: "Wrapping order_date in DATE_FORMAT before comparing is risky because…"
    options:
      - "Dates cannot format"
      - "You may disable pruning — filter on the typed partition-like column"
      - "Spark forbids functions"
      - "FORMAT is a write"
    answer: 1
    explanation: "Keep the column naked in WHERE."
  - question: "BETWEEN on DATE in the lab is inclusive so that…"
    options:
      - "You accidentally skip the end day"
      - "You know the bound — then write the same habit in Spark SQL"
      - "Streaming forbids BETWEEN"
      - "It injects strings"
    answer: 1
    explanation: "Inclusive bounds. Bind values; do not glue UI strings."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Date windows are how incrementals stay honest. Partition / cluster columns are how they stay **cheap**. The **local practice lab** is not Spark — the habit still transfers: filter `order_date` early.

## Inclusive vs half-open

```sql
-- Inclusive DATE
WHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-03'

-- Half-open (preferred once you have timestamps)
WHERE order_date >= DATE '2026-09-02'
  AND order_date <  DATE '2026-09-04'
```

Document the grain: `DATE` vs `TIMESTAMP`. Autoloader `cloudFiles` plus a date partition is still a WHERE you can name.

## Do not glue widgets

`spark.sql(f"… WHERE d = '{widget}'")` is how a string becomes SQL. Bind a parameter, or parse the widget to a `date` in Python **before** it enters the query.

This lesson is awareness, not a payload catalog.

## Exercises

1. Run the partition-style filter in the lab and name which regions remain.
2. Rewrite BETWEEN as a half-open window for `2026-09-02` only.
3. Write one sentence you would put in a PR when someone concatenates `dbutils.widgets.get` into Spark SQL.

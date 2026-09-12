---
slug: sql-semi-structured
track: sql
title: "Semi-structured data in SQL"
description: "JSON/VARIANT/STRUCT access patterns across Snowflake and Spark SQL."
level: advanced
order: 7
durationMinutes: 35
topics: [sql, snowflake, databricks]
dialect: mixed
objectives:
  - "Extract nested fields safely"
  - "Flatten arrays with care"
  - "Know schema-on-read tradeoffs"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Snowflake path"
    code: "payload:user.id::string"
  - label: "Spark get"
    code: "payload.user.id"
  - label: "Landing JSON habit"
    code: "-- Warehouse: parse once into typed columns in silver\n-- Do not: SELECT payload:amount::NUMBER in every gold dashboard\n-- Lab stand-in: keep typed aurora_orders.amount"
    note: "Semi-structured in bronze; typed contract in silver."
quiz:
  - question: "Flattening arrays before aggregating often…"
    options:
      - "Can multiply rows — watch grain"
      - "Never changes row counts"
      - "Deletes duplicates"
      - "Creates primary keys"
    answer: 0
  - question: "Why flatten JSON in silver instead of in every gold query?"
    options:
      - "JSON is illegal in gold"
      - "Typed columns are one contract; repeated :path casts drift and hide NULLs"
      - "Bronze cannot store JSON"
      - "Dashboards cannot join"
    answer: 1
    explanation: "Parse once. Gold reads a table, not a treasure map."
  - question: "A missing JSON key vs a JSON null should…"
    options:
      - "Both become 0"
      - "Be distinguished if the product cares — unknown vs omitted"
      - "Crash the warehouse always"
      - "Be DISTINCT-ed away"
    answer: 1
    explanation: "Same lesson as Python None vs missing key."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Semi-structured data in SQL

> **Dialects in this lesson:** Snowflake VARIANT path syntax vs Spark SQL struct/JSON fields — labeled per block.

Prefer projecting needed fields into typed columns for marts. Keep raw VARIANT in landing.

```sql
-- Dialect: Snowflake
SELECT
  payload:user.id::STRING AS user_id,
  ARRAY_SIZE(payload:items) AS item_count
FROM landing.events;
```

```sql
-- Dialect: Spark SQL
SELECT
  payload.user.id AS user_id,
  SIZE(payload.items) AS item_count
FROM landing.events;
```

## Exercises

1. Extract `user.id` and `items` array length from a JSON payload.
2. Explain why repeated flatten+join can fan out revenue.

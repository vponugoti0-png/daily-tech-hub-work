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
    code: "SELECT payload:user.id::string AS user_id\nFROM events;"
    note: "Cast at the leaf. Keep VARIANT in bronze; project typed columns in silver."
  - label: "Spark get"
    code: "SELECT payload.user.id AS user_id\nFROM events;"
    note: "Dot path on STRUCT/JSON. Missing fields are NULL, not an error."
  - label: "Flatten with grain"
    code: "SELECT e.event_id, f.value:sku::string AS sku\nFROM events e, LATERAL FLATTEN(input => e.payload:items) f;"
    note: "Flattening arrays multiplies rows — name the new grain before you SUM."
quiz:
  - question: "Flattening arrays before aggregating often…"
    options:
      - "Can multiply rows — watch grain"
      - "Never changes row counts"
      - "Deletes duplicates"
      - "Creates primary keys"
    answer: 0
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

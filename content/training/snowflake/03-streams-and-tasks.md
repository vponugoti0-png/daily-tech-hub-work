---
slug: sf-streams-tasks
track: snowflake
title: "Streams & Tasks for incremental pipelines"
description: "Change data capture with Streams, scheduled Tasks, and DAG-like task trees."
level: intermediate
order: 3
durationMinutes: 40
topics: [snowflake, sql]
objectives:
  - "Create streams on tables"
  - "Process METADATA$ACTION correctly"
  - "Chain tasks with dependencies"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Stream + Task shape"
    code: "CREATE STREAM raw.orders_stream ON TABLE raw.orders;\nCREATE TASK load_orders WAREHOUSE = etl_wh SCHEDULE = '5 MINUTE' AS\n  MERGE INTO analytics.orders t USING raw.orders_stream s ...;"
    note: "Educational copy. METADATA$ACTION is INSERT/UPDATE/DELETE since last consume."
quiz:
  - question: "A Snowflake Stream records…"
    options:
      - "Only warehouse credits"
      - "Row-level changes since last consumption offset"
      - "UI theme settings"
      - "Git commits"
    answer: 1
  - question: "A Stream’s offset advances when…"
    options:
      - "You look at the table in the UI"
      - "A DML consumes the stream (or you advance it on purpose)"
      - "The warehouse auto-suspends"
      - "You clone the database"
    answer: 1
    explanation: "Unconsumed streams keep change rows. Consumption is a contract."
  - question: "METADATA$ACTION = 'DELETE' in a MERGE should…"
    options:
      - "Be ignored so gold never shrinks"
      - "Be handled explicitly — deletes are data too"
      - "Drop the warehouse"
      - "Rotate keys"
    answer: 1
    explanation: "CDC without deletes is a lie if source deletes exist."
  - question: "Task trees exist so that…"
    options:
      - "You click Run All in a worksheet forever"
      - "land → clean → mart has dependencies and one owner"
      - "Dynamic Tables are disabled"
      - "RBAC is skipped"
    answer: 1
    explanation: "Schedule + dependency. Same idea as a DBX Job."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Streams & Tasks for incremental pipelines

```sql
CREATE STREAM raw.orders_stream ON TABLE raw.orders;
CREATE TASK load_orders WAREHOUSE = etl_wh SCHEDULE = '5 MINUTE' AS
  MERGE INTO analytics.orders t USING raw.orders_stream s ...;
```

## Exercises

1. Handle DELETE actions from a stream in MERGE.
2. Design a task tree: land → clean → mart.

---
slug: sf-databases-schemas-warehouses
track: snowflake
title: "Databases, schemas & warehouses (day-0)"
description: "True-zero Snowflake: databases vs schemas vs virtual warehouses, credits, and a safe first worksheet."
level: beginner
order: 0
durationMinutes: 25
topics: [snowflake]
objectives:
  - "Explain database vs schema vs virtual warehouse"
  - "Pick a warehouse size and auto-suspend for a first worksheet"
  - "Name objects with database.schema.table"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Three-level name"
    code: "SELECT current_database(), current_schema();\nUSE DATABASE analytics;\nUSE SCHEMA raw;\nSELECT * FROM analytics.raw.orders LIMIT 20;"
    note: "Storage is database + schema. Compute is the warehouse."
  - label: "Safe first warehouse"
    code: "CREATE WAREHOUSE IF NOT EXISTS learn_wh\n  WAREHOUSE_SIZE = 'XSMALL'\n  AUTO_SUSPEND = 60\n  AUTO_RESUME = TRUE\n  INITIALLY_SUSPENDED = TRUE;"
    note: "Suspend idle compute. XSMALL is enough for this lesson."
quiz:
  - question: "A Snowflake virtual warehouse primarily provides…"
    options:
      - "Permanent table storage"
      - "Elastic compute billed by credits while it runs"
      - "Git hosting for dbt"
      - "Unity Catalog"
    answer: 1
    explanation: "Warehouses are compute. Databases/schemas hold objects. Idle warehouses still cost if they are not suspended."
  - question: "Which identifier is a table?"
    options:
      - "analytics.raw.orders"
      - "COMPUTE_WH"
      - "ACCOUNTADMIN"
      - "A worksheet tab name"
    answer: 0
    explanation: "database.schema.table. The warehouse is a separate compute object."
---

Day-0 Snowflake: three words people mix up — **database**, **schema**, **warehouse**. Guest-friendly; copy into a worksheet when you have an account.

## The three objects

| Object | What it is | Analogy |
|--------|------------|---------|
| **Database** | Top-level container | A project locker |
| **Schema** | Folder of tables/views/stages | `raw`, `analytics`, `marts` |
| **Virtual warehouse** | Compute that runs SQL | A sized engine you can suspend |

Storage and compute are separate. Creating a table does not start a warehouse. Running `SELECT` does.

```sql
-- Dialect: Snowflake
CREATE DATABASE IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS analytics.raw;
CREATE SCHEMA IF NOT EXISTS analytics.marts;

CREATE WAREHOUSE IF NOT EXISTS learn_wh
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE;

USE WAREHOUSE learn_wh;
USE SCHEMA analytics.raw;
```

## Credits (honest day-0)

You pay while a warehouse is **running**. Auto-suspend is the first cost control. Do not leave a Large warehouse up “just in case.” Architecture and clustering come later in this track.

## First worksheet checklist

1. Role that is **not** `ACCOUNTADMIN` for daily work.
2. `USE WAREHOUSE` + `USE SCHEMA` so names resolve.
3. `LIMIT` on every exploratory `SELECT *`.

## Exercises

1. Sketch databases/schemas for `raw` / `analytics` / `marts` in one account.
2. Explain why a table can exist while every warehouse is suspended.
3. Continue with [Snowflake architecture](/training/snowflake/sf-architecture) once the names feel boring.

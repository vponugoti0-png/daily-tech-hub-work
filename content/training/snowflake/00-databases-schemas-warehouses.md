---
slug: sf-day0-objects
track: snowflake
title: "Databases, schemas & warehouses"
description: "True-zero Snowflake: databases vs schemas vs virtual warehouses, credits, and a safe first worksheet."
level: beginner
order: 0
durationMinutes: 25
topics: [snowflake]
objectives:
  - "Explain database.schema.table nesting"
  - "Separate storage (database/schema) from warehouse compute"
  - "Set auto-suspend and right-size habits on day 0"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "SHOW / USE / CREATE SCHEMA"
    code: "SHOW DATABASES;\nSHOW SCHEMAS IN DATABASE analytics;\nUSE DATABASE analytics;\nCREATE SCHEMA IF NOT EXISTS analytics.raw;\nUSE SCHEMA analytics.raw;\nSHOW TABLES;"
    note: "Nesting is database → schema → table. SHOW is your map."
  - label: "Warehouse parameters (comment as you go)"
    code: "CREATE WAREHOUSE IF NOT EXISTS learn_wh\n  WAREHOUSE_SIZE = 'XSMALL'   -- right-size; bump only if spilling\n  AUTO_SUSPEND = 60           -- seconds idle before stop\n  AUTO_RESUME = TRUE\n  INITIALLY_SUSPENDED = TRUE; -- do not start until first query"
  - label: "Account map (local lab)"
    code: "SELECT database, schema, object_name, object_type\nFROM sf_account_objects\nORDER BY database, schema, object_name;"
    note: "Nesting is database.schema.table. Run this SELECT in the local practice lab — not a live account."
  - label: "Warehouse vs database"
    code: "SELECT name, size, auto_suspend_sec, status FROM sf_warehouses;\nSELECT database, schema, object_name FROM sf_account_objects;"
    note: "Warehouses are compute. Databases/schemas hold objects. Auto-suspend stops credit burn."
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
  - question: "The warehouse name is not…"
    options:
      - "Compute you size and suspend"
      - "A database — tables live in database.schema.table"
      - "Something you auto-suspend"
      - "A credit-consuming resource"
    answer: 1
    explanation: "Day-0: compute vs storage nesting."
  - question: "learn_wh auto_suspend 60 seconds exists in the seed so you remember…"
    options:
      - "To keep BI warehouses running all weekend"
      - "Idle warehouses still spend — suspend when idle"
      - "That XSMALL cannot SELECT"
      - "That suspend deletes data"
    answer: 1
    explanation: "Credits are time × size. Data stays in tables."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

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
SHOW DATABASES;
SHOW SCHEMAS IN DATABASE analytics;
USE DATABASE analytics;
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

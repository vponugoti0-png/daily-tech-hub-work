---
slug: sf-copy-history-practice
track: snowflake
title: "COPY history practice (local)"
description: "Read a local stand-in for COPY INTO history: LOADED vs PARTIAL days. Replay the stage — do not zero-fill gold. Not a live account."
level: beginner
order: 21
durationMinutes: 20
topics: [snowflake, sql]
objectives:
  - "List COPY-history-style rows from the local seed"
  - "Treat PARTIAL as a contract break that needs a replay"
  - "Keep the lab at SELECT / WITH — copy COPY INTO into a worksheet"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "COPY history stand-in"
    code: "SELECT stage_path, rows_loaded, status, load_date\nFROM sf_copy_history\nORDER BY load_date;"
    note: "Local table. Not ACCOUNT_USAGE. Run it in the local practice lab."
  - label: "PARTIAL days"
    code: "SELECT stage_path, rows_loaded, load_date\nFROM sf_copy_history\nWHERE status = 'PARTIAL'\nORDER BY load_date;"
    note: "Replay the stage. Do not silently zero-fill the mart."
  - label: "Paid SAMPLE still works"
    code: "SELECT o.order_id, c.region, o.status, o.amount\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nORDER BY o.amount DESC\nLIMIT 5;"
    note: "History is one question. The SAMPLE join is another. Do not mix grains."
quiz:
  - question: "sf_copy_history on this site is…"
    options:
      - "A live scrape of SNOWFLAKE.ACCOUNT_USAGE"
      - "A tiny local stand-in so you can practice SELECT on load status"
      - "A Python kernel"
      - "A %sh pipe"
    answer: 1
    explanation: "DuckDB fixture. Copy real COPY INTO + ACCOUNT_USAGE into a worksheet."
  - question: "A PARTIAL day should…"
    options:
      - "Be treated as success so gold can close"
      - "Trigger a replay / investigation — rows_loaded may be incomplete"
      - "Delete the database"
      - "Print the account password"
    answer: 1
    explanation: "Partial loads lie in gold if you ignore them."
  - question: "COPY INTO itself runs…"
    options:
      - "In this local lab when you type COPY"
      - "In a Snowflake worksheet / Task — the lab refuses COPY / ATTACH"
      - "Inside Git Play Lab"
      - "Via dbutils.secrets"
    answer: 1
    explanation: "Lab v1 is SELECT / WITH. COPY is a warehouse command."
---

**COPY INTO** lands files. This lesson practices **reading a history-shaped table** locally. The lab will refuse `COPY` / `ATTACH`.

## Workspace COPY (copy-only)

```sql
-- Dialect: Snowflake (worksheet)
-- COPY INTO analytics.raw.orders
-- FROM @analytics.raw.orders_stage
-- FILE_FORMAT = (TYPE = JSON)
-- ON_ERROR = 'ABORT_STATEMENT';
```

Check history (in an account) or this stand-in (here). `PARTIAL` means replay, not “close the day.”

## Exercises

1. List all `sf_copy_history` rows.
2. Filter `status = 'PARTIAL'`.
3. Write (do not run here) a COPY INTO you would replay for that day.

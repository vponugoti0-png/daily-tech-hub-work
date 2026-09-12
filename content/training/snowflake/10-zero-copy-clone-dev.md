---
slug: sf-zero-copy-clone-dev
track: snowflake
title: "Zero-copy clone for DEV workflows lab"
description: "Clone prod-shaped databases for DEV, test a bad MERGE safely, and know when clone storage starts to grow."
level: intermediate
order: 10
durationMinutes: 30
topics: [snowflake]
objectives:
  - "Clone a schema/database for a DEV experiment"
  - "Recover a mistaken MERGE with Time Travel or a swap"
  - "Explain deferred storage growth on clones"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Clone DEV from ANALYTICS"
    code: "CREATE OR REPLACE DATABASE analytics_dev CLONE analytics;\nGRANT USAGE ON DATABASE analytics_dev TO ROLE transformer_dev;"
    note: "Instant copy. Bytes grow only when DEV or PROD diverge."
  - label: "Undo a bad DEV MERGE"
    code: "CREATE OR REPLACE TABLE analytics_dev.silver.orders CLONE analytics_dev.silver.orders AT (OFFSET => -3600);"
    note: "Time Travel on the clone — do this in DEV first."
quiz:
  - question: "Zero-copy clone is valuable because…"
    options:
      - "It always duplicates all bytes immediately"
      - "It creates instant copies with deferred storage growth"
      - "It disables RBAC"
      - "It replaces COPY INTO"
    answer: 1
    explanation: "Metadata copy first. You pay extra storage when tables change."
  - question: "The safest place to rehearse a destructive MERGE is…"
    options:
      - "Prod ACCOUNTADMIN"
      - "A DEV clone with a non-prod warehouse"
      - "A dropped Time Travel window"
      - "A public gist of credentials"
    answer: 1
    explanation: "Clone, break it, clone again. Prod is for the reviewed statement."
---

Lab for DEV workflows. You already met clones in [Time Travel & clones](/training/snowflake/sf-time-travel-clones). This page is the rehearsal loop for the orders mart.

## Why clone (not reload)

Reloading prod into DEV takes hours and drifts. `CLONE` gives you prod-shaped objects in seconds so you can:

- Practice the late-data MERGE
- Test a Dynamic Table definition
- Grant a narrower DEV role

```sql
CREATE OR REPLACE DATABASE analytics_dev CLONE analytics;
USE DATABASE analytics_dev;
USE WAREHOUSE dev_wh;  -- small, auto-suspend
```

## Break-glass drill

1. Run a **wrong** MERGE in DEV (update `amount` without a key guard).
2. Confirm gold `orders_daily` looks cursed.
3. Restore silver: `CREATE OR REPLACE TABLE … CLONE … AT (OFFSET => -3600)` or `BEFORE (STATEMENT => '…')`.
4. Re-run the **correct** MERGE.
5. Drop or re-clone DEV at the end of the spike so it does not accumulate unique micro-partitions forever.

## Storage honesty

Clones share micro-partitions until someone writes. A DEV that constantly MERGEs will **grow**. Budget it. Suspend extra Dynamic Tables in the clone ([cost checklist](/training/snowflake/sf-capstone-dynamic-table-mart)).

## Exercises

1. Write the `CREATE DATABASE … CLONE` plus a `GRANT USAGE` for `transformer_dev`.
2. Decide OFFSET vs `BEFORE STATEMENT` for “undo the last worksheet run.”
3. List two objects you would **not** clone into a widely shared DEV (masking-policy gaps, raw PII schemas).

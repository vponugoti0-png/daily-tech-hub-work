---
slug: sql-shared-capstone-checklist
track: sql
title: "Shared capstone checklist — Orders to daily revenue mart"
description: "Cross-track scorecard for the shared story: land orders, apply late events, publish a daily revenue mart on SQL, Snowflake, or Databricks."
level: intermediate
order: 9
durationMinutes: 25
topics: [sql, snowflake, databricks]
objectives:
  - "State grain for bronze/silver/gold in the orders story"
  - "Check landing, late-data, DQ, mart, and cost before calling a capstone done"
  - "Jump to the Snowflake DT and Databricks Job capstones without new nav"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Shared grains"
    code: "bronze: one landed row per file/event (dups allowed)\nsilver: one row per order_id (latest state)\ngold:   one row per event_date (SUM revenue)"
    note: "If gold is not daily grain, you are not done with this story."
  - label: "Scorecard"
    code: "[ ] Files/COPY/Autoloader landed\n[ ] Late overlap + MERGE documented\n[ ] DQ gate (unique order_id, not-null amount)\n[ ] orders_daily published\n[ ] Cost/freshness named (lag or schedule)\n[ ] Guest can read this page — no /practice simulator"
    note: "Use this list in the Snowflake and Databricks capstone PRs."
quiz:
  - question: "The shared capstone story ends at…"
    options:
      - "A new top-level /practice route"
      - "A daily revenue mart (one row per event_date) fed by late-aware silver"
      - "Only a bronze dump with no gold"
      - "A path picker that replaces Start Here"
    answer: 1
    explanation: "Orders → late events → daily revenue mart. Same story on every warehouse."
  - question: "This checklist is…"
    options:
      - "A new primary nav item"
      - "Training content linked from the Training index (no new nav)"
      - "A DuckDB live runner"
      - "A Unity Catalog replacement"
    answer: 1
    explanation: "Cross-track content lives under Training. Header nav stays the same."
---

One story, three implementations. This page is the **shared scorecard** — not a new primary nav item. It is linked from the Training index.

**Orders → late events → daily revenue mart.**

## Implementations

- SQL patterns: [Deduping & late-data](/training/sql/sql-deduping-late-data) → [Build staging→mart ETL](/training/sql/sql-staging-mart-etl)
- Snowflake: [COPY/stages](/training/snowflake/sf-copy-stages-ingestion) → [Build warehouse ETL](/training/snowflake/sf-warehouse-etl-builder) → [Capstone — Dynamic Table mart + cost checklist](/training/snowflake/sf-capstone-dynamic-table-mart)
- Databricks: [Autoloader](/training/databricks/dbx-autoloader-ingestion) → [Build medallion ETL](/training/databricks/dbx-medallion-etl-builder) → [Capstone — bronze→silver→gold Job](/training/databricks/dbx-capstone-medallion-job)
- Optional Python: [Build an ETL job](/training/python/python-etl-pipeline-builder) → [CLI + tests + package](/training/python/python-capstone-cli-package)

## Grain (write this on the ticket)

| Layer | One row is… | Duplicates? |
|-------|-------------|-------------|
| Landing / bronze | A raw event or file row | Allowed |
| Silver | An `order_id` (latest `updated_at`) | **No** |
| Gold | An `event_date` | **No** — `SUM(amount)` of paid orders |

If you join item-level rows into gold without aggregating, revenue doubles. That fails the checklist.

## Scorecard

1. **Land** — stage/COPY or Autoloader; load history or checkpoint exists.
2. **Late events** — overlap window + MERGE (or partition overwrite) documented.
3. **DQ** — duplicate `order_id` in silver returns zero rows; required columns not null; freshness bound named.
4. **Mart** — `orders_daily(event_date, revenue, order_cnt)` published by DT or Job.
5. **Cost / freshness** — `TARGET_LAG` or Job schedule + warehouse/cluster policy.
6. **Honest runtime** — no live DuckDB/Monaco on this site; you copy SQL into your warehouse.

## Exercises

1. Copy the scorecard into a PR template ([Git data-diff PRs](/training/git/git-pr-templates-data-diffs)).
2. Mark each box against the Snowflake DT capstone, then against the Databricks Job capstone.
3. Add one team-specific box (PII, row-access, or region grain) without changing the shared grain.

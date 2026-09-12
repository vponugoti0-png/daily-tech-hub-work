---
slug: dbx-liquid-clustering
track: databricks
title: "Liquid clustering / table maintenance lab"
description: "Cluster keys vs partitions, OPTIMIZE/VACUUM awareness, and a maintenance checklist for the orders fact."
level: advanced
order: 11
durationMinutes: 35
topics: [databricks, sql]
objectives:
  - "Pick liquid clustering keys from query predicates"
  - "Know what OPTIMIZE/VACUUM do (and the retention trap)"
  - "Schedule maintenance without blocking the gold Job"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Cluster the orders fact"
    code: "ALTER TABLE main.silver.orders CLUSTER BY (event_date, customer_id);\nOPTIMIZE main.silver.orders;"
    note: "Cluster on columns you filter/join — not on high-cardinality IDs alone unless you always equality-filter them."
  - label: "Maintenance order"
    code: "1. OPTIMIZE (compaction / clustering)\n2. VACUUM only after you understand retention\n3. Watch small-file counts in history"
    note: "VACUUM deletes unreferenced files. Time travel windows shrink."
quiz:
  - question: "Liquid clustering keys should match…"
    options:
      - "Random UUIDs you never filter on"
      - "Columns that appear in WHERE / JOIN predicates"
      - "The Job cluster size"
      - "The notebook title"
    answer: 1
    explanation: "Clustering is physical layout for the queries you actually run."
  - question: "VACUUM without thinking about retention can…"
    options:
      - "Improve Time Travel forever"
      - "Remove files you still needed for time travel / long-running readers"
      - "Create Unity Catalog"
      - "Disable Autoloader"
    answer: 1
    explanation: "Compact first. Vacuum with a retention you can defend."
  - question: "Liquid clustering / maintenance is for…"
    options:
      - "Storing secrets"
      - "Keeping large tables readable — clustering keys you actually filter on"
      - "Replacing WHERE"
      - "Disabling Jobs"
    answer: 1
    explanation: "Physical layout follows access. Filter columns first in SQL."
  - question: "OPTIMIZE / maintenance windows belong…"
    options:
      - "In the BI warehouse during peak dashboards"
      - "On the ETL compute, off the serving warehouse"
      - "Inside %sh with a token"
      - "Never — Delta never needs maintenance"
    answer: 1
    explanation: "Same cost habit as Snowflake: do not fight users for compute."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Lab: keep Delta tables healthy after the capstone Job is green.

## Clustering vs partitioning

Classic partitions (`event_date`) still work. **Liquid clustering** lets you declare keys and let OPTIMIZE rewrite layout without a partition explosion.

Good keys for `silver.orders`: `event_date` (almost every query) and a selective dim key (`customer_id` or `region`) if joins/filters use it.

Poor keys: raw `order_id` if you rarely equality-filter a single id; a timestamp at second grain.

```sql
ALTER TABLE main.silver.orders CLUSTER BY (event_date, customer_id);
OPTIMIZE main.silver.orders;
```

ZORDER is the older cousin. Prefer the current clustering feature your workspace actually has — the habit is the same: **layout follows predicates**.

## Maintenance checklist

1. After heavy MERGE days, `OPTIMIZE` silver (and gold if it is a managed Delta table).
2. Watch tiny files — Autoloader can create them; compaction is the fix.
3. `VACUUM` only with a retention ≥ your worst replay/time-travel need.
4. Run maintenance as a **separate Job** so it cannot starve the gold SLA.
5. Do not OPTIMIZE bronze every five minutes — bronze is a log.

## Exercises

1. Propose cluster keys for a 5B-row `events` table queried by `event_date` + `account_id`.
2. Write a one-line VACUUM policy (hours retained + who may run it).
3. Explain why gold `orders_daily` (tiny, daily grain) rarely needs the same clustering as silver.

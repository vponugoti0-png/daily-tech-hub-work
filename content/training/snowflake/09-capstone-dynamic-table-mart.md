---
slug: sf-capstone-dynamic-table-mart
track: snowflake
title: "Capstone — Dynamic Table mart + cost checklist"
description: "Build a daily revenue mart from orders with a Dynamic Table, then run a cost/freshness checklist before you call it done."
level: advanced
order: 9
durationMinutes: 45
topics: [snowflake, sql]
objectives:
  - "Declare a Dynamic Table at day grain for paid orders"
  - "Pick TARGET_LAG that matches a finance vs ops SLA"
  - "Walk a cost checklist: warehouse, lag, clustering, Time Travel"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Daily revenue Dynamic Table"
    code: "CREATE OR REPLACE DYNAMIC TABLE analytics.marts.orders_daily\n  TARGET_LAG = '1 hour'\n  WAREHOUSE = etl_wh\nAS\nSELECT DATE_TRUNC('day', ordered_at) AS event_date,\n       SUM(amount) AS revenue,\n       COUNT(*) AS order_cnt\nFROM analytics.silver.orders\nWHERE status = 'paid'\nGROUP BY 1;"
    note: "Silver should already be deduped. DT refreshes the mart — it is not a COPY."
  - label: "Cost checklist"
    code: "- Warehouse: right-size + AUTO_SUSPEND\n- TARGET_LAG: hour for finance, tighter only if ops pays\n- No SELECT * in the DT body\n- Cluster/filter columns match downstream predicates\n- Suspend unused DTs in DEV clones"
    note: "Credits come from refresh compute, not from the CREATE statement."
quiz:
  - question: "TARGET_LAG expresses…"
    options:
      - "Warehouse size"
      - "Max acceptable staleness for the dynamic table"
      - "COPY retry count"
      - "A new primary nav route"
    answer: 1
    explanation: "Lag is a freshness SLO. Tighter lag = more refreshes = more credits."
  - question: "A Dynamic Table mart should read from…"
    options:
      - "A deduped silver/orders table (late events already merged)"
      - "The raw stage only"
      - "ACCOUNTADMIN defaults"
      - "A Databricks job cluster"
    answer: 0
    explanation: "Land and clean first. The DT is the declarative gold step."
---

Capstone for the Snowflake track. Shared story: **Orders → late events → daily revenue mart**. The end-to-end COPY → Stream/Task → DT path is [Build warehouse ETL](/training/snowflake/sf-warehouse-etl-builder). Pair with the [shared checklist](/training/sql/sql-shared-capstone-checklist).

## Build the mart

Assume `analytics.silver.orders` is one row per `order_id` (deduped, late updates applied). Grain of gold: **one row per `event_date`**.

```sql
CREATE OR REPLACE DYNAMIC TABLE analytics.marts.orders_daily
  TARGET_LAG = '1 hour'
  WAREHOUSE = etl_wh
AS
SELECT
  DATE_TRUNC('day', ordered_at) AS event_date,
  SUM(amount) AS revenue,
  COUNT(*) AS order_cnt
FROM analytics.silver.orders
WHERE status = 'paid'
GROUP BY 1;
```

Compare to Tasks + Streams: DTs win when the SQL is a DAG of SELECTs. Hand-rolled tasks win when you need custom MERGE branches or external calls.

## Cost checklist (do this before “done”)

1. **Warehouse** — `etl_wh` sized for refresh, `AUTO_SUSPEND` on. Do not share with BI.
2. **TARGET_LAG** — hourly is enough for most daily revenue. `15 minutes` is an ops choice you can name.
3. **Projection** — no `SELECT *`; only grain + measures.
4. **Upstream** — silver filters + clustering on `ordered_at` so refreshes prune.
5. **DEV** — clone + suspend extra DTs ([zero-copy clone lab](/training/snowflake/sf-zero-copy-clone-dev)).
6. **Observe** — refresh history, bytes scanned, failed refreshes.

## Late events

If Tuesday's refund lands Thursday, silver MERGE updates `amount`/`status`. The DT recomputes affected days on the next refresh. You do **not** COPY the refund straight into gold.

## Exercises

1. Write a second DT `orders_daily_region` grouped by `event_date, region` reading the same silver table.
2. Pick `TARGET_LAG` for (a) finance close and (b) same-day ops. One sentence each.
3. Walk the six-item cost checklist against a fictional oversized `LARGE` warehouse with `TARGET_LAG = '1 minute'`. What do you change?

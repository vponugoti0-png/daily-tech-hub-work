---
slug: sf-catalog-views-metrics
track: snowflake
title: "Databases, views, and semantic metrics (local)"
description: "Account-shaped habits on the local DuckDB lab: database.schema.table, views over SAMPLE, and a semantic / metric-view–style daily revenue table."
level: beginner
order: 20
durationMinutes: 20
topics: [snowflake, sql]
objectives:
  - "Read database.schema.table from the local inventory — not a live Snowflake account"
  - "Query analytics.paid_orders as a view and keep Dynamic Tables for persisted grains"
  - "Treat metrics.sf_daily_revenue as a semantic / metric-view stand-in"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Local catalog inventory"
    code: "SELECT catalog, schema, object_name, object_type\nFROM lab_catalog_objects\nORDER BY catalog, schema, object_name;"
    note: "Same-origin DuckDB. The warehouse name is compute — it is not in the table path."
  - label: "analytics.paid_orders view"
    code: "SELECT order_id, amount, promo_code\nFROM analytics.paid_orders\nORDER BY order_id;"
    note: "A view is a stored SELECT. Dynamic Tables persist a grain; this view does not."
  - label: "Metric-style daily revenue"
    code: "SELECT dim_order_date, dim_region, measure_order_count, measure_revenue\nFROM metrics.sf_daily_revenue\nORDER BY dim_order_date, dim_region;"
    note: "Stand-in for a Snowflake semantic / metric view. Not Cortex and not a live account object."
quiz:
  - question: "Snowflake-style three-level names in this lab are…"
    options:
      - "A remote account we scrape"
      - "database.schema.table mapped onto the in-browser DuckDB catalog"
      - "The warehouse size (XSMALL)"
      - "A Python runtime"
    answer: 1
    explanation: "We seed local schemas and an inventory table. Learner SQL cannot ATTACH remote databases."
  - question: "analytics.paid_orders is…"
    options:
      - "A Stream+Task"
      - "A view over paid analytics.orders"
      - "The warehouse name"
      - "Time Travel"
    answer: 1
    explanation: "Views hide a repeated filter. Persist a Dynamic Table when downstream BI needs a freshness SLO."
  - question: "metrics.sf_daily_revenue is metric-view–style because…"
    options:
      - "It stores OAuth tokens"
      - "It names dim_order_date / dim_region and measures, like a semantic view"
      - "It replaces COPY"
      - "It is a stored procedure"
    answer: 1
    explanation: "Semantic / metric views expose dims + measures. This seed is a tiny local table with that shape."
  - question: "analytics.paid_orders is a view, so…"
    options:
      - "It persists like a Dynamic Table"
      - "It is a stored SELECT — DTs persist a grain; this view does not"
      - "It is Cortex"
      - "It is a warehouse"
    answer: 1
    explanation: "View vs DT vs table."
  - question: "metrics.sf_daily_revenue is…"
    options:
      - "A live Snowflake semantic view in your org"
      - "A local metric-style table — not Cortex, not a remote object"
      - "ACCOUNTADMIN"
      - "A stage"
    answer: 1
    explanation: "Same-origin fixture."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

The **local practice lab** queries same-origin DuckDB stand-ins for account objects: tables, views, schemas, a catalog inventory, and a metric-view–style mart. Not a live Snowflake account. No Python lab.

## Database.schema.table, locally

```sql
-- Dialect: Snowflake habit / local DuckDB
SELECT catalog, schema, object_name, object_type
FROM lab_catalog_objects
WHERE schema IN ('analytics', 'metrics')
ORDER BY schema, object_name;
```

`analytics.orders` is the same SAMPLE grain as `sf_orders` in `main`. In an account you write `analytics.public.orders` (or your db/schema). The **warehouse** (`learn_wh`) is compute — it does not appear in the table path. We do not attach a remote account.

## Views vs Dynamic Tables

```sql
SELECT order_id, amount, promo_code
FROM analytics.paid_orders
ORDER BY order_id;
```

`analytics.paid_orders` is `status = 'paid'`. A view is a stored SELECT. A Dynamic Table **persists** a grain and a lag. Do not confuse the two in a review.

## Semantic / metric-view stand-in

```sql
SELECT dim_order_date, dim_region, measure_order_count, measure_revenue
FROM metrics.sf_daily_revenue
ORDER BY dim_order_date, dim_region;
```

Snowflake semantic views (and Metric View-shaped objects) expose dimensions and measures. This seed is a **table** with `dim_*` / `measure_*` columns — local, tiny, no Cortex.

## Exercises

1. List `analytics` and `metrics` objects from `lab_catalog_objects`.
2. Compare `analytics.paid_orders` to `analytics.orders WHERE status = 'paid'`.
3. Query `metrics.sf_daily_revenue` and name the grain in one sentence.

---
slug: sql-catalog-views-metrics
track: sql
title: "Catalogs, schemas, views, and metric-style tables"
description: "Read the local DuckDB catalog: schemas that group contracts, views as stored SELECTs, and metric-view–style tables with named dimensions and measures."
level: beginner
order: 20
durationMinutes: 20
topics: [sql]
objectives:
  - "Name objects as catalog.schema.table and list them from a local inventory — not a remote database"
  - "Query a view as a stored SELECT and know when a mart should persist the grain instead"
  - "Read a metric-view–style table as dimensions + measures without treating it as a live semantic SaaS"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Local catalog inventory"
    code: "SELECT catalog, schema, object_name, object_type\nFROM lab_catalog_objects\nORDER BY catalog, schema, object_name;"
    note: "Same-origin DuckDB only. No remote catalog attach, no scraped warehouse."
  - label: "Paid-orders view"
    code: "SELECT order_id, amount, promo_code\nFROM aurora.paid_orders\nORDER BY order_id;"
    note: "aurora.paid_orders is a view over aurora.orders. A mart persists this grain; a view does not."
  - label: "Metric-style region revenue"
    code: "SELECT dim_region, measure_paid_orders, measure_revenue\nFROM metrics.aurora_region_revenue\nORDER BY measure_revenue DESC;"
    note: "dim_* / measure_* naming is the Metric View habit. This is a local table, not a BI semantic layer."
  - label: "Open shipments view"
    code: "SELECT order_id, carrier, status\nFROM aurora.open_shipments\nORDER BY shipped_date;"
    note: "A view is a stored SELECT. Marts persist a grain; this view does not."
quiz:
  - question: "What is catalog.schema.table in this local lab?"
    options:
      - "A remote Snowflake account we scrape at runtime"
      - "The three-level name for an object in the in-browser DuckDB catalog"
      - "The warehouse size"
      - "A Python module path"
    answer: 1
    explanation: "The engine is same-origin DuckDB. Unity Catalog / Snowflake account names are teaching labels — we do not attach remote catalogs."
  - question: "aurora.paid_orders in the seed is…"
    options:
      - "A live warehouse Dynamic Table"
      - "A stored SELECT (a view) over paid aurora.orders"
      - "A primary key"
      - "A Python runtime"
    answer: 1
    explanation: "Views are stored queries. Persist a mart when downstream jobs need a stable grain and freshness SLO."
  - question: "metrics.aurora_region_revenue is a metric-view–style table because…"
    options:
      - "It has remote HTTP credentials"
      - "It names dimensions and measures (dim_region, measure_revenue) instead of dumping raw facts"
      - "It replaces GROUP BY forever"
      - "It is a stored procedure"
    answer: 1
    explanation: "Metric views expose dims + measures. This lab stores that shape as a tiny local table — not a live UC / Snowflake semantic object."
  - question: "metrics.aurora_region_revenue is in this lab a…"
    options:
      - "Live BI SaaS semantic layer"
      - "Local metric-view–style table (dim_* + measure_*) — not a remote catalog"
      - "Snowflake Cortex function"
      - "Unity Catalog metastore in the cloud"
    answer: 1
    explanation: "Same-origin fixture. Teaching labels, not a remote attach."
  - question: "Learner SQL still cannot ATTACH because…"
    options:
      - "DuckDB forbids ATTACH for everyone including the seed"
      - "The lab guard keeps SELECT/WITH only — no remote catalogs"
      - "ATTACH is required for every SELECT"
      - "Views need ATTACH"
    answer: 1
    explanation: "Seed may attach in-memory catalogs. Your worksheet cannot."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

The **local practice lab** on this page queries same-origin DuckDB objects: tables, views, schemas, a catalog inventory, and metric-view–style tables. Not a live warehouse. Not a Python runtime.

## Catalog, then schema, then table

```sql
-- Dialect: ANSI (local DuckDB)
SELECT catalog, schema, object_name, object_type
FROM lab_catalog_objects
WHERE schema IN ('aurora', 'metrics')
ORDER BY schema, object_name;
```

`aurora.orders` is the same grain as `aurora_orders` in `main`. Qualify the schema when two contracts share a name. The **catalog** here is the in-memory DuckDB database — we do not `ATTACH` a remote account.

## Views are stored SELECTs

```sql
SELECT order_id, amount, promo_code
FROM aurora.paid_orders
ORDER BY order_id;
```

`aurora.paid_orders` filters `status = 'paid'`. Use a view for a repeated question. Persist a mart when freshness, grants, and grain need a load contract.

## Metric-view–style tables

```sql
SELECT dim_region, measure_paid_orders, measure_revenue
FROM metrics.aurora_region_revenue
ORDER BY measure_revenue DESC;
```

Dimensions (`dim_*`) are the grain you slice. Measures (`measure_*`) are the aggregates. Databricks Metric Views and Snowflake semantic views look like this in a warehouse. This seed is a **table** with that shape — honest local fixture, not a live metric engine.

## Exercises

1. List `aurora` and `metrics` objects from `lab_catalog_objects`.
2. Query `aurora.paid_orders` and compare row count to `aurora.orders WHERE status = 'paid'`.
3. Read `metrics.aurora_region_revenue` and name the grain in one sentence.

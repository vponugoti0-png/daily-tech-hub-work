---
slug: dbx-catalog-views-metrics
track: databricks
title: "Catalogs, views, and metric views (local)"
description: "Unity Catalog-shaped habits on the local DuckDB lab: three-level names, schemas, views over silver, and a metric-view–style gold table."
level: beginner
order: 20
durationMinutes: 20
topics: [databricks, sql]
objectives:
  - "Read catalog.schema.table from the local inventory — not a remote Unity Catalog"
  - "Query silver.ok_orders as a view and keep gold on a named grain"
  - "Treat metrics.orders_daily as a Metric View stand-in (dimensions + measures)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Local catalog inventory"
    code: "SELECT catalog, schema, object_name, object_type\nFROM lab_catalog_objects\nORDER BY catalog, schema, object_name;"
    note: "Same-origin DuckDB. A notebook path is not a table. No remote UC attach."
  - label: "silver.ok_orders view"
    code: "SELECT order_id, region, amount\nFROM silver.ok_orders\nORDER BY order_id;"
    note: "View over ok silver rows. Gold should read a contract, not re-filter bronze in every notebook."
  - label: "Metric-style gold (stand-in)"
    code: "SELECT dim_order_date, dim_region, measure_order_count, measure_revenue\nFROM metrics.orders_daily\nORDER BY dim_order_date, dim_region;"
    note: "DuckDB table stand-in for a Unity Catalog Metric View. Not a live UC object."
quiz:
  - question: "Unity Catalog three-level names in this lab are…"
    options:
      - "A remote workspace we scrape"
      - "catalog.schema.table on the in-browser DuckDB catalog (memory / optional local ATTACH)"
      - "cluster.notebook.cell"
      - "A Python runtime"
    answer: 1
    explanation: "We seed local schemas and an inventory table. sql-guard blocks ATTACH in learner SQL — no remote catalogs."
  - question: "silver.ok_orders is…"
    options:
      - "A Delta CDF stream"
      - "A view: stored SELECT of silver.orders WHERE status = 'ok'"
      - "A Job cluster policy"
      - "A primary key"
    answer: 1
    explanation: "Views hide a repeated filter. Gold still needs a persisted grain and a Job/DLT that owns freshness."
  - question: "Why is metrics.orders_daily metric-view–style?"
    options:
      - "It ships cloud credentials"
      - "It exposes dim_order_date / dim_region and measures, like a UC Metric View"
      - "It replaces Delta"
      - "It is OPTIMIZE"
    answer: 1
    explanation: "Metric Views declare dimensions and measures. This seed is a tiny local table with that shape — not CREATE METRIC VIEW in a workspace."
  - question: "silver.ok_orders is a view so that…"
    options:
      - "Gold can skip persisting a contract"
      - "Notebooks share a stored SELECT — gold should still persist a mart grain"
      - "It is a live UC Metric View"
      - "It stores checkpoints"
    answer: 1
    explanation: "Views are not a load. Marts persist."
  - question: "lab_catalog_objects lists teaching names because…"
    options:
      - "This browser attached to your cloud metastore"
      - "Same-origin inventory — no remote catalog, no ATTACH from learner SQL"
      - "It is ACCOUNTADMIN"
      - "It is a secret manager"
    answer: 1
    explanation: "Honest labels."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

The **local practice lab** queries same-origin DuckDB stand-ins for Unity Catalog objects: tables, views, schemas, a catalog inventory, and a metric-view–style gold table. Not a live workspace. No Python lab.

## Three-level names, locally

```sql
-- Dialect: Spark SQL habit / local DuckDB
SELECT catalog, schema, object_name, object_type
FROM lab_catalog_objects
WHERE schema IN ('bronze', 'silver', 'gold', 'metrics')
ORDER BY schema, object_name;
```

`silver.orders` is the same grain as `silver_orders` in `main`. In a workspace you would write `main.silver.orders`. Here the catalog is in-browser memory — we do not attach a remote UC.

## Views over silver

```sql
SELECT order_id, region, amount
FROM silver.ok_orders
ORDER BY order_id;
```

`silver.ok_orders` is `status = 'ok'`. Notebooks can share that filter. Gold still belongs in a Job or DLT with a named grain `(order_date, region)`.

## Metric View stand-in

```sql
SELECT dim_order_date, dim_region, measure_order_count, measure_revenue
FROM metrics.orders_daily
ORDER BY dim_order_date, dim_region;
```

Unity Catalog Metric Views expose dimensions and measures to SQL warehouses. This seed is a **table** with `dim_*` / `measure_*` columns — honest, tiny, local.

## Exercises

1. List bronze / silver / gold / metrics objects from `lab_catalog_objects`.
2. Compare `silver.ok_orders` to `silver.orders WHERE status = 'ok'`.
3. Query `metrics.orders_daily` and say the grain in one sentence.

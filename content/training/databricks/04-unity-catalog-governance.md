---
slug: dbx-unity-catalog
track: databricks
title: "Unity Catalog & governance"
description: "Catalogs, schemas, grants, volume storage, and lineage-minded design."
level: intermediate
order: 4
durationMinutes: 35
topics: [databricks, general]
objectives:
  - "Navigate three-level namespace"
  - "Grant least-privilege access"
  - "Separate envs with catalogs"
updatedAt: "2026-09-11"
quiz:
  - question: "Unity Catalog three-level namespace is…"
    options:
      - "catalog.schema.table"
      - "cluster.notebook.cell"
      - "bucket.folder.file only"
      - "user.password.host"
    answer: 0
    explanation: "catalog.schema.table. A notebook path is not a table."
  - question: "Three-level names are…"
    options:
      - "cluster.notebook.cell"
      - "catalog.schema.table — a notebook path is not a table"
      - "user.token.workspace"
      - "job.run.task only"
    answer: 1
    explanation: "The lab’s current_catalog() sample is the habit without a remote metastore."
  - question: "This local lab’s unity attach is…"
    options:
      - "Your company’s metastore"
      - "Same-origin in-memory teaching labels — learner SQL still cannot ATTACH"
      - "A live AWS catalog"
      - "A secret store"
    answer: 1
    explanation: "No remote catalogs. No CSP widen."
  - question: "A Metric View stand-in uses dim_* and measure_* so that…"
    options:
      - "Spark runs faster"
      - "Reviewers see dimensions vs measures — not a live UC Metric View object"
      - "You can skip gold tables"
      - "%sh can SELECT them"
    answer: 1
    explanation: "Teaching names. Persist gold on purpose; the stand-in is a table."
cheatSheet:
  - label: "Local catalog inventory"
    code: "SELECT catalog, schema, object_name, object_type\nFROM lab_catalog_objects\nORDER BY catalog, schema, object_name;"
    note: "Same-origin DuckDB stand-in. A notebook path is not a table. No remote UC attach."
  - label: "Current catalog + schema"
    code: "SELECT current_catalog() AS catalog, current_schema() AS schema;"
    note: "Three-level names start here. The local catalog is in-browser memory."
  - label: "silver.orders (schema.table)"
    code: "SELECT order_id, region, status, amount\nFROM silver.orders\nWHERE status = 'ok'\nORDER BY order_id;"
    note: "Unqualified silver_orders still works. schema.table is the UC habit without a remote catalog."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Unity Catalog & governance

`main.silver.orders` — catalog.schema.table.

Use grants on catalogs/schemas for teams; avoid wide `ALL PRIVILEGES` in prod.

The **local practice lab** on this page lists same-origin DuckDB schemas and a catalog inventory. It is not a live Unity Catalog and it cannot attach a remote workspace.

## Exercises

1. Draft grants for analysts (read gold) vs engineers (write silver).
2. Explain volumes vs tables for ML artifacts.
3. Run the catalog inventory sample and name one view and one metric-view–style table.

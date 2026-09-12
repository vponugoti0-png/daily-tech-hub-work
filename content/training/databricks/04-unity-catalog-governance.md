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
---

# Unity Catalog & governance

`main.silver.orders` — catalog.schema.table.

Use grants on catalogs/schemas for teams; avoid wide `ALL PRIVILEGES` in prod.

The **local practice lab** on this page lists same-origin DuckDB schemas and a catalog inventory. It is not a live Unity Catalog and it cannot attach a remote workspace.

## Exercises

1. Draft grants for analysts (read gold) vs engineers (write silver).
2. Explain volumes vs tables for ML artifacts.
3. Run the catalog inventory sample and name one view and one metric-view–style table.

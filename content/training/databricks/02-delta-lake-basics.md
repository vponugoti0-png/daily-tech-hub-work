---
slug: dbx-delta-lake-basics
track: databricks
title: "Delta Lake basics"
description: "ACID tables on object storage: MERGE, Time Travel, OPTIMIZE, and vacuum awareness."
level: intermediate
order: 2
durationMinutes: 40
topics: [databricks, sql]
objectives:
  - "Create and MERGE into Delta tables"
  - "Use Time Travel for debugging"
  - "Understand OPTIMIZE/ZORDER tradeoffs"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Merge"
    code: "MERGE INTO silver_orders t\nUSING bronze_orders s\nON t.order_id = s.order_id\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;"
    note: "ACID upsert. Copy-shaped — run SELECT previews in the local lab, not a live MERGE."
  - label: "Time travel"
    code: "SELECT * FROM silver_orders TIMESTAMP AS OF '2026-09-01';"
    note: "Read a prior version for audit/rollback. Vacuum will eventually drop it."
  - label: "Current vs history count"
    code: "SELECT COUNT(*) AS silver_rows FROM silver_orders;"
    note: "Lab-safe current-state check. Time Travel syntax stays warehouse-only."
quiz:
  - question: "Delta Time Travel helps you…"
    options:
      - "Delete Unity Catalog"
      - "Read prior table versions for audit/rollback"
      - "Skip ACID"
      - "Avoid partitioning forever"
    answer: 1
---

# Delta Lake basics

```sql
CREATE TABLE sand.events USING DELTA AS SELECT * FROM landing.events;

MERGE INTO sand.events t
USING updates u ON t.event_id = u.event_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

`OPTIMIZE` + `ZORDER` for read locality; `VACUUM` carefully with retention.

## Exercises

1. Write a MERGE for CDC with deletes.
2. Query a table as of yesterday and diff counts.

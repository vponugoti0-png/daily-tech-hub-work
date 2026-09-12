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
    code: "MERGE INTO target t USING src s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *"
    note: "Account syntax. The local lab has an upsert-shaped SELECT stand-in."
  - label: "Time travel"
    code: "SELECT * FROM t TIMESTAMP AS OF '2026-09-01'"
    note: "Read a prior version for audit/rollback. Copy into a workspace."
  - label: "Upsert-shaped join (local lab)"
    code: "SELECT\n  COALESCE(u.order_id, t.order_id) AS order_id,\n  COALESCE(u.status, t.status) AS status,\n  COALESCE(u.amount, t.amount) AS amount\nFROM silver_orders t\nFULL OUTER JOIN bronze_orders u ON t.order_id = u.order_id\nORDER BY order_id;"
    note: "DuckDB stand-in for MERGE. Run it in the local practice lab."
quiz:
  - question: "Delta Time Travel helps you…"
    options:
      - "Delete Unity Catalog"
      - "Read prior table versions for audit/rollback"
      - "Skip ACID"
      - "Avoid partitioning forever"
    answer: 1
  - question: "Delta’s MERGE habit in this lab is shown as…"
    options:
      - "A live write to your workspace"
      - "A FULL OUTER JOIN stand-in — Spark / Delta syntax differs"
      - "VACUUM"
      - "A %sh copy"
    answer: 1
    explanation: "Read-only lab. Learn the match/not-match shape, then copy MERGE to a workspace."
  - question: "Time travel / versions exist so you can…"
    options:
      - "Skip DQ gates"
      - "Read a previous table version after a bad write"
      - "Store PATs in _delta_log"
      - "Disable Unity Catalog"
    answer: 1
    explanation: "Versions are a recovery tool, not a substitute for review."
  - question: "A corrupt bronze row with NULL amount should…"
    options:
      - "Become 0 in silver automatically"
      - "Stay out of silver until a named rule says otherwise"
      - "Delete the Delta log"
      - "Be DISTINCT-ed in gold"
    answer: 1
    explanation: "The seed drops status = 'corrupt'. That is the quality contract."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

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

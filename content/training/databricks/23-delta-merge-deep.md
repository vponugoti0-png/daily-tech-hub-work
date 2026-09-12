---
slug: dbx-delta-merge-deep
track: databricks
title: "Delta MERGE deep-dive — MATCHED and leftovers"
description: "Preview WHEN MATCHED / NOT MATCHED / DELETE-shaped sets on the local seed. Copy real MERGE INTO into a workspace — the lab stays SELECT / WITH."
level: intermediate
order: 23
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Preview the MATCHED set as an INNER JOIN on the business key"
  - "Preview NOT MATCHED (inserts) and leftover bronze keys"
  - "Know DELETE-shaped MERGE is a keyed predicate you can re-SELECT"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "MATCHED preview"
    code: "SELECT t.order_id, t.status AS silver_status, u.status AS bronze_status, u.amount\nFROM silver_orders t\nINNER JOIN bronze_orders u ON t.order_id = u.order_id\nORDER BY t.order_id;"
    note: "WHEN MATCHED. Run here, then copy MERGE into a disposable silver table."
  - label: "NOT MATCHED preview"
    code: "SELECT u.order_id, u.status, u.amount\nFROM bronze_orders u\nWHERE NOT EXISTS (\n  SELECT 1 FROM silver_orders t WHERE t.order_id = u.order_id\n)\nORDER BY u.order_id;"
    note: "WHEN NOT MATCHED THEN INSERT. This seed’s leftover is the corrupt bronze row."
  - label: "Upsert-shaped join"
    code: "SELECT\n  COALESCE(u.order_id, t.order_id) AS order_id,\n  COALESCE(u.region, t.region) AS region,\n  COALESCE(u.status, t.status) AS status,\n  COALESCE(u.amount, t.amount) AS amount\nFROM silver_orders t\nFULL OUTER JOIN bronze_orders u ON t.order_id = u.order_id\nORDER BY order_id;"
    note: "DuckDB stand-in for MATCHED + NOT MATCHED. Spark SQL / Delta syntax differs."
quiz:
  - question: "WHEN MATCHED is the same set as…"
    options:
      - "A Cartesian product"
      - "An INNER JOIN on the MERGE key"
      - "%sh ls"
      - "CREATE SECRET"
    answer: 1
    explanation: "If the inner set looks wrong, do not run the MERGE."
  - question: "WHEN NOT MATCHED THEN INSERT should…"
    options:
      - "Insert every bronze row including corrupt landings you already rejected"
      - "Insert leftover keys that pass the silver contract"
      - "Truncate gold"
      - "Print dbutils.secrets"
    answer: 1
    explanation: "Quality first. This seed’s leftover is corrupt — that is a teaching leftover, not a load."
  - question: "MERGE … WHEN MATCHED THEN DELETE is safe when…"
    options:
      - "There is no WHERE / AND on the key window"
      - "You can re-SELECT the exact keys the delete would hit"
      - "You run it from %sh"
      - "The lab allows DELETE"
    answer: 1
    explanation: "The lab refuses DML. Preview the keys. Unqualified deletes wipe silver."
---

Delta **MERGE** is a join you can name. The **local practice lab** previews the sets. It will **not** run `MERGE INTO`.

## Workspace MERGE (copy-only)

```sql
-- Dialect: Spark SQL / Delta (workspace only)
MERGE INTO silver.orders t
USING bronze.orders_delta u
ON t.order_id = u.order_id
WHEN MATCHED AND u.status <> 'corrupt' THEN UPDATE SET *
WHEN NOT MATCHED AND u.status <> 'corrupt' THEN INSERT *
WHEN MATCHED AND u.status = 'corrupt' THEN DELETE;
```

Copy that into a **disposable** table. Tie MATCHED to a rule, not “touch every row.”

## DELETE-shaped MERGE

`WHEN MATCHED THEN DELETE` is still a filter. Re-SELECT the keys first. Time Travel / bronze replay is how you undo a bad one — not this lab.

## `%sh` and secrets

There is no shell MERGE. There is no secret scope. If a notebook uses `%sh` to call a CLI, that is copy-only debug — never a Job step on this site.

## Exercises

1. Run the MATCHED preview. Count rows.
2. Run the NOT MATCHED preview. Name the leftover key.
3. Write (do not run) a MERGE that skips `status = 'corrupt'`.

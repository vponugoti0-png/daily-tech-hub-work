---
slug: sql-explain-plan-lab
track: sql
title: "Explain-plan reading lab"
description: "Read warehouse query profiles: scans vs pruning, joins, spill, and the first rewrite to try."
level: intermediate
order: 11
durationMinutes: 35
topics: [sql, snowflake, databricks]
objectives:
  - "Name scan, filter, join, and aggregate steps in a plan"
  - "Spot a full scan that should have pruned"
  - "Choose one rewrite: predicate, projection, or join order"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Range-friendly date filter"
    code: "-- avoid: WHERE DATE(ordered_at) = CURRENT_DATE\nWHERE ordered_at >= CURRENT_DATE\n  AND ordered_at <  CURRENT_DATE + INTERVAL '1' DAY;"
    note: "Wrapping the column kills pruning in most warehouses."
  - label: "What to read first"
    code: "1. Bytes scanned vs table size (pruning %)\n2. Join type + build/probe sizes\n3. Spill / remote disk\n4. Rows out of each step vs grain you expected"
    note: "Profiles differ by vendor; these four questions port."
quiz:
  - question: "Applying a function to a filter column often…"
    options:
      - "Helps pruning"
      - "Prevents partition/cluster pruning"
      - "Deletes Time Travel"
      - "Creates a Job cluster"
    answer: 1
    explanation: "DATE(ts) = today usually scans more than a range on ts."
  - question: "Spill in a profile usually means…"
    options:
      - "The query is optimally small"
      - "Memory ran out and the engine wrote intermediate data to disk"
      - "RBAC is disabled"
      - "You should SELECT *"
    answer: 1
    explanation: "Spill is a cost/perf smell: narrow columns, filter earlier, or size up briefly."
  - question: "You read an explain plan to…"
    options:
      - "Change the catalog color"
      - "See scans, joins, and whether a date filter can prune"
      - "Skip WHERE clauses"
      - "Disable DQ gates"
    answer: 1
    explanation: "Plans are a habit, not a vendor trophy. Filter early, project less."
  - question: "A plan that shows a full table scan plus a late FILTER on order_date suggests…"
    options:
      - "Perfect pruning"
      - "The predicate may not be pushable / typed as DATE — fix the filter shape"
      - "You should SELECT *"
      - "You should add LIMIT 1 in prod"
    answer: 1
    explanation: "Pruning fails when the column is wrapped or typed as text."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

A lab, not a vendor certification. Open any `EXPLAIN` / query profile (Snowflake, Spark SQL, or your warehouse) and answer four questions.

## The four questions

1. **How much did we scan?** Bytes read vs table size. If you filtered on `event_date` and scanned 90%, pruning failed.
2. **How did we join?** Broadcast/hash/sort-merge. Was the build side the small dim?
3. **Did we spill?** Disk spill ⇒ too-wide rows or too-small warehouse/cluster.
4. **Does the row count match grain?** A join that explodes 10× is usually a fan-out, not “the optimizer.”

## Common DE plans

```sql
-- Dialect: ANSI
SELECT c.region, SUM(o.amount)
FROM fct_orders o
JOIN dim_customer c
  ON c.customer_id = o.customer_id
 AND c.is_current
WHERE o.event_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-07'
GROUP BY 1;
```

Healthy signs: date range prunes `fct_orders`; dim is the small build; aggregate rows ≈ number of regions.

Unhealthy signs: `DATE(ordered_at)` in the `WHERE`; `SELECT *` into the aggregate; joining `order_items` before summing `order_amount`.

## Rewrite menu (try one)

| Smell | First rewrite |
|-------|----------------|
| Full scan on a dated fact | Range predicate on the partition/cluster column |
| Wide rows / spill | Project only keys + measures before the join |
| Unexpected row explosion | Re-state grain; aggregate the many-side first |
| Broadcast of a huge table | Filter it first or let AQE / the warehouse pick a hash join |

You do not need a live profile UI on this site. Paste a sanitized plan into notes and annotate the four questions.

## Exercises

1. Rewrite `WHERE DATE(ordered_at) = CURRENT_DATE` to a half-open range.
2. Given a plan that scans 4 TB for a 1-day filter, list two checks (clustering, wrapping functions, missing stats).
3. Explain why `SELECT * FROM fct_orders JOIN dim_customer` hurts a BI extract more than a 20-row notebook.

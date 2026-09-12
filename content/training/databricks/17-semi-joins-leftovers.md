---
slug: dbx-semi-joins-leftovers
track: databricks
title: "Semi-joins — leftover bronze keys"
description: "EXISTS / NOT EXISTS as lakehouse filters: keep silver grain, find leftover bronze keys, and avoid fan-out when you only need a yes/no."
level: beginner
order: -3
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Filter parents with EXISTS so children cannot fan out the grain"
  - "Find leftover bronze keys with NOT EXISTS (anti-join) instead of NOT IN"
  - "Read ANY / ALL as comparisons to a set — rewrite as a scalar when the review is clearer"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Regions that have ok silver (EXISTS)"
    code: "SELECT DISTINCT s.region\nFROM silver_orders s\nWHERE EXISTS (\n  SELECT 1\n  FROM silver_orders x\n  WHERE x.region = s.region\n    AND x.status = 'ok'\n)\nORDER BY s.region;"
    note: "Semi-join: you asked “does this region have an ok row?” — not “explode every order.”"
  - label: "Leftover bronze keys (NOT EXISTS)"
    code: "SELECT b.order_id, b.status, b.amount\nFROM bronze_orders b\nWHERE NOT EXISTS (\n  SELECT 1 FROM silver_orders s\n  WHERE s.order_id = b.order_id\n)\nORDER BY b.order_id;"
    note: "Anti-join. Safer than NOT IN (SELECT order_id …) when keys can be NULL. This seed’s leftover is the corrupt bronze row."
  - label: "Scalar stand-in for > ANY"
    code: "SELECT order_id, region, amount\nFROM silver_orders\nWHERE amount > (\n  SELECT AVG(amount) FROM silver_orders WHERE status = 'ok'\n)\nORDER BY amount DESC;"
    note: "amount > ANY (SELECT amount …) is easy to misread. A named scalar (avg ok ticket) reviews faster."
  - label: "Bronze event leftovers"
    code: "SELECT b.event_id, b.event_type\nFROM bronze_events b\nWHERE NOT EXISTS (SELECT 1 FROM silver_events s WHERE s.event_id = b.event_id);"
    note: "Same anti-join habit as leftover order keys."
quiz:
  - question: "Why use EXISTS instead of joining bronze to silver when you only need leftover keys?"
    options:
      - "EXISTS is always faster on Photon"
      - "EXISTS / NOT EXISTS keep the grain you named; a join can duplicate rows"
      - "JOIN cannot use order_id"
      - "EXISTS writes a Delta constraint"
    answer: 1
    explanation: "EXISTS is a filter, not a column source. Joining without aggregating fans out the parent."
  - question: "NOT IN (SELECT order_id FROM silver_orders) is risky when…"
    options:
      - "The subquery is empty"
      - "The subquery can return NULL keys — the whole NOT IN becomes unknown"
      - "You also use LIMIT"
      - "The table is named silver_orders"
    answer: 1
    explanation: "A single NULL in the IN-list makes NOT IN unknown for every row. NOT EXISTS does not have that trap."
  - question: "The leftover bronze row in this lab seed is leftover because…"
    options:
      - "SQL warehouses cannot see bronze"
      - "Silver dropped the corrupt landing — the key exists in bronze only"
      - "LIMIT 5 deleted it"
      - "Unity Catalog hid it"
    answer: 1
    explanation: "Quality contracts remove rows from silver. Anti-join those keys so you can quarantine or alert — do not pretend gold is complete."
  - question: "Leftover bronze keys after silver writes mean…"
    options:
      - "Silver is broken always"
      - "A quality rule dropped them — prove it with NOT EXISTS, do not hide with DISTINCT"
      - "You should DELETE bronze nightly"
      - "Unity Catalog failed"
    answer: 1
    explanation: "This seed’s leftover is the corrupt row. Name the rule."
  - question: "EXISTS as a semi-join is better than JOIN when…"
    options:
      - "You need every bronze column in gold"
      - "You only care that a silver key exists — JOIN can fan out"
      - "You want to UPDATE"
      - "You are in %sh"
    answer: 1
    explanation: "Existence vs projection."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Leftover keys are a **metric**. Autoloader can land a corrupt file; silver should drop it; someone should still count the leftovers.

The **local practice lab** has bronze + silver on the same `order_id` space. Run the anti-join here, then copy the shape into a workspace quality notebook.

## EXISTS keeps grain

```sql
SELECT b.order_id
FROM bronze_orders b
WHERE EXISTS (
  SELECT 1 FROM silver_orders s
  WHERE s.order_id = b.order_id
);
```

That is “bronze keys that made silver,” one row per bronze key — not a fan-out.

## NOT EXISTS vs NOT IN

Prefer `NOT EXISTS` when `order_id` can be NULL. `NOT IN` plus a NULL list is a foot-gun in Spark SQL the same way it is in ANSI.

## Exercises

1. Run the leftover-bronze sample and name the `order_id` that never reached silver.
2. Rewrite that anti-join as a `LEFT JOIN … WHERE s.order_id IS NULL`.
3. Explain why leftover-key count belongs on a quality dashboard next to gold revenue.

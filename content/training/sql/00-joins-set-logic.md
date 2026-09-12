---
slug: sql-joins-set-logic
track: sql
title: "DE joins & set-logic recap"
description: "True-zero recap of INNER/LEFT/ANTI joins, UNION vs UNION ALL, and grain-safe set logic for warehouse work."
level: beginner
order: 0
durationMinutes: 25
topics: [sql]
objectives:
  - "Pick INNER vs LEFT vs ANTI for a business question"
  - "Keep grain stable when joining dimensions"
  - "Use UNION ALL for incremental stacks and EXCEPT/ANTI for missing keys"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "LEFT join + unmatched"
    code: "SELECT o.order_id, c.region\nFROM orders o\nLEFT JOIN dim_customer c ON c.customer_id = o.customer_id AND c.is_current\nWHERE c.customer_id IS NULL;"
    note: "Unmatched keys are a metric, not a silent drop."
  - label: "ANTI-join (NOT EXISTS)"
    code: "SELECT s.order_id\nFROM staging.orders s\nWHERE NOT EXISTS (\n  SELECT 1 FROM mart.orders m WHERE m.order_id = s.order_id\n);"
    note: "Prefer NOT EXISTS over NOT IN when keys can be NULL."
quiz:
  - question: "When should you use a LEFT join instead of INNER?"
    options:
      - "When you only want matches and can drop orphans"
      - "When the left grain must be preserved even if the dim is missing"
      - "When you need to multiply rows on purpose"
      - "When UNION ALL is too slow"
    answer: 1
    explanation: "LEFT keeps every left-side row. INNER drops unmatched facts — only do that on purpose."
  - question: "UNION vs UNION ALL for stacking daily incrementals?"
    options:
      - "Always UNION — it is faster"
      - "UNION ALL keeps duplicates and skips the expensive distinct"
      - "They are identical"
      - "UNION ALL deletes late data"
    answer: 1
    explanation: "UNION ALL is the incremental default. Dedup explicitly if you need uniqueness."
---

True-zero warmup: joins and set logic before windows and incrementals. Guest-friendly — copy the snippets into any warehouse worksheet.

## Join menu (when to use)

| Join | Keeps | Use when |
|------|--------|----------|
| `INNER` | Matches only | Both sides must exist (paid order + known customer) |
| `LEFT` | All left rows | Facts must survive a missing dim |
| `ANTI` (`NOT EXISTS`) | Left rows with no match | Late keys, orphans, “not yet in mart” |
| `SEMI` (`EXISTS`) | Left rows with a match | Filter without adding columns |

Never join two facts at different grains without aggregating first — that is how revenue doubles.

## Set logic

```sql
-- Dialect: ANSI
-- Stack incrementals (keep dups until you dedupe)
SELECT * FROM day_1
UNION ALL
SELECT * FROM day_2;

-- Keys in staging but not in the mart
SELECT order_id FROM staging.orders
EXCEPT
SELECT order_id FROM mart.orders;
```

`EXCEPT`/`MINUS` (Snowflake) and `ANTI` joins answer the same question. Prefer `NOT EXISTS` when NULLs are possible.

## Grain check

Before you join: **what is one row?** If `orders` is one row per `order_id` and `order_items` is one row per `order_id + sku`, joining them then `SUM(order_amount)` fans out. Aggregate items first — or sum a column that lives at item grain.

## Exercises

1. Write a LEFT join from `orders` to `dim_customer` that keeps unmatched customers visible (`region IS NULL`).
2. Rewrite a `NOT IN (SELECT id …)` anti-join as `NOT EXISTS`.
3. Explain why `UNION` (distinct) is the wrong default for stacking hourly extracts.

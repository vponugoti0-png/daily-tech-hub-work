---
slug: sql-joins-set-logic-recap
track: sql
title: "DE joins & set-logic recap"
description: "True-zero recap of INNER/LEFT/ANTI joins, UNION vs UNION ALL, and grain-safe set logic for warehouse work."
level: beginner
order: 0
durationMinutes: 30
topics: [sql]
objectives:
  - "Choose INNER vs LEFT vs ANTI for a commerce question"
  - "Explain grain and fan-out before summing revenue"
  - "Use UNION ALL vs UNION deliberately (incrementals vs distinct keys)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "LEFT join + unmatched"
    code: "SELECT o.order_id, c.region\nFROM orders o\nLEFT JOIN dim_customer c ON c.customer_id = o.customer_id AND c.is_current\nWHERE c.customer_id IS NULL;"
    note: "Unmatched keys are a metric, not a silent drop."
  - label: "ANTI-join missing customers"
    code: "SELECT o.order_id, o.customer_id\nFROM orders o\nWHERE NOT EXISTS (\n  SELECT 1 FROM dim_customer c\n  WHERE c.customer_id = o.customer_id AND c.is_current\n);"
    note: "Hint: unmatched customers are a metric. Prefer NOT EXISTS over NOT IN when keys can be NULL."
  - label: "INNER — paid order + known customer"
    code: "SELECT o.order_id, c.region, o.amount\nFROM orders o\nINNER JOIN dim_customer c\n  ON c.customer_id = o.customer_id AND c.is_current\nWHERE o.status = 'paid';"
    note: "Commerce-shaped starter. Do not join order_items before summing o.amount."
  - label: "Refunds × orders"
    code: "SELECT r.refund_id, r.order_id, o.status, r.amount\nFROM aurora_refunds r\nJOIN aurora_orders o ON o.order_id = r.order_id;"
    note: "Refund grain. The measure is r.amount — not SUM(o.amount)."
quiz:
  - question: "When should you use a LEFT join instead of INNER?"
    options:
      - "When you only want matches and can drop orphans"
      - "When the left grain must be preserved even if the dim is missing"
      - "When you need to multiply rows on purpose"
      - "When UNION ALL is too slow"
    answer: 1
    explanation: "LEFT keeps every left-side row. INNER drops unmatched facts — only do that on purpose."
  - question: "Joining order_items (one row per sku) to orders then SUM(order.amount) usually…"
    options:
      - "Keeps revenue at order grain"
      - "Fans out and can double-count revenue"
      - "Deletes unmatched customers"
      - "Is the same as UNION ALL"
    answer: 1
    explanation: "Many-side joins multiply fact rows. Aggregate items first, or sum a column at item grain."
  - question: "UNION vs UNION ALL for stacking daily incrementals?"
    options:
      - "Always UNION — it is faster"
      - "UNION ALL keeps duplicates and skips the expensive distinct"
      - "They are identical"
      - "UNION ALL deletes late data"
    answer: 1
    explanation: "UNION ALL is the incremental default. Dedup explicitly if you need uniqueness."
  - question: "INNER JOIN aurora_order_items then SUM(o.amount) is wrong because…"
    options:
      - "INNER JOIN drops paid orders"
      - "You changed grain to items and repeated the order amount"
      - "SUM requires HAVING"
      - "aurora_orders has no amount"
    answer: 1
    explanation: "Name the grain. Item measures use qty * unit_price."
  - question: "EXCEPT / anti-join thinking: customers with no paid order is…"
    options:
      - "A full outer join on amount"
      - "NOT EXISTS (SELECT 1 FROM aurora_orders o WHERE … status = 'paid')"
      - "COUNT(*) = 0 in the SELECT list without GROUP BY"
      - "LIMIT 0"
    answer: 1
    explanation: "Anti-join / NOT EXISTS keeps customer grain."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

True-zero warmup: joins and set logic before windows and incrementals. Guest-friendly — copy the snippets into any warehouse worksheet.

### Seed demo (5 rows)

These five rows are a slice of `aurora_orders` in the local lab — the same seed the Practice editor runs. No second dataset.

| order_id | customer_id | order_date | status | amount | promo_code |
|----------|-------------|------------|--------|--------|------------|
| 1001 | 1 | 2026-09-01 | paid | 42.50 | FALL26 |
| 1002 | 2 | 2026-09-01 | paid | 18.00 | NULL |
| 1003 | 1 | 2026-09-02 | pending | 99.00 | FALL26 |
| 1004 | 3 | 2026-09-02 | cancelled | 12.00 | WIN25 |
| 1005 | 2 | 2026-09-03 | paid | 64.25 | VIP |

```sql
SELECT order_id, customer_id, order_date, status, amount, promo_code
FROM aurora_orders
ORDER BY order_id
LIMIT 5;
```

## Join menu (when to use)

| Join | Keeps | Use when |
|------|--------|----------|
| `INNER` | Matches only | Both sides must exist (paid order + known customer) |
| `LEFT` | All left rows | Facts must survive a missing dim |
| `RIGHT` | All right rows | Rare in DE — flip the FROM so the preserved grain is on the left |
| `FULL` | All rows from both | Reconcile two extracts; unmatched keys are a metric |
| `SELF` | A table joined to itself | Hierarchy / previous-row without a window (prefer `LAG` when you can) |
| `ANTI` (`NOT EXISTS`) | Left rows with no match | Late keys, orphans, “not yet in mart” |
| `SEMI` (`EXISTS`) | Left rows with a match | Filter without adding columns |

Never join two facts at different grains without aggregating first — that is how revenue doubles.

`RIGHT JOIN` is the same as a LEFT with the tables swapped — reviewers prefer the preserved grain on the left. `FULL OUTER JOIN` is for reconcile jobs (lab sample: items × `SKU-LANE`). A **self-join** (`FROM aurora_customers a JOIN aurora_customers b ON …`) is how you compare a row to another row in the same table; windows are usually clearer for “previous paid order.”

The **local practice lab** on this page runs `aurora_*` samples (DuckDB in the browser — not a live warehouse).

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

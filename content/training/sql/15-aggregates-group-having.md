---
slug: sql-aggregates-group-having
track: sql
title: "Aggregates, GROUP BY, and HAVING"
description: "COUNT / SUM / AVG / MIN / MAX at a named grain. WHERE filters rows; HAVING filters groups. Never aggregate after a fan-out join."
level: beginner
order: -5
durationMinutes: 25
topics: [sql]
objectives:
  - "Pick COUNT(*), COUNT(col), SUM, AVG, MIN, and MAX for a commerce question"
  - "GROUP BY the grain of the answer, then HAVING for group-level thresholds"
  - "Refuse to SUM(order.amount) after joining aurora_order_items"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Paid revenue by region"
    code: "SELECT c.region,\n       COUNT(*) AS paid_orders,\n       ROUND(SUM(o.amount), 2) AS revenue,\n       ROUND(AVG(o.amount), 2) AS avg_ticket,\n       MIN(o.order_date) AS first_paid,\n       MAX(o.order_date) AS last_paid\nFROM aurora_orders o\nJOIN aurora_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.region\nORDER BY revenue DESC;"
    note: "WHERE drops cancelled/pending before the group. Grain = one row per region."
  - label: "HAVING: regions over a floor"
    code: "SELECT c.region, ROUND(SUM(o.amount), 2) AS revenue\nFROM aurora_orders o\nJOIN aurora_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.region\nHAVING SUM(o.amount) >= 20\nORDER BY revenue DESC;"
    note: "HAVING sees aggregates. You cannot put SUM(amount) >= 20 in WHERE."
  - label: "Item-grain spend (safe SUM)"
    code: "SELECT p.category, ROUND(SUM(i.qty * i.unit_price), 2) AS item_spend\nFROM aurora_order_items i\nJOIN aurora_products p ON p.sku = i.sku\nGROUP BY p.category\nORDER BY item_spend DESC;"
    note: "Sum a column that lives at item grain. Do not join items then SUM(aurora_orders.amount)."
  - label: "SKU mix (item grain)"
    code: "SELECT p.product_name, SUM(i.qty * i.unit_price) AS ext_amount\nFROM aurora_order_items i\nJOIN aurora_products p ON p.sku = i.sku\nGROUP BY p.product_name;"
    note: "Never SUM(order.amount) after joining items."
quiz:
  - question: "COUNT(*) vs COUNT(promo_code) on aurora_orders?"
    options:
      - "They always match"
      - "COUNT(*) is rows; COUNT(promo_code) skips NULL promos"
      - "COUNT(promo_code) counts distinct codes only"
      - "COUNT(*) ignores cancelled rows"
    answer: 1
    explanation: "COUNT(col) skips NULLs. DISTINCT is a separate keyword. Status filters belong in WHERE."
  - question: "A reviewer asks for regions whose paid revenue is at least 20. Where does that threshold go?"
    options:
      - "WHERE SUM(amount) >= 20"
      - "HAVING SUM(amount) >= 20 after GROUP BY region"
      - "LIMIT 20"
      - "ORDER BY 20"
    answer: 1
    explanation: "WHERE cannot see group totals. HAVING filters groups after GROUP BY."
  - question: "You join aurora_order_items to aurora_orders and SUM(o.amount). What happens?"
    options:
      - "Revenue stays at order grain"
      - "Orders with multiple SKUs fan out and revenue double-counts"
      - "HAVING deletes the extras"
      - "MIN/MAX cancel the join"
    answer: 1
    explanation: "Many-side joins multiply fact rows. Aggregate items first, or sum qty * unit_price."
  - question: "HAVING SUM(amount) >= 20 filters…"
    options:
      - "Rows before the group"
      - "Groups after aggregation"
      - "NULLs out of COUNT(*)"
      - "The catalog name"
    answer: 1
    explanation: "WHERE is rows. HAVING is groups. Do not put status = 'paid' only in HAVING if it is a row filter."
  - question: "You joined aurora_order_items then SUM(o.amount). The revenue is wrong because…"
    options:
      - "SUM cannot take a column"
      - "Order amount repeats once per item — you fan out the grain"
      - "DuckDB forbids joins"
      - "amount is always NULL"
    answer: 1
    explanation: "Item grain needs qty * unit_price. Order grain stays on aurora_orders."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Aggregates answer **one grain**. Say it out loud: one row per region, per day, per SKU — then `GROUP BY` those keys.

## The five you actually use

| Fn | Meaning on `aurora_orders` |
|----|----------------------------|
| `COUNT(*)` | Rows that survived WHERE |
| `COUNT(promo_code)` | Rows with a non-NULL promo |
| `SUM(amount)` | Additive measure at **this** grain |
| `AVG(amount)` | Mean of non-NULL amounts |
| `MIN` / `MAX` | Edges (dates, amounts, ids) |

`COUNT(DISTINCT customer_id)` is a different question (unique buyers). Do not DISTINCT the whole row as a shortcut for uniqueness — that belongs in a DQ gate.

## WHERE then GROUP BY then HAVING

```sql
-- Dialect: ANSI
SELECT c.region, COUNT(*) AS paid_orders, ROUND(SUM(o.amount), 2) AS revenue
FROM aurora_orders o
JOIN aurora_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'          -- row filter
GROUP BY c.region                -- grain
HAVING SUM(o.amount) >= 20       -- group filter
ORDER BY revenue DESC;
```

Run this in the **local practice lab** on this page. Change the HAVING floor and watch groups disappear — the underlying orders do not.

## Fan-out

`aurora_order_items` is one row per `order_id + sku`. Join it to `aurora_orders` and `SUM(o.amount)` repeats the ticket once per SKU. Sum `qty * unit_price`, or aggregate items in a CTE first.

## Exercises

1. Paid revenue, order count, and average ticket by `aurora_customers.region`.
2. Keep only regions with `SUM(amount) >= 20`.
3. Category spend from `aurora_order_items` × `aurora_products` — prove you did not sum `aurora_orders.amount`.

---
slug: sf-aggregates-group-having
track: snowflake
title: "Aggregates, GROUP BY, HAVING for marts"
description: "COUNT / SUM / AVG at a named mart grain. WHERE filters SAMPLE rows; HAVING filters groups. Dynamic Tables are this SELECT plus a lag — not a different language."
level: beginner
order: -5
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Build a daily revenue grain with GROUP BY date and region"
  - "Use HAVING for group-level floors BI can trust"
  - "Refuse to SUM(order.amount) after joining a many-side items table"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Daily revenue mart"
    code: "SELECT o.order_date, c.region, COUNT(*) AS orders, ROUND(SUM(o.amount), 2) AS revenue\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nGROUP BY o.order_date, c.region\nORDER BY o.order_date, c.region;"
    note: "Dynamic Table / mart-shaped grain — still just a local SELECT. Run it in the practice lab."
  - label: "HAVING: regions over a floor"
    code: "SELECT c.region, COUNT(*) AS paid_orders, ROUND(SUM(o.amount), 2) AS revenue\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.region\nHAVING SUM(o.amount) >= 20\nORDER BY revenue DESC;"
    note: "WHERE filters rows before the group. HAVING filters groups."
  - label: "COUNT vs COUNT(col)"
    code: "SELECT\n  COUNT(*) AS order_cnt,\n  COUNT(promo_code) AS promo_present,\n  ROUND(AVG(amount), 2) AS avg_ticket,\n  MIN(order_date) AS first_dt,\n  MAX(order_date) AS last_dt\nFROM sf_orders\nWHERE status = 'paid';"
    note: "COUNT(promo_code) skips NULLs. AVG/MIN/MAX skip NULLs too — they do not invent zeros."
quiz:
  - question: "COUNT(*) vs COUNT(promo_code) on sf_orders?"
    options:
      - "They always match"
      - "COUNT(*) is rows; COUNT(promo_code) skips NULL promos"
      - "COUNT(promo_code) counts distinct codes only"
      - "COUNT(*) ignores pending rows"
    answer: 1
    explanation: "COUNT(col) skips NULLs. DISTINCT is a separate keyword. Status filters belong in WHERE."
  - question: "A reviewer asks for regions whose paid revenue is at least 20. Where does that threshold go?"
    options:
      - "WHERE SUM(amount) >= 20"
      - "HAVING SUM(amount) >= 20 after GROUP BY region"
      - "LIMIT 20"
      - "CLUSTER BY 20"
    answer: 1
    explanation: "WHERE cannot see group totals. HAVING filters groups after GROUP BY. Clustering is layout."
  - question: "A Dynamic Table that is this GROUP BY plus TARGET_LAG is…"
    options:
      - "A different SQL dialect"
      - "The same grain, refreshed by Snowflake — still prove uniqueness and NULLs"
      - "A stored procedure"
      - "A virtual warehouse"
    answer: 1
    explanation: "DTs are declared SELECTs. The grain and DQ rules do not go away because the refresh is managed."
  - question: "HAVING SUM(amount) >= 20 on SAMPLE paid revenue…"
    options:
      - "Filters rows before GROUP BY"
      - "Filters groups after SUM — put status = 'paid' in WHERE"
      - "Creates a Dynamic Table"
      - "Suspends the warehouse"
    answer: 1
    explanation: "WHERE then GROUP then HAVING."
  - question: "Joining sf_line_items then SUM(o.amount) is wrong because…"
    options:
      - "amount is not a column"
      - "Line items fan out the order — sum qty * unit_price at item grain"
      - "JOIN is banned"
      - "SAMPLE cannot join"
    answer: 1
    explanation: "Wave A1 line items exist so you can practice this."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Marts are **named grains**. The **local practice lab** already has SAMPLE orders × customers — write the `GROUP BY` here, then wrap it as a Dynamic Table in an account.

## WHERE then GROUP BY then HAVING

```sql
SELECT c.region,
       COUNT(*) AS paid_orders,
       ROUND(SUM(o.amount), 2) AS revenue
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.region
HAVING SUM(o.amount) >= 20;
```

Serve the mart on a BI warehouse (`bi_wh`). Build it on `etl_wh`. Same habit as the [architecture](/training/snowflake/sf-architecture) lesson.

## Exercises

1. Rebuild the daily revenue sample and compare west vs east.
2. Add `HAVING COUNT(*) >= 2` and name which date/region pairs drop.
3. Write one sentence on why a Dynamic Table is not an excuse to skip a uniqueness gate.

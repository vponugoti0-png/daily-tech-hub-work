---
slug: sf-dynamic-tables
track: snowflake
title: "Dynamic Tables declarative pipelines"
description: "TARGET_LAG, refresh modes, and when Dynamic Tables beat hand-rolled tasks."
level: advanced
order: 4
durationMinutes: 40
topics: [snowflake, sql]
objectives:
  - "Declare Dynamic Tables with lag targets"
  - "Understand incremental vs full refresh"
  - "Monitor freshness"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Daily mart grain"
    code: "SELECT o.order_date, c.region, COUNT(*) AS orders, ROUND(SUM(o.amount), 2) AS revenue\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nGROUP BY o.order_date, c.region\nORDER BY o.order_date, c.region;"
    note: "Mart-shaped SELECT you can run in the local practice lab."
  - label: "Paid SAMPLE peek"
    code: "SELECT o.order_id, c.region, o.status, o.amount\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nORDER BY o.amount DESC;"
    note: "The Dynamic Table persists a grain. This SELECT is the idea — not CREATE DYNAMIC TABLE."
  - label: "Regions over a floor"
    code: "SELECT c.region, COUNT(*) AS paid_orders, ROUND(SUM(o.amount), 2) AS revenue\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.region\nHAVING SUM(o.amount) >= 20\nORDER BY revenue DESC;"
    note: "HAVING is the freshness check you can read. TARGET_LAG lives in the account."
quiz:
  - question: "TARGET_LAG expresses…"
    options:
      - "Max acceptable staleness for the dynamic table"
      - "Warehouse size"
      - "Password rotation"
      - "UI density"
    answer: 0
  - question: "A Dynamic Table persists…"
    options:
      - "A worksheet history"
      - "A named grain that refreshes from upstream — not a view that re-reads bronze every dashboard click"
      - "The warehouse size"
      - "A PAT"
    answer: 1
    explanation: "Views do not persist. DTs do (with lag you name)."
  - question: "TARGET_LAG is a…"
    options:
      - "Secret"
      - "Freshness contract — tighter lag costs more refreshes"
      - "Clone name"
      - "Stream offset you never consume"
    answer: 1
    explanation: "Cost vs freshness. Do not set 1 minute because it sounds nice."
  - question: "The lab’s sf_daily_mart sample is a SELECT because…"
    options:
      - "Dynamic Tables are illegal"
      - "This engine will not CREATE DYNAMIC TABLE — practice the grain, copy the DDL"
      - "SELECT cannot GROUP BY"
      - "Warehouses cannot run SQL"
    answer: 1
    explanation: "Honest stand-in."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Dynamic Tables declarative pipelines

```sql
CREATE OR REPLACE DYNAMIC TABLE mart.orders_daily
  TARGET_LAG = '15 minutes'
  WAREHOUSE = etl_wh
AS
SELECT date_trunc('day', ordered_at) d, SUM(amount) AS revenue
FROM analytics.orders
GROUP BY 1;
```

## Exercises

1. Compare Tasks+Streams vs Dynamic Tables for a simple aggregate mart.
2. Pick a TARGET_LAG for near-real-time ops vs hourly finance.

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

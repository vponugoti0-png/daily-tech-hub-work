---
slug: dbx-sql-warehouses
track: databricks
title: "Databricks SQL warehouses & serving"
description: "Serving gold tables to BI, serverless SQL cost controls, and query history habits."
level: intermediate
order: 7
durationMinutes: 30
topics: [databricks, sql]
objectives:
  - "Pick warehouse sizes thoughtfully"
  - "Use query history for tuning"
  - "Separate ETL compute from BI serving"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Serve gold"
    code: "SELECT order_date, region, orders, revenue\nFROM gold_daily_orders\nORDER BY order_date, region;"
    note: "BI-shaped read against gold — run it in the local practice lab."
  - label: "Busy regions (HAVING)"
    code: "SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount\nFROM silver_orders\nWHERE status = 'ok'\nGROUP BY region\nHAVING SUM(amount) >= 40\nORDER BY amount DESC;"
    note: "Dashboards read a persisted grain. This SELECT shows the shape — keep ETL off the warehouse."
  - label: "Date window on gold"
    code: "SELECT order_date, region, orders, revenue\nFROM gold_daily_orders\nWHERE order_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-03'\nORDER BY order_date, region;"
    note: "BI filters on the mart date column. Do not join bronze for a dashboard."
quiz:
  - question: "Running heavy ETL on the same small SQL warehouse as BI often…"
    options:
      - "Improves SLAs"
      - "Contends for resources and hurts dashboards"
      - "Deletes Delta logs"
      - "Disables Photon"
    answer: 1
---

# Databricks SQL warehouses & serving

Serve **gold** curated tables. Monitor spill and queueing in query history. Apply cost controls / budgets.

## Exercise

Draft a policy: which workloads use Jobs clusters vs SQL warehouses.

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

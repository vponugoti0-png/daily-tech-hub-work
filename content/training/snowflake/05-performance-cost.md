---
slug: sf-performance-cost
track: snowflake
title: "Performance & cost control"
description: "Clustering, search optimization, warehouse sizing, and query profile literacy."
level: advanced
order: 5
durationMinutes: 45
topics: [snowflake, sql]
objectives:
  - "Read query profiles for pruning and spilling"
  - "Apply clustering thoughtfully"
  - "Control auto-suspend and multi-cluster"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Auto suspend"
    code: "ALTER WAREHOUSE etl SET AUTO_SUSPEND = 60;"
    note: "Idle credits are the usual leak. Copy into an account — this DDL is not the local lab."
  - label: "Clustering"
    code: "ALTER TABLE t CLUSTER BY (event_date, account_id);"
    note: "Cluster on the filter you actually use."
  - label: "Date filter (pruning habit)"
    code: "SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount\nFROM (\n  SELECT o.amount, o.order_date, c.region\n  FROM sf_orders o\n  JOIN sf_customers c ON c.customer_id = o.customer_id\n) t\nWHERE order_date >= DATE '2026-09-02'\nGROUP BY region\nORDER BY n DESC;"
    note: "Filter early — same habit as reading a Snowflake query profile. Run in the local lab."
quiz:
  - question: "Leaving a large warehouse running idle primarily wastes…"
    options:
      - "Credits"
      - "Time Travel history only"
      - "UI themes"
      - "Stages"
    answer: 0
  - question: "Prune with a date filter early so that…"
    options:
      - "The profile shows less scanned — credits follow bytes scanned and warehouse time"
      - "Time Travel turns off"
      - "RBAC is bypassed"
      - "AUTO_SUSPEND is ignored"
    answer: 0
    explanation: "The prune-filter sample is the habit. Read a query profile in a real account."
  - question: "Spilling / a too-small warehouse is a signal to…"
    options:
      - "Always jump to 3XL"
      - "Filter/project first, then size — do not buy compute to hide a SELECT *"
      - "Disable clustering"
      - "Paste the query into a public chat with results"
    answer: 1
    explanation: "Cost control is SQL shape, then size."
  - question: "Keep ETL off bi_wh because…"
    options:
      - "BI warehouses cannot SELECT"
      - "Dashboards and MERGE should not fight for the same credits"
      - "etl_wh cannot MERGE"
      - "Suspend deletes gold"
    answer: 1
    explanation: "The seed’s two warehouses exist for this sentence."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Performance & cost control

- Right-size warehouses; enable auto-suspend.
- Cluster large filtered tables on common predicates.
- Avoid SELECT * in scheduled jobs.
- Spillage in profiles → increase warehouse or reduce data width.

## Exercises

1. Propose clustering keys for a 5B-row event table queried by day+account.
2. List 3 cost guardrails for a shared account.

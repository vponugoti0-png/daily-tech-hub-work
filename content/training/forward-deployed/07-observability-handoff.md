---
slug: "fde-observability-handoff"
track: "forward-deployed"
title: "Observability and on-call handoff"
description: "Freshness, rows, credits, failed tasks — metrics and a runbook their on-call can use without you."
level: "intermediate"
order: 7
durationMinutes: 45
topics: [general, snowflake, databricks]
objectives:
  - "Name the handoff metrics: freshness, volume, cost, failure"
  - "Write a runbook that starts with their UI, not 'call the vendor'"
  - "Refuse a go-live that still pages only the FDE"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Handoff metric card"
    code: "freshness: MAX(updated_at) vs SLO (e.g. 2h)\nvolume:    rows_in / rows_out / rows_rejected\ncost:      warehouse credits or Job DBU for this job only\nfailure:   Task/Job state + last error class\nowner:     #data-oncall — not the FDE after handoff"
    note: "If a metric has no owner, it is decoration."
  - label: "Runbook first five"
    code: "1. Open Job/Task run — failed or just slow?\n2. Check MAX(event_date) on gold vs SLO\n3. Check warehouse/cluster: suspended, queued, oversized?\n4. Re-run from last good watermark (do not double-append)\n5. If grants/network: ticket security; do not escalate to FDE first"
    note: "Paste into their wiki. Page vendor only after step 5."
quiz:
  - question: "A healthy handoff means the next freshness incident…"
    options:
      - "Pages only the FDE’s personal phone"
      - "Is handled by their on-call using a runbook and named metrics"
      - "Is ignored"
      - "Requires ACCOUNTADMIN"
    answer: 1
  - question: "Which set is the core FDE handoff scoreboard?"
    options:
      - "NPS and logo placement"
      - "Freshness, row counts, cost for this job, failure state"
      - "Only Spark UI screenshots in a slide"
      - "Git commit count"
    answer: 1
  - question: "Gold looks empty after a retry. What should the runbook forbid?"
    options:
      - "Checking the watermark"
      - "Blind append that duplicates the partition"
      - "Reading Task history"
      - "Looking at credits"
    answer: 1
    explanation: "Retries must be idempotent — same lesson as DE writers."
  - question: "A handoff runbook must say…"
    options:
      - "“Call the FDE forever”"
      - "How to tell gold is stale, who is paged, and the first SELECT / Job retry"
      - "The vendor’s stock price"
      - "Nothing — dashboards are enough"
    answer: 1
    explanation: "On-call without a first check is theater."
  - question: "Guest progress stepIndex after a lab run is…"
    options:
      - "A production SLA"
      - "Local practice only — customer observability is their warehouse + Job alerts"
      - "A PagerDuty integration"
      - "A live stream"
    answer: 1
    explanation: "Do not confuse the training lab with their telemetry."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Observability and on-call handoff

If they cannot **see** freshness and **act** without you, you did not deploy — you rented yourself as the pager. Handoff is a **scoreboard + runbook + named owner**.

## The four metrics

| Metric | Example | Why the on-call cares |
|--------|---------|------------------------|
| **Freshness** | `MAX(updated_at)` vs a 2h SLO | Is gold late? |
| **Volume** | rows in / out / rejected | Silent filter vs real empty day |
| **Cost** | credits or DBUs **for this Job** | Did someone leave a warehouse on? |
| **Failure** | Task/Job state + error class | Grant vs SQL vs network |

Put them where they already look: a gold `pipeline_state` table, a Databricks Job notification, a Snowflake Task history view — not a private FDE dashboard.

SQL they can steal ([data quality](/training/sql/sql-data-quality)):

```sql
SELECT
  MAX(updated_at) < DATEADD(hour, -2, CURRENT_TIMESTAMP) AS stale,
  COUNT(*) AS gold_rows
FROM prod.gold.orders_daily;
```

## Runbook shape

Start in **their** UI.

1. Failed or slow? Open the Job / Task / DT refresh.
2. Stale gold? Compare `MAX(event_date)` to the SLO.
3. Compute? Warehouse suspended, queued, or burning credits ([SF cost](/training/snowflake/sf-performance-cost), [DBX warehouses](/training/databricks/dbx-sql-warehouses)).
4. Retry **idempotently** — partition overwrite or MERGE, not blind append ([idempotent writers](/training/python/python-idempotent-writers)).
5. Grants / Private Link → their security ticket. **Then** vendor.

“Call the FDE” is step 6, not step 1. If it is step 1, delay go-live.

## What you leave behind

- Metric card (cheat sheet) in their wiki
- Who is primary / secondary this month
- How to pause the Job without deleting it
- How to roll back a bad gold publish (Time Travel, prior Job version)

Do a **shadow on-call**: they drive, you watch, one staged failure in DEV. If they cannot finish the five steps, the runbook is not done.

## Exercises

1. Write the four-metric card for a Snowflake Dynamic Table on `orders_daily`.
2. Add a sixth runbook line for “warehouse left running over the weekend.”
3. List two reasons go-live should wait if paging still hits only the FDE.

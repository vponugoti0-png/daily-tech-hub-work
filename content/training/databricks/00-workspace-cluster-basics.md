---
slug: dbx-workspace-cluster-basics
track: databricks
title: "Workspace & cluster basics"
description: "True-zero Databricks: navigate notebooks, repos, and catalogs; pick all-purpose vs jobs/serverless; three day-0 safety habits."
level: beginner
order: 0
durationMinutes: 25
topics: [databricks]
objectives:
  - "Navigate workspace notebooks, repos, and catalogs"
  - "Choose all-purpose vs jobs / serverless compute"
  - "Apply three day-0 safety habits (no shared always-on prod, pin runtime, terminate idle)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Day-0 safety checklist"
    code: "1. Explore on all-purpose; schedule on a job cluster or serverless job.\n2. Pin runtime + libraries — do not 'latest' in prod.\n3. Auto-terminate idle all-purpose (30–60 min). Never share one cluster with BI + ETL."
    note: "No live workspace on this site — copy the checklist into yours."
  - label: "Sample cluster policy stub"
    code: "{\n  \"name\": \"day0-job-policy\",\n  \"definition\": {\n    \"spark_version\": { \"type\": \"fixed\", \"value\": \"15.4.x-scala2.12\" },\n    \"node_type_id\": { \"type\": \"allowlist\", \"values\": [\"i3.xlarge\"] },\n    \"autotermination_minutes\": { \"type\": \"range\", \"maxValue\": 60 }\n  }\n}"
    note: "Policy JSON is a stub to read, not a live apply."
  - label: "Catalog objects (lab)"
    code: "SELECT catalog, schema, table_name, layer\nFROM workspace_objects\nORDER BY layer, table_name;"
    note: "Runnable in the local practice lab on this page — not a live workspace."
quiz:
  - question: "Scheduled production pipelines should primarily run on…"
    options:
      - "An always-on all-purpose cluster you share with BI"
      - "A job cluster or serverless job with versioned code"
      - "Your laptop only"
      - "A SQL warehouse named scratch"
    answer: 1
    explanation: "Job compute starts, runs the versioned task, and stops. All-purpose is for interactive work."
  - question: "A day-0 safety habit is…"
    options:
      - "Leave an all-purpose cluster on 24/7 for the team"
      - "Pin runtime/libraries and auto-terminate idle interactive compute"
      - "Use ACCOUNTADMIN on every notebook"
      - "Skip Unity Catalog and write to /tmp"
    answer: 1
    explanation: "Pin versions, terminate idle, isolate job compute. Always-on shared clusters are a cost and blast-radius smell."
---

Day-0 Databricks: where things live, and which compute you turn on. No lakehouse theory yet — that is the next lesson.

## Map the workspace

- **Workspace** — notebooks, repos, jobs, dashboards, your identity.
- **Compute** — all-purpose clusters (interactive), job clusters (scheduled), SQL warehouses (BI).
- **Unity Catalog** — `catalog.schema.table` (and volumes). This is the data plane.

A notebook path is not a table name. Saving a notebook does not publish a gold mart.

## Cluster basics

| Kind | When to use | Watch-out |
|------|-------------|-----------|
| All-purpose | Explore, debug, pair | Idle cost if you leave it running |
| Job cluster | Scheduled / CI Jobs | Pin runtime + libs; don't “click Run All” in prod |
| Serverless job / SQL | Burst-y or BI serving | Still isolate ETL from dashboard warehouses |

Autoscaling helps interactive spikes. It does **not** replace a Job definition.

## Notebook vs Job

1. Explore in a notebook on an all-purpose cluster.
2. Move the logic to a repo (or a notebook checked into Repos).
3. Schedule a **Job** with a task graph: ingest → transform → DQ.

You do not need a `/practice` simulator — copy the habits into your workspace.

## Exercises

1. List three objects you would create on day 1 (one compute, one catalog schema, one job).
2. Write a one-line policy: when an all-purpose cluster must be terminated.
3. Open the next lesson ([Lakehouse fundamentals](/training/databricks/dbx-lakehouse-fundamentals)) and map bronze/silver/gold onto `main.bronze` / `main.silver` / `main.gold`.

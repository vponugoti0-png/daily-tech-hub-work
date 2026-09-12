---
slug: dbx-workspace-cluster-basics
track: databricks
title: "Workspace & cluster basics (day-0)"
description: "True-zero Databricks: workspace objects, all-purpose vs job clusters, notebooks vs repos, and what not to click in prod."
level: beginner
order: 0
durationMinutes: 25
topics: [databricks]
objectives:
  - "Name workspace vs cluster vs catalog objects"
  - "Choose a job cluster over an all-purpose cluster for scheduled work"
  - "Know when a notebook is exploration vs a Job task"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Job cluster habit"
    code: "Use a job cluster (or serverless job) for scheduled pipelines.\nPin the runtime + libraries.\nTear down compute when the job ends."
    note: "All-purpose clusters are for interactive exploration — they idle-cost."
  - label: "Three-level name"
    code: "catalog.schema.table   -- Unity Catalog\n# workspace notebook path is not a table name"
    note: "Data lives in UC. Notebooks live in the workspace."
quiz:
  - question: "Scheduled production pipelines should primarily run on…"
    options:
      - "An always-on all-purpose cluster you share with BI"
      - "A job cluster or serverless job with versioned code"
      - "Your laptop only"
      - "A SQL warehouse named scratch"
    answer: 1
    explanation: "Job compute starts, runs the versioned task, and stops. All-purpose is for interactive work."
  - question: "What is a Databricks workspace primarily?"
    options:
      - "The object-storage bucket that holds Delta files"
      - "The UI + identity boundary for notebooks, repos, jobs, and access"
      - "A synonym for Unity Catalog"
      - "A Snowflake virtual warehouse"
    answer: 1
    explanation: "Workspace = place you work. Catalog = place data is governed. Cluster = compute."
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

---
slug: dbx-notebook-cell-types
track: databricks
title: "Notebook cell types — md, sql, python"
description: "How Databricks notebooks mix %md, %sql, and %python cells. Jobs run the repo — %sh stays a copy-only debug habit, never a lab shell."
level: beginner
order: 21
durationMinutes: 25
topics: [databricks]
objectives:
  - "Name md / sql / python cells and which ones belong on a Job"
  - "Treat %run as a composition tool, not a hidden warehouse"
  - "Keep %sh as copy-only — the local lab never runs a shell"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Cell inventory (local lab)"
    code: "SELECT cell_id, cell_type, cell_name, runs_in_job\nFROM dbx_notebook_cells\nORDER BY cell_id;"
    note: "Teaching inventory. Run this SELECT in the local lab — not a live workspace."
  - label: "Job-shaped cells"
    code: "SELECT cell_name, cell_type\nFROM dbx_notebook_cells\nWHERE runs_in_job = 1 AND cell_type <> 'sh'\nORDER BY cell_id;"
    note: "Schedule sql + python from a repo. md is docs. sh does not go on the Job."
  - label: "%sql cell (workspace)"
    code: "-- Dialect: Spark SQL (workspace notebook)\n-- %sql\nSELECT order_id, status, amount\nFROM silver.orders\nWHERE status = 'ok'\nLIMIT 5;"
    note: "Copy into a Databricks %sql cell. The local lab runs the same SELECT against DuckDB silver_orders."
quiz:
  - question: "A production Job should primarily run…"
    options:
      - "%sh cells that curl the internet"
      - "Versioned sql / python cells (or files) from a repo"
      - "Unsaved all-purpose scratch only"
      - "dbutils.secrets.get in a loop with print"
    answer: 1
    explanation: "Jobs schedule code you can review. Shell cells are a debug smell."
  - question: "This site’s local lab will run…"
    options:
      - "%sh apt-get and a real bash pipe"
      - "SELECT / WITH against local DuckDB tables (cell inventory + silver samples)"
      - "A live %run of your workspace notebook"
      - "CREATE SECRET"
    answer: 1
    explanation: "No shell. No live workspace. Inventory + read-only SQL."
  - question: "%md cells are for…"
    options:
      - "Replacing Unity Catalog grants"
      - "Human-readable context next to sql/python — they do not write gold"
      - "Mounting S3"
      - "Rotating tokens"
    answer: 1
    explanation: "Markdown does not publish a mart. Saving a notebook is not a load."
---

Notebooks mix **documentation** and **compute**. The **local practice lab** only runs `SELECT` / `WITH` against a tiny inventory of cell types plus the medallion seed. It does **not** execute `%sh`.

## Cell types (workspace)

| Magic | Role | On a Job? |
|-------|------|-----------|
| `%md` | Explain the grain | Optional docs |
| `%sql` | Spark SQL / Delta | Yes, if versioned |
| `%python` | Transforms, `spark.table` | Yes, if versioned |
| `%run` | Compose notebooks | Prefer repo imports |
| `%sh` | Laptop debug only | **No** — copy-only here |

Example you **copy** into a workspace — never run as a lab sample:

```
%sh
# Copy-only. Do not paste production tokens.
# ls /Workspace/Repos/aurora/orders_etl
```

The local lab has no shell and will refuse anything that is not `SELECT` / `WITH`.

## `%run` vs a Job

`%run ./silver_orders` is composition. A **Job** is the schedule + cluster + permissions. Do not treat `%run` as “it landed in gold.”

## Exercises

1. Query `dbx_notebook_cells` for `cell_type = 'sql'`.
2. List cells with `runs_in_job = 1` and explain why `sh` is excluded.
3. Copy a `%sql` LIMIT sample into a workspace notebook — do not look for a shell in this lab.

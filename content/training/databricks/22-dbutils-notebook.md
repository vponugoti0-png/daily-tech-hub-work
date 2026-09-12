---
slug: dbx-dbutils-notebook
track: databricks
title: "dbutils — widgets, fs, notebooks (secrets copy-only)"
description: "Educational dbutils: widgets as job parameters, fs/notebooks as workspace tools. Secrets stay copy-only — no real scopes, no lab shell."
level: intermediate
order: 22
durationMinutes: 25
topics: [databricks]
objectives:
  - "Treat widgets as named job parameters you can preview as a table"
  - "Know dbutils.fs / notebook.run are workspace APIs — not this lab"
  - "Never put a real secret scope in a prompt, repo, or this site"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Job params (local stand-in)"
    code: "SELECT job_name, param_name, param_value\nFROM dbx_job_params\nORDER BY param_name;"
    note: "DuckDB stand-in for widgets. Run here. Copy widget code into a workspace."
  - label: "Date window from params"
    code: "SELECT param_name, param_value\nFROM dbx_job_params\nWHERE param_name IN ('start_date', 'end_date')\nORDER BY param_name;"
    note: "Jobs pass start/end. The lab still only SELECTs the stand-in table."
  - label: "Partition-style filter"
    code: "SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount\nFROM silver_orders\nWHERE order_date >= DATE '2026-09-02'\nGROUP BY region\nORDER BY n DESC;"
    note: "Use widget dates in a workspace WHERE. Here the date is a literal."
quiz:
  - question: "dbutils.widgets.get is closest to…"
    options:
      - "A secret manager for production passwords"
      - "Reading a named job parameter (start_date, env)"
      - "ATTACH a remote catalog from this site"
      - "%sh"
    answer: 1
    explanation: "Widgets are parameters. Secrets are a different API — copy-only below."
  - question: "This local lab will run dbutils.secrets.get…"
    options:
      - "Against your real Databricks scope"
      - "Never — secrets examples are copy-only and we do not create scopes"
      - "If you type %sh"
      - "Via Pyodide urllib"
    answer: 1
    explanation: "No scopes, no tokens, no shell. Copy the pattern into a workspace that already has a secret backend."
  - question: "A Job should get start/end from…"
    options:
      - "A hardcoded notebook cell you forget to edit"
      - "Widgets / Job parameters you can see in the run"
      - "A password in chat"
      - "dbutils.fs.mount of a personal laptop"
    answer: 1
    explanation: "Parameters make retries obvious. Mounts and secrets are a different review."
---

**dbutils** is a Databricks workspace helper. The **local practice lab** only has a `dbx_job_params` stand-in plus silver samples. There is **no** live `dbutils` object here.

## Widgets ≈ parameters

In a workspace:

```python
# Copy-only — workspace Python
dbutils.widgets.text("start_date", "2026-09-01")
start = dbutils.widgets.get("start_date")
```

Here, query `dbx_job_params`. Same idea: named values, not hidden cells.

## fs and notebook.run

```python
# Copy-only — workspace
# dbutils.fs.ls("dbfs:/Volumes/main/landing/orders")
# dbutils.notebook.run("./dq_orders", timeout_seconds=300, arguments={"start_date": start})
```

Those APIs need a workspace. This lab will not list DBFS or run a child notebook.

## Secrets — copy-only, never a real scope

```python
# Copy-only. Do not invent a scope name from this site.
# token = dbutils.secrets.get(scope="your-existing-scope", key="orders-api")
# Never print(token). Never commit the value.
```

We do **not** create scopes. We do **not** put tokens in the seed. `%sh` that prints `env` is also copy-only — the lab has no shell.

## Exercises

1. SELECT start/end from `dbx_job_params`.
2. Rewrite a hardcoded `DATE '2026-09-02'` filter as “widget start_date” in a comment, then run the literal in the lab.
3. Write a two-line rule: when a value is a widget vs when it must be a secret.

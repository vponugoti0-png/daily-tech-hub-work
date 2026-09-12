---
slug: dbx-jobs-workflows
track: databricks
title: "Jobs, workflows, and deployment"
description: "Task graphs, clusters vs serverless, retries, and CI-deployed job definitions."
level: intermediate
order: 5
durationMinutes: 35
topics: [databricks]
objectives:
  - "Model multi-task jobs"
  - "Configure retries and timeouts"
  - "Promote jobs via code, not clicks alone"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Job-shaped run"
    code: "# Job task (educational copy)\n# - cluster: job cluster, not all-purpose\n# - entry: repo SQL/Python, not an unsaved notebook\n# - on-call: owner + alerts\n# Never: %sh with a PAT in the cell"
    note: "Secrets stay in a secret scope. %sh is not your secret manager."
quiz:
  - question: "Production pipelines should primarily run as…"
    options:
      - "Manual notebook clicks"
      - "Scheduled Jobs/Workflows with versioned code"
      - "Untracked scratch clusters only"
      - "Local laptops only"
    answer: 1
  - question: "A production workflow should be triggered by…"
    options:
      - "Whoever remembers to click Run All"
      - "A scheduled Job with an owner, retries, and alerts"
      - "A Slack emoji"
      - "%sh cron on the driver"
    answer: 1
    explanation: "Jobs have owners. Notebooks have memories."
  - question: "Putting a PAT in a %sh cell is…"
    options:
      - "Required for Spark SQL"
      - "Educational-only as a “never do this” — use a secret scope"
      - "Safer than env inject"
      - "How Unity Catalog authenticates tables"
    answer: 1
    explanation: "If you touch DBX secrets, keep %sh as a warning, not a recipe."
  - question: "Retries on a Job should be safe because…"
    options:
      - "Spark retries delete gold"
      - "Writes are idempotent (MERGE / partition replace)"
      - "Retries never happen"
      - "You use append-only with no key"
    answer: 1
    explanation: "The same incremental rule as Python/SQL."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Jobs, workflows, and deployment

Multi-task jobs: ingest → transform → DQ → publish. Fail fast on DQ.

Use job clusters or serverless SQL/warehouses appropriately; pin library versions.

## Exercises

1. Design a 4-task DAG with a DQ gate before gold publish.
2. List parameters you'd pass for a backfill.

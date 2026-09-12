---
slug: "fde-deploy-environments"
track: "forward-deployed"
title: "Deploy and environments"
description: "CI/CD, containers, and config/secrets as concepts — plus cheat sheets you can paste into a ticket."
level: "intermediate"
order: 5
durationMinutes: 50
topics: [general, python, databricks]
objectives:
  - "Separate DEV / staging / prod catalogs from 'it worked on my laptop'"
  - "Describe a CI path that promotes versioned Jobs or SQL, not notebook clicks"
  - "Keep secrets out of git and config names in the repo"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Environment map"
    code: "dev:     catalog/schema clone or UC catalog 'dev'\nstaging: same DDL, masked PII, prod-like network\nprod:    transformer SP only; no FDE user\npromote: git SHA → CI → deploy bundle / SQL — never copy-paste notebooks"
    note: "If staging is 'prod with extra hope,' you do not have staging."
  - label: "CI sketch (GitHub Actions-shaped)"
    code: "on: push\njobs:\n  deploy-dev:\n    # their runner or OIDC to their cloud\n    steps:\n      - run: pytest -q\n      - run: databricks bundle deploy -t dev\n  # prod: workflow_dispatch + required reviewers"
    note: "Conceptual. They wire OIDC. No live deploy button on Aurora."
  - label: "Config vs secrets"
    code: "OK in git: WAREHOUSE_NAME, CATALOG, TARGET_LAG, DRY_RUN\nNever in git: password, PAT, private key, customer emails\nInject: secret manager → env → Settings model"
    note: "Same rule as the Python config lesson."
quiz:
  - question: "Production pipelines should be promoted by…"
    options:
      - "Copy-pasting a notebook after a laptop demo"
      - "Versioned code through CI into their DEV then prod target"
      - "Emailing a ZIP of secrets"
      - "Granting the FDE ACCOUNTADMIN"
    answer: 1
  - question: "A useful staging environment for warehouse work is…"
    options:
      - "The FDE’s laptop only"
      - "Same DDL and network shape as prod, with masked or synthetic PII"
      - "Prod, but we are careful"
      - "A public demo tenant with their real customers"
    answer: 1
  - question: "Where do warehouse passwords belong?"
    options:
      - "In the repo README"
      - "Hardcoded in the Job notebook"
      - "Secret manager / CI secrets injected at runtime"
      - "The kickoff slide footer"
    answer: 2
    explanation: "Names in git, values in a manager — same habit as Python for DEs."
---

# Deploy and environments

An FDE deploy is **not** “run this notebook while I share my screen.” It is a **versioned artifact** that their CI can promote into **DEV → staging → prod**, with secrets they own.

This lesson is conceptual + copy cards. Aurora does **not** ship a live cloud deploy button. Practice the words and the checklist; run commands in *their* CLI.

## Three environments (warehouse names)

| Env | Typical object | What you prove |
|-----|----------------|----------------|
| **DEV** | `dev` catalog, or a [zero-copy clone](/training/snowflake/sf-zero-copy-clone-dev) | SQL and Job graph work |
| **Staging** | Same DDL, masked/synthetic PII, prod-like Private Link | Grants + network + schedule |
| **Prod** | `prod.gold` + transformer SP | Operator can run the runbook without you |

Laptop success is not an environment. “Prod but we are careful” is not staging.

## CI/CD, not clicks

Customer-shaped pattern:

1. Code lives in **their** git (or a repo they can fork). Pin a SHA.
2. CI runs tests ([Python testing](/training/python/python-testing-spark-logic), SQL DQ checks).
3. Deploy **DEV** automatically on the main integration branch.
4. Deploy **prod** with a human approval + change window.

On Databricks that often looks like **Asset Bundles** / versioned Job JSON. On Snowflake: Git-integrated worksheets, Tasks as code, or a runner that applies SQL. The product name matters less than **no untracked notebook as source of truth** ([Jobs & workflows](/training/databricks/dbx-jobs-workflows)).

Containers show up when you have a sidecar (webhook worker, eval runner). Same rules: image from CI, config from env, no secrets in the image.

## Config vs secrets

Repeat until it is boring ([config & secrets](/training/python/python-config-and-secrets)):

```python
# Names only — values from env
class Settings:
    catalog: str          # DEV vs prod
    warehouse: str
    dry_run: bool
```

- `DRY_RUN=1` in DEV while you rehearse MERGE
- Fail startup if required env is missing
- Rotate by changing the secret store, not a commit

## What you hand them

A folder, not a hero demo:

- Bundle / SQL + pin file
- Env matrix (catalog, warehouse, lag, dry-run)
- Who approves prod
- How to roll back (previous Job version, Time Travel, clone)

Rollback is part of deploy. If you cannot say it, you are not ready.

## Exercises

1. Draw DEV / staging / prod object names for Northwind on Snowflake (DB.SCHEMA) or Databricks (catalog.schema).
2. List four values that differ by env and two that must never be in git.
3. Write the one-sentence prod approval rule you would put in their GitHub environment.

---
slug: git-branching-dbt-sql
track: git
title: "Branching for dbt/SQL repos"
description: "Branch naming, one-model-per-PR habits, and how to keep dbt/SQL reviews small when silver and gold change together."
level: intermediate
order: 4
durationMinutes: 25
topics: [git, sql]
objectives:
  - "Name branches from the mart or model, not from 'fix'"
  - "Keep staging/silver/gold changes reviewable"
  - "Avoid long-lived shared branches for dbt develop"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Branch from main"
    code: "git fetch origin\ngit checkout main\ngit pull\ngit checkout -b feat/orders-daily-late-events"
    note: "Name the grain or model. feat/ + scope beats fix2-final. Play it in Git Play Lab."
  - label: "Small PR slice"
    code: "# one story per branch\nmodels/silver/orders.sql\nmodels/gold/orders_daily.sql\ntests/assert_unique_order_id.sql"
    note: "If you must touch 20 models, split landing vs mart."
quiz:
  - question: "A good branch name for the shared capstone looks like…"
    options:
      - "fix"
      - "feat/orders-daily-late-events"
      - "main"
      - "temp-asdf"
    answer: 1
    explanation: "Scope in the name. Reviewers see the mart story before the diff."
  - question: "Long-lived shared develop branches for dbt usually hurt because…"
    options:
      - "They make CI faster"
      - "They accumulate unrelated model drift and painful merges"
      - "They disable tests"
      - "They replace Warehouse RBAC"
    answer: 1
    explanation: "Short-lived branches off main. Merge when the mart slice is reviewable."
  - question: "A long-lived personal branch on a dbt repo is risky because…"
    options:
      - "dbt cannot run on branches"
      - "Refs and macros drift from main — rebase/merge often, keep PRs small"
      - "SQL cannot be in git"
      - "Play Lab rewrites GitHub"
    answer: 1
    explanation: "Small PRs. Fresh main."
  - question: "Why keep marts and a one-off scratch query on different branches/PRs?"
    options:
      - "Git allows only one .sql file"
      - "Reviewers can see the contract change without a pile of notebook leftovers"
      - "Scratch SQL is illegal"
      - "dbt forbids refs"
    answer: 1
    explanation: "Branch purpose = review purpose."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Analytics repos (dbt, SQLX, warehouse SQL) fail reviews when the branch is a junk drawer. The **Git Play Lab** on this page starts on the story-branch level — one late-events grain, then remotes if you keep playing.

## Defaults

- Branch off `main` (or the repo's protected default).
- One **story** per branch — e.g. late events + `orders_daily`, not “all of silver.”
- Rebase your **personal** branch ([rebase vs merge](/training/git/git-rebase-vs-merge)); do not rebase shared integration branches.
- Open the PR before the model count hits “I can't remember why this CTE exists.”

```bash
git fetch origin
git checkout main
git pull
git checkout -b feat/orders-daily-late-events
```

## What belongs together

| Together on one branch | Split |
|------------------------|-------|
| Silver MERGE + gold grain that depends on it | Unrelated dim refactor |
| Test for unique `order_id` + the model | Yarn lock / formatter drive-bys |
| Docs for the new grain | Warehouse grants (usually infra PR) |

## dbt-shaped tips

- `schema.yml` tests travel with the model.
- Prefer `ref()` changes that reviewers can mentally execute.
- Don't commit `target/` or local `logs/`.

## Exercises

1. Name three branches for: Autoloader bronze only; SCD2 customers; `orders_daily` late-data.
2. Explain why `feat/everything-q3` is hard to revert.
3. Pair with [PR templates for data diffs](/training/git/git-pr-templates-data-diffs).

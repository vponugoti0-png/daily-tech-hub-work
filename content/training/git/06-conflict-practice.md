---
slug: git-conflict-practice
track: git
title: "Conflict practice for dbt/SQL branches"
description: "How analytics repos should resolve MERGE/rebase conflicts: keep the grain, keep the test, never commit conflict markers. Practice the graph in Git Play Lab."
level: beginner
order: 6
durationMinutes: 20
topics: [git]
objectives:
  - "Recognize conflict markers as unfinished work"
  - "Prefer rerunning the transform over blindly keeping both mart grains"
  - "Use Git Play Lab for the graph — no GitHub push"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "See the conflict"
    code: "git status\ngit diff"
    note: "Play the graph in Git Play Lab. Do not push markers to main."
  - label: "Conflict markers are not SQL"
    code: "<<<<<<< HEAD\nSELECT order_id, amount FROM silver_orders\n=======\nSELECT order_id, region, amount FROM silver_orders\n>>>>>>> feat/region"
    note: "Pick one grain or rewrite. Never commit the <<<<<<< lines."
  - label: "Continue after a resolve"
    code: "git add models/silver_orders.sql\ngit rebase --continue"
    note: "Personal rebase only. Shared release branches merge instead."
quiz:
  - question: "A committed <<<<<<< HEAD block in a dbt model is…"
    options:
      - "A cute SQL dialect"
      - "Broken SQL that can fail the Job or silently change grain"
      - "Required for Unity Catalog"
      - "A Databricks %sh feature"
    answer: 1
    explanation: "Markers are unfinished merge work. Tests should catch them."
  - question: "Two PRs both add a column to silver_orders. Best resolve?"
    options:
      - "Keep both files concatenated with markers"
      - "Rewrite one SELECT that names the grain and both columns, then test"
      - "Force-push main"
      - "Delete the warehouse"
    answer: 1
    explanation: "Conflicts are a design question. Rerun the transform."
  - question: "Git Play Lab on this page…"
    options:
      - "Pushes to GitHub for you"
      - "Lets you practice the commit graph in-browser — no practice VM"
      - "Runs %sh merge"
      - "Stores warehouse passwords"
    answer: 1
    explanation: "In-browser graph + CLI. No remote."
---

Conflicts on **dbt/SQL** branches are usually grain fights. Practice the graph in **Git Play Lab** (`#lab`). No practice VM. No GitHub push.

## Markers

```
<<<<<<< HEAD
=======
>>>>>>> feat/region
```

Those lines are not ANSI SQL. A CI grep for `^<<<<<<<` is a cheap gate.

## Exercises

1. In Git Play Lab, create a branch, commit, and merge/rebase until you see the graph change.
2. Write a one-line CI grep that fails on conflict markers.
3. Explain why “accept both” can duplicate a `GROUP BY` grain.

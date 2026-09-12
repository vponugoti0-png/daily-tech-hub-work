---
slug: git-bisect-and-blame
track: git
title: Bisect & blame for broken pipelines
description: Find the commit that broke a metric or model using bisect and blame.
level: intermediate
order: 3
durationMinutes: 25
topics: [git]
objectives:
  - Run git bisect with a test command
  - Use blame to understand a line's origin
  - Combine with dbt/pytest smoke tests
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Cherry-pick a hotfix"
    code: "git cherry-pick hotfix/grain"
    note: "Land the unique_key fix on main without taking the SCD2 branch."
  - label: "Walk back with relative refs"
    code: "git log --oneline\ngit checkout HEAD~2"
    note: "HEAD~ is first-parent. Blame/bisect still need a real repo — this lab is the graph."
quiz:
  - question: "What does git bisect run pytest … do?"
    options:
      - "Rewrites all commit messages"
      - "Binary-searches commits, marking each good/bad from the test exit code"
      - "Only blames the latest author"
      - "Deletes failing tests"
    answer: 1
    explanation: "Bisect automates the binary search using your smoke test as the oracle."
  - question: "When is git blame often misleading?"
    options:
      - "Never"
      - "After bulk reformats or renames that touch every line"
      - "Only on merge commits"
      - "Only in bare repositories"
    answer: 1
---

# Bisect & blame for broken pipelines

**Git Play Lab** here is cherry-pick + relative refs: land the grain hotfix on main after bisect found it. `git bisect run` still belongs in a real clone — this surface is the commit graph.

## Bisect with a script

```bash
git bisect start
git bisect bad
git bisect good v1.2.0
git bisect run pytest tests/test_orders_grain.py
```

## Blame for context

```bash
git blame -L 40,80 models/marts/orders.sql
```

## Exercises

### Exercise 1
Describe a `git bisect run` command that fails when a SQL file no longer contains `unique_key='order_id'`.

### Exercise 2
When is blame misleading? (hint: reformats / bulk renames)

## Cheat sheet

| Tool | Use |
|------|-----|
| bisect | Find breaking commit |
| blame | Line provenance |
| log -S | Pickaxe search for deleted strings |

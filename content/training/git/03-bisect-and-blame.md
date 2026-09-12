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
  - label: "Move HEAD back one commit"
    code: "git reset --hard HEAD~1"
    note: "Play Lab stand-in for walking history. Real bisect still needs a test oracle on a real repo."
  - label: "Inspect the current tip"
    code: "git log --oneline\ngit status"
    note: "Honest: this lab is not git bisect run. Use it to read the graph, then bisect on your laptop."
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

The Git Play Lab on this page is a **graph + undo** trainer, not `git bisect run`. Use it to see how tips move, then run bisect in a real clone.

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

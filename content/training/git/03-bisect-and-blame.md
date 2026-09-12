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
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Bisect with a smoke test"
    code: "git bisect start\ngit bisect bad\ngit bisect good v1.2.0\ngit bisect run pytest tests/test_orders_grain.py"
    note: "The test exit code marks each commit good/bad. Stop with git bisect reset."
  - label: "Blame a grain line"
    code: "git blame -L 40,80 models/marts/orders.sql"
    note: "Misleading after bulk reformats. Prefer blame -w or the pickaxe."
  - label: "Pickaxe a deleted string"
    code: "git log -S \"unique_key='order_id'\" -- models/marts/orders.sql"
    note: "Find when a contract string disappeared — better than guessing from blame."
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

The structured **Cheat sheet** and **Try it** boxes above are the copyable commands. Paste them into your repo — no in-browser git runtime.

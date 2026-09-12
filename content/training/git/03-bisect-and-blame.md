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
  - label: "Bisect a mart"
    code: "git bisect start\ngit bisect bad HEAD\ngit bisect good v1.4.0\n# test: dbt compile + one SELECT on orders_daily\ngit bisect good|bad"
    note: "A failing check you can rerun beats vibes. Play Lab has no VM."
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
  - question: "git blame is most useful when…"
    options:
      - "You want to punish an author"
      - "You need the commit that last touched a grain so you can read the why"
      - "You skip tests"
      - "You rewrite main"
    answer: 1
    explanation: "Blame is archaeology, not HR."
  - question: "Bisect needs a…"
    options:
      - "Secret PAT in the script"
      - "Deterministic test (compile, one DQ SELECT) you can run at each step"
      - "Force-push to main"
      - "Live Databricks cluster in this browser"
    answer: 1
    explanation: "No test, no bisect."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

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

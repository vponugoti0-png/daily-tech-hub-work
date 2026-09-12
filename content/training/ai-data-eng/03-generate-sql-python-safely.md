---
slug: "ai-de-generate-code-safely"
track: "ai-data-eng"
title: "Generate SQL & Python safely"
description: "Prompt for dialect-aware code and review it like a PR."
level: "beginner"
order: 3
durationMinutes: 8
topics: [sql, python]
objectives: [Specify dialect, warehouse, and interfaces, Require comments on assumptions, Review AI code with tests and dry-runs]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Dialect-aware ask"
    code: "Write a MERGE for DuckDB-shaped SQL first, then note Snowflake differences.\nKey: order_id\nWhen matched: update amount, status\nWhen not matched: insert\nDo not invent SET * if the dialect lacks it."
    note: "Name the engine. Review every write clause."
quiz:
  - question: "When asking for MERGE SQL you should specify…"
    options:
      - "Nothing — AI always guesses right"
      - "Engine/dialect and whether SET * is allowed"
      - "Only the table emoji"
      - "That secrets should be hard-coded"
    answer: 1
  - question: "Good review habit for AI code?"
    options:
      - "Merge unread"
      - "Run a dry-run / unit test and read every line that touches data"
      - "Only check formatting"
      - "Disable CI"
    answer: 1
  - question: "AI emits QUALIFY in a query you will run on a warehouse that lacks it. You…"
    options:
      - "Ship it and hope"
      - "Rewrite with a window + filter, or ask for ANSI"
      - "Enable every experimental flag in prod"
      - "Ignore the lesson dialect"
    answer: 1
    explanation: "Dialect mismatches fail at runtime. Constrain or translate."
  - question: "Why require comments on assumptions in generated SQL?"
    options:
      - "Comments make queries slower"
      - "You can see where the model guessed a grain, timezone, or NULL rule"
      - "Legal teams require Latin comments"
      - "So you can skip tests"
    answer: 1
    explanation: "Assumptions are where silent bugs hide. Make them visible, then test."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Generate SQL & Python safely

## Prompt musts

- Dialect (Snowflake / Spark / Postgres)  
- Inputs/outputs  
- Idempotency needs  
- “List assumptions”

## Review like a PR

Read writes, filters, and join keys. Prefer tiny tests.

## Exercises

1. Ask for a Snowflake MERGE with explicit columns for a customer dim.
2. Ask the model to list assumptions — then challenge one.

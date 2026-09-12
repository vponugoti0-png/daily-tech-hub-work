---
slug: "ai-de-docs-and-tests"
track: "ai-data-eng"
title: "Docs and tests with AI"
description: "Turn working code into README notes and starter tests."
level: "beginner"
order: 4
durationMinutes: 8
topics: [python, git]
objectives: [Generate docs from real code you paste (sanitized), Ask for edge-case tests, Keep docs short and accurate]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Test-first ask"
    code: "Write pytest for paid_only(rows).\nCases: paid kept, pending dropped, amount None excluded.\nThen draft a 4-line docstring that names the grain."
    note: "Tests first. Docs that name the grain beat poetry."
quiz:
  - question: "Best input for doc generation?"
    options:
      - "No code, only “document my platform”"
      - "A sanitized function plus intended behavior"
      - "The entire prod database"
      - "Only screenshots of Slack"
    answer: 1
  - question: "AI-written tests should…"
    options:
      - "Be merged without running"
      - "Be read and executed; add the edge cases that matter"
      - "Never assert anything"
      - "Only test happy paths forever"
    answer: 1
  - question: "Best first artifact to ask AI for on a new transform?"
    options:
      - "A logo"
      - "A failing unit test that names the grain, then the function"
      - "A production Job YAML"
      - "A Slack announcement"
    answer: 1
    explanation: "A test pins the contract. Code that follows is reviewable."
  - question: "AI wrote a docstring that never mentions grain. You should…"
    options:
      - "Ship — docs are optional"
      - "Add the grain (1 row per order_id) before anyone copies the function"
      - "Delete all comments"
      - "Translate it to Latin"
    answer: 1
    explanation: "Grain is the contract. A docstring without it invites the next join bug."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Docs and tests with AI

## Docs prompt

Paste a sanitized function → ask for purpose, inputs, outputs, failure modes (½ page max).

## Tests prompt

“Generate 3 pytest cases including one failure mode for null keys.”

## Exercises

1. Document a 10-line transform with AI, then delete anything untrue.
2. Add one test AI missed (nulls or duplicates).

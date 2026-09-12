---
slug: "ai-de-debug-with-ai"
track: "ai-data-eng"
title: "Debug pipelines with AI"
description: "Share symptoms safely and get structured debugging help."
level: "beginner"
order: 2
durationMinutes: 8
topics: [general, python, sql]
objectives: [Describe failures with expected vs actual, Ask for hypotheses ranked by likelihood, Turn suggestions into concrete checks]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Debug prompt"
    code: "Symptom:\\nExpected:\\nActual:\\nRecent changes:\\nEnvironment:\\nAsk: 3 hypotheses + checks (no secrets)."
  - label: "Debug packet"
    code: "Error: (paste redacted)\nGrain I expected: 1 row per order_id\nLast change: added a join to aurora_order_items\nAsk: name 2 likely grain bugs and 1 SELECT to prove the fan-out."
    note: "Give the grain and the last change. Do not paste secrets."
quiz:
  - question: "What should a debug prompt include?"
    options:
      - "Only “it’s broken”"
      - "Expected vs actual, context, and what you already tried"
      - "Prod passwords"
      - "A demand for one magical fix with no questions"
    answer: 1
  - question: "After AI suggests a hypothesis, you should…"
    options:
      - "Run a concrete check"
      - "Restart the cluster forever"
      - "Ignore logs"
      - "Delete the table immediately"
    answer: 0
  - question: "Your gold revenue doubled after an AI-suggested join. First check?"
    options:
      - "Ship a dashboard apology"
      - "Count rows before vs after the join and look for item-grain fan-out"
      - "Hide the metric"
      - "Ask the model to invent a new grain"
    answer: 1
    explanation: "Joins to items fan out order amount. Prove it with counts, then fix."
  - question: "What belongs in a debug prompt?"
    options:
      - "The warehouse password so it can connect"
      - "Redacted error, expected grain, and last change"
      - "The entire prod dump"
      - "Only the word “broken”"
    answer: 1
    explanation: "Shape + grain + last change. Credentials never."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Debug pipelines with AI

## Symptom package

Expected · Actual · When it started · Recent changes · Minimal example

## Ask for

Ranked hypotheses + **checks**, not just “try this code.”

## Exercises

1. Write a symptom package for a late-arriving dimension join.
2. Convert one AI suggestion into a SQL or log check.

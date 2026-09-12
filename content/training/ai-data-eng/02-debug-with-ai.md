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
    code: "Symptom:\nExpected:\nActual:\nRecent changes:\nEnvironment:\nAsk: 3 hypotheses + checks (no secrets)."
    note: "Never paste passwords, tokens, or PII. Expected vs actual beats “it’s broken.”"
  - label: "Hypothesis check"
    code: "Hypothesis 1: late-arriving keys dropped in the left join\nCheck: COUNT unmatched user_id after the enrich\nHypothesis 2: timezone shift on the watermark\nCheck: MIN/MAX event_ts vs load_ts"
    note: "Turn each guess into a concrete query or test. Do not apply a patch you cannot verify."
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
---

# Debug pipelines with AI

## Symptom package

Expected · Actual · When it started · Recent changes · Minimal example

## Ask for

Ranked hypotheses + **checks**, not just “try this code.”

## Exercises

1. Write a symptom package for a late-arriving dimension join.
2. Convert one AI suggestion into a SQL or log check.

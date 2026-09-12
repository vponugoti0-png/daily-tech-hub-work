---
slug: "pe-verify-answers"
track: "prompt-engineering"
title: "Verify before you trust"
description: "Check AI output with docs, tiny tests, and skeptical reading."
level: "beginner"
order: 4
durationMinutes: 30
topics: [general]
objectives: [Separate facts to verify from opinions, Use tiny experiments and official docs, Catch confident-sounding mistakes]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Verify loop"
    code: "1. Restate claim\n2. Find source or run tiny test\n3. Compare\n4. Keep / fix / discard"
    note: "Confident tone is not evidence. Docs or a tiny test decide."
  - label: "SQL smell check"
    code: "Claim: UPDATE SET * works on Snowflake\nCheck: official MERGE docs + a dry-run worksheet\nResult: discard — dialect mismatch"
    note: "Warehouse dialects lie to each other. Verify write-path syntax before you paste."
quiz:
  - question: "AI gives a Snowflake hotkey. What should you do?"
    options:
      - "Memorize it immediately"
      - "Check Snowflake docs or the in-UI shortcut list"
      - "Post it to production without reading"
      - "Assume all vendors share hotkeys"
    answer: 1
  - question: "A confident SQL snippet uses UPDATE SET * on Snowflake. Red flag?"
    options:
      - "No — every warehouse supports it"
      - "Yes — verify dialect; Snowflake needs explicit columns"
      - "Only if the table is empty"
      - "Only on weekends"
    answer: 1
---

# Verify before you trust

AI can be **wrong with confidence**. Your job is the safety layer.

## Fast checks

- Official docs for APIs and shortcuts  
- Tiny runnable examples  
- “Would a senior DE bet on this?”  
- Dialect mismatches (Spark vs Snowflake)

## Habit

Ask the model: “List assumptions I should verify.” Then verify them yourself.

## Exercises

1. Pick one claim from an AI answer and find a primary source.
2. Run a 5-line SQL or Python check that proves or kills the claim.

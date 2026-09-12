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
    code: "1. Restate claim\\n2. Find source or run tiny test\\n3. Compare\\n4. Keep / fix / discard"
  - label: "Verify card"
    code: "1. Re-state the grain in one sentence\n2. Run the SELECT / test yourself\n3. Check dialect keywords against your warehouse\n4. Reject any secret or URL you did not provide"
    note: "You are the reviewer. The model is a draft."
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
  - question: "The model says “this MERGE is safe.” What do you do?"
    options:
      - "Ship it — the model reviewed itself"
      - "Dry-run or preview the match set, then read every write clause"
      - "Only run Prettier"
      - "Paste prod credentials so it can connect"
    answer: 1
    explanation: "Self-praise is not a review. Preview the rows a write would touch."
  - question: "A generated explanation invents a Snowflake function you have never seen. Next step?"
    options:
      - "Assume it shipped last night"
      - "Look it up in your dialect docs, or ask for ANSI-only"
      - "Use it in prod to learn"
      - "Ignore dialect forever"
    answer: 1
    explanation: "Hallucinated functions are common. Verify against docs or constrain the dialect."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

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

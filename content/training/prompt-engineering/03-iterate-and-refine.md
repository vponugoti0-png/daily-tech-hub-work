---
slug: "pe-iterate-and-refine"
track: "prompt-engineering"
title: "Iterate and refine answers"
description: "Treat the first reply as a draft — tighten, challenge, and improve."
level: "beginner"
order: 3
durationMinutes: 25
topics: [general]
objectives: [Use follow-ups that cite what to keep vs change, Ask for alternatives and tradeoffs, Stop when good enough for the task]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Cite-and-change follow-up"
    code: "Keep the 5-bullet cause list.\nChange: drop the warehouse lecture.\nAdd: one DuckDB SELECT on silver_orders that proves the leftover key."
    note: "Quote what to keep vs change. “Try harder” is not a spec."
quiz:
  - question: "Best follow-up after a fuzzy answer?"
    options:
      - "Start a brand-new chat with the same vague ask"
      - "Quote the weak part and say exactly what to change"
      - "Say “try harder” only"
      - "Accept the first answer always"
    answer: 1
  - question: "When should you stop iterating?"
    options:
      - "Never — keep prompting forever"
      - "When the answer is checkable and good enough for the next real step"
      - "After exactly one message"
      - "Only when the model apologizes"
    answer: 1
  - question: "Why ask for two alternatives instead of one rewrite?"
    options:
      - "So you can pick a tradeoff you understand"
      - "Because longer chats are always better"
      - "To hide that you skipped constraints"
      - "So you never have to run a check"
    answer: 0
    explanation: "Alternatives surface tradeoffs. You still pick and verify."
  - question: "The model added a new CTE you did not ask for. Best follow-up?"
    options:
      - "Merge it unread"
      - "“Remove the extra CTE. Keep the WHERE on order_date. Show only the grain I named.”"
      - "Start over with a vaguer prompt"
      - "Ask it to make the SQL longer"
    answer: 1
    explanation: "Cite the extra piece and name the grain. Do not accept drive-by complexity."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Iterate and refine answers

First drafts are normal. Good users **steer**.

## Useful follow-ups

- “Keep the example; rewrite the intro for a beginner.”  
- “Show two options and when I’d pick each.”  
- “Shorten to 8 lines; drop theory.”  
- “You assumed Postgres — redo in Snowflake SQL.”

## Anti-patterns

- Restarting from zero every time  
- Accepting code you cannot explain  
- Endless polish when a worksheet test would decide

## Exercises

1. Take any AI answer and write three precise follow-ups.
2. Decide a “done” criterion before you prompt (e.g., “runs in Snowsight”).

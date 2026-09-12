---
slug: "pe-structure-prompts"
track: "prompt-engineering"
title: "Structure prompts that scale"
description: "Roles, examples, checklists, and stepwise instructions for reliable answers."
level: "beginner"
order: 2
durationMinutes: 30
topics: [general]
objectives: [Use role + task + examples when helpful, Break complex asks into steps, Request self-checks without trusting them blindly]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Role + task"
    code: "You are a patient data-engineering tutor.\nTask: ...\nShow work in steps.\nEnd with a 3-item checklist I can verify."
    note: "Role sets tone. A verify checklist keeps you from trusting the first draft."
  - label: "Add one good example"
    code: "Example of a good answer:\n- Names the grain (order_id)\n- Shows the SQL\n- Calls out the NULL case"
    note: "One short example of the shape you want beats a long lecture."
quiz:
  - question: "Why add a short example of good output?"
    options:
      - "It makes the model slower"
      - "It shows the shape and quality you want"
      - "It is required by all APIs"
      - "It replaces needing a goal"
    answer: 1
  - question: "Best next step for a multi-part ask?"
    options:
      - "Put everything in one paragraph with no structure"
      - "Number the steps and ask for one section at a time if needed"
      - "Only use emojis"
      - "Delete all constraints"
    answer: 1
---

# Structure prompts that scale

## Patterns that help beginners

- **Role** — “patient tutor”, “code reviewer”, “SQL coach”  
- **Task** — one clear verb  
- **Examples** — tiny “good answer looks like…” samples  
- **Steps** — numbered instructions  
- **Verify** — ask for a checklist *you* will still run

## Template

```
You are a patient data-engineering tutor for beginners.
Task: explain window functions for daily DE work.
Audience: knows SELECT/JOIN, new to windows.
Steps: 1) plain idea 2) one example 3) common pitfall
Output: markdown with a tiny SQL snippet (Snowflake dialect).
Self-check: list 3 things I should verify in a worksheet.
```

## Exercises

1. Add a one-line “good output” example to a prompt you already use.
2. Split a mega-prompt into two turns: plan, then execute.

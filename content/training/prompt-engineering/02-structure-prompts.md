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
    code: "You are a patient data-engineering tutor.\\nTask: ...\\nShow work in steps.\\nEnd with a 3-item checklist I can verify."
  - label: "Tiny good-output example"
    code: "Good answer looks like:\n1. Cause (one sentence)\n2. Check (one SELECT)\n3. What not to do (one line)"
    note: "A short example teaches shape better than another adjective."
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
  - question: "What is a role line for?"
    options:
      - "To flatter the model"
      - "To set the voice and bar — tutor, reviewer, SQL coach — so the answer matches how you will use it"
      - "To replace a task verb"
      - "To hide missing constraints"
    answer: 1
    explanation: "Role sets voice. You still need a task, constraints, and a format."
  - question: "A self-check checklist from the model is useful because…"
    options:
      - "You can trust it blindly"
      - "It gives you a list you still run yourself"
      - "It replaces unit tests"
      - "It means the SQL is production-ready"
    answer: 1
    explanation: "Ask for a checklist you will execute. Never treat the model’s “looks good” as a test."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

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

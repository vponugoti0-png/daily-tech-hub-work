---
slug: "pe-ask-better-questions"
track: "prompt-engineering"
title: "Ask AI better questions"
description: "Turn vague asks into clear, scoped prompts that get useful answers the first time."
level: "beginner"
order: 1
durationMinutes: 25
topics: [general]
objectives: [State goal, context, and constraints in one prompt, Ask for format and depth so answers are usable, Spot vague prompts and rewrite them]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Prompt skeleton"
    code: "Goal:\nContext:\nConstraints:\nOutput format:"
    note: "Fill every line"
quiz:
  - question: "Which prompt is most likely to get a useful first answer?"
    options:
      - "Explain Spark"
      - "Fix my pipeline"
      - "Explain Spark partitions to a junior DE in 5 bullets with one example"
      - "Write code"
    answer: 2
    explanation: "Clear audience, length, and format beat vague asks."
  - question: "What belongs in Constraints?"
    options:
      - "Only the model name"
      - "Limits like dialect, no secrets, word count, or tools you have"
      - "A joke to warm up the model"
      - "Nothing — constraints slow AI down"
    answer: 1
    explanation: "Constraints tell the model the fences — dialect, length, no secrets, tools you already have — so it does not invent a stack you cannot run."
---

# Ask AI better questions

AI is helpful when **you** are specific. Vague prompts waste time.

## The four-line prompt

1. **Goal** — what success looks like  
2. **Context** — your stack, level, and situation  
3. **Constraints** — dialect, length, “no secrets”, tools you have  
4. **Output format** — bullets, table, SQL, checklist

### Weak → strong

- Weak: “Help with Snowflake.”  
- Strong: “I’m a beginner DE. Explain Snowflake warehouses vs databases in plain language, then give a 4-row comparison table.”

## Exercises

1. Rewrite “optimize this query” into a four-line prompt (invent a realistic context).
2. Add an output format that would make the answer paste into a ticket.

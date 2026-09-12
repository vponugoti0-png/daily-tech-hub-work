---
slug: "pe-prompts-for-learning"
track: "prompt-engineering"
title: "Prompt patterns for learning DE"
description: "Use AI as a tutor: explanations, drills, and spaced practice — without skipping thinking."
level: "beginner"
order: 6
durationMinutes: 30
topics: [general]
objectives: [Ask for progressive explanations, Generate practice drills you can grade, Use AI to review your attempt, not replace it]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Teach-back prompt"
    code: "Explain Snowflake warehouses vs databases to a junior DE.\nThen ask me 3 quiz questions.\nWait for my answers before you reveal yours."
    note: "Learning prompts should test you, not only lecture you."
quiz:
  - question: "Best learning use of AI?"
    options:
      - "Copy-paste solutions into prod unread"
      - "Attempt first, then ask AI to critique your attempt"
      - "Only ask for final answers"
      - "Avoid examples"
    answer: 1
  - question: "Good tutor prompt includes…"
    options:
      - "Your level and what you already tried"
      - "Nothing but “explain everything”"
      - "Secrets from prod"
      - "A request to skip quizzes"
    answer: 0
  - question: "Best learning prompt after you read a lesson?"
    options:
      - "Summarize the internet"
      - "Quiz me on Aurora SELECT NULLs; wait for my answer; then explain why I was wrong"
      - "Give me the answer key only"
      - "Skip practice and generate a cert"
    answer: 1
    explanation: "A quiz that waits for you builds the “why.” Answer keys alone fade."
  - question: "Why ask the model to use your stack names (Aurora, silver_orders)?"
    options:
      - "So it can log into your warehouse"
      - "So examples transfer to the lab you will actually run"
      - "Because generic SQL is illegal"
      - "To hide missing constraints"
    answer: 1
    explanation: "Familiar table names make practice copy-pasteable into the local lab."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Prompt patterns for learning DE

## Tutor moves

- “Explain like I’m new to warehouses; then add one level of depth.”  
- “Quiz me with 3 questions; wait for my answers.”  
- “Here’s my attempt — what’s wrong and what to read next?”

## Keep the struggle

Struggle builds skill. Use AI after you try, or to unblock a stuck 10 minutes — not to skip the workout.

## Exercises

1. Write a quiz-me prompt for window functions.
2. Paste a wrong mental model on purpose and ask AI to correct it gently.

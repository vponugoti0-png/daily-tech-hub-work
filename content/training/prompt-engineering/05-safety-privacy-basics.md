---
slug: "pe-safety-privacy"
track: "prompt-engineering"
title: "Safety and privacy basics"
description: "Keep secrets, PII, and prod credentials out of prompts — free tools included."
level: "beginner"
order: 5
durationMinutes: 25
topics: [general]
objectives: [Recognize data that must not be pasted into AI, Use redaction and synthetic examples, Follow workplace AI policies]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Redact before you paste"
    code: "Schema: order_id INT, email VARCHAR, amount NUMERIC\nSynthetic rows:\n  (1001, 'ada@example.test', 42.50)\n  (1002, NULL, 18.00)\nNever: real emails, DSNs, tokens, warehouse passwords."
    note: "Shape is enough. Prod dumps and keys stay out of the chat."
quiz:
  - question: "Safe to paste into a public AI chat?"
    options:
      - "Production connection strings"
      - "Customer emails from a support export"
      - "A made-up sample row with fake names"
      - "Your cloud private key"
    answer: 2
  - question: "Best practice when you need help with a messy table?"
    options:
      - "Upload the full prod dump"
      - "Share schema + 2–3 synthetic rows that match the shape"
      - "Paste passwords so AI can connect"
      - "Disable all logging forever"
    answer: 1
  - question: "Your teammate pastes a Databricks personal access token into a public chat to “debug auth.” That is…"
    options:
      - "Fine if they delete the thread later"
      - "A secret leak — rotate the token and use a redacted error"
      - "Required by most AI tools"
      - "Safer than a screenshot"
    answer: 1
    explanation: "Tokens in a prompt are credentials in a third-party log. Rotate and redact."
  - question: "Which prompt is workplace-safer?"
    options:
      - "Here is our ACCOUNTADMIN password, fix grants"
      - "Here is a fake Unity Catalog grant list with names like ada@example.test — which privilege is extra?"
      - "Upload last month’s customer export"
      - "Paste the PEM for the warehouse user"
    answer: 1
    explanation: "Synthetic names keep the shape. Real passwords and exports do not belong in a prompt."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Safety and privacy basics

Free does **not** mean “paste everything.”

## Never paste

- Passwords, tokens, private keys  
- Customer PII / regulated data without approval  
- Full prod extracts  

## Prefer

- Synthetic rows  
- Schema-only discussions  
- Redacted logs  
- Company-approved tools and policies

## Exercises

1. Redact a fake log line that contains an email and API key.
2. Write a one-sentence personal rule for what never goes into prompts.

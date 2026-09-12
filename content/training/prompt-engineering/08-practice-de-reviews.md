---
slug: pe-practice-de-reviews
track: prompt-engineering
title: "Practice — DE review prompts"
description: "More Aurora-original prompts for PR reviews, on-call notes, and incident write-ups. Copy into your AI tool — no in-browser model."
level: beginner
order: 8
durationMinutes: 25
topics: [general]
objectives:
  - "Write a PR-review prompt that names grain, dialect, and fences"
  - "Turn an incident into a four-line prompt without pasting secrets"
  - "Ask for a checklist you will still run in a lab or warehouse"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Silver MERGE review"
    code: "You are a DE reviewer for Aurora silver.orders.\\nGoal: find grain bugs in this MERGE sketch.\\nConstraints: Spark SQL / Delta. No secrets. Do not suggest DROP gold.\\nOutput: 3 risks, then one safer MERGE (MATCHED + NOT MATCHED only)."
    note: "Paste into Claude, Copilot, or Grok. You still preview the MATCHED set in the SQL lab."
  - label: "On-call first message"
    code: "Goal: draft a 6-line Slack update for orders_daily being 20 minutes late.\\nContext: Autoloader bronze, silver MERGE, gold Dynamic Table / Job.\\nConstraints: no passwords, no customer emails, no blame.\\nOutput: impact, what we know, next check, ETA style (unknown is ok)."
    note: "A first message is a draft. You still look at the Job run."
  - label: "Incident timeline ask"
    code: "Turn these bullets into a timeline I can paste into a ticket.\\n- 09:10 UTC Job started\\n- 09:18 silver MERGE rows_out=0\\n- 09:22 on-call paged\\nConstraints: no secrets. Flag missing evidence.\\nOutput: table with time, fact, next check."
    note: "Ask the model to flag gaps. You fill facts from logs — not from chat."
quiz:
  - question: "A review prompt that omits the grain usually…"
    options:
      - "Gets a safer MERGE"
      - "Lets the model invent a grain (DISTINCT amount, SUM after item join)"
      - "Disables AI"
      - "Rotates warehouse keys"
    answer: 1
    explanation: "Name order_id vs item vs daily-region. Vague reviews produce vague SQL."
  - question: "Safe context for an on-call prompt includes…"
    options:
      - "The warehouse password and a dump of customer emails"
      - "Job name, delay, layer (bronze/silver/gold), and what you already checked"
      - "ACCOUNTADMIN"
      - "A request to DROP gold"
    answer: 1
    explanation: "Symptoms and layers. Credentials and DROP stay out."
  - question: "The model’s incident timeline is…"
    options:
      - "Source of truth for the postmortem"
      - "A draft you verify against Job logs and lab/warehouse checks"
      - "A reason to skip the FDE handoff"
      - "A live Databricks run"
    answer: 1
    explanation: "You own correctness. Chat is a draft."
---

More prompt practice for DE work. Guest-friendly — **copy into your AI tool**. There is no in-browser model on this page.

## Review like a teammate

Name the **grain**, the **dialect**, and the **fences** (no secrets, no DROP gold). Ask for risks first, then a safer sketch.

## On-call without dumping prod

A first Slack message needs impact + next check. It does not need a DSN. If you do not know the ETA, say so.

## Exercises

1. Rewrite “review my SQL” into the four-line skeleton with an Aurora silver MERGE.
2. Write an on-call prompt for `orders_daily` late by 20 minutes — no emails, no passwords.
3. Ask for a checklist you will run in the [SQL local lab](/training/sql/sql-select-filter-nulls#lab).

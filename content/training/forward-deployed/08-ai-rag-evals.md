---
slug: "fde-ai-rag-evals"
track: "forward-deployed"
title: "AI, RAG, and agents with evals"
description: "Ship warehouse AI features with evals and guardrails — same copilot mindset as the AI for DE track."
level: "intermediate"
order: 8
durationMinutes: 50
topics: [general, snowflake, databricks]
objectives:
  - "Ground AI features in warehouse objects and an eval set before go-live"
  - "Apply guardrails: no PII in prompts, citations, human-owned writes"
  - "Reuse the AI-for-DE mindset instead of inventing a chatbot product"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Eval card (before demo)"
    code: "Q: What is the grain of orders_daily?\nGold: one row per event_date; SUM of paid amount\nQ: Who can write prod.gold?\nGold: transformer SP only\nQ: Can I DROP fct_orders?\nGold: refuse + cite runbook — never invent DDL"
    note: "Ten questions beat a vibe check. Fail closed."
  - label: "Guardrail prompts"
    code: "You answer from retrieved table docs only.\nIf docs are missing, say you do not know.\nNever print secrets, emails, or connection strings.\nNever propose unreviewed DDL/DML against prod.\nCite catalog.schema.table for every object you name."
    note: "Same ownership rule as AI as a DE copilot."
  - label: "When Cortex vs a Job"
    code: "Cortex/Assistant: explain, draft, search docs in their tenant\nJob/DT: publish gold, DQ, freshness — not 'the LLM said it's fine'\nSee: /training/snowflake/sf-cortex-vs-snowpark and /training/ai-data-eng/ai-de-practice-agents"
    note: "AI drafts; pipelines publish."
quiz:
  - question: "Before enabling a customer-facing RAG over pipeline docs you should…"
    options:
      - "Skip evals if the demo looked fluent"
      - "Run a small eval set and refuse answers that invent table names"
      - "Send all prod rows to a public model"
      - "Grant the model ACCOUNTADMIN"
    answer: 1
  - question: "Who owns correctness of AI-suggested SQL that writes data?"
    options:
      - "The model vendor only"
      - "You and the customer’s review process"
      - "Nobody"
      - "The laptop"
    answer: 1
    explanation: "Same answer as the AI for DE copilot lesson."
  - question: "A good guardrail for an in-warehouse assistant is…"
    options:
      - "Let it DROP tables if it is confident"
      - "Retrieve docs, cite objects, refuse when retrieval is empty"
      - "Paste PATs into the prompt for context"
      - "Disable logging so security cannot see it"
    answer: 1
  - question: "Ship an AI feature without evals is risky because…"
    options:
      - "Models cannot run in a VPC"
      - "You cannot tell if retrieval/answers got worse after a prompt change"
      - "Evals require ACCOUNTADMIN"
      - "RAG is illegal"
    answer: 1
    explanation: "Evals are DQ gates for AI."
  - question: "Customer documents in a RAG index should…"
    options:
      - "Bypass RBAC because the model is trusted"
      - "Honor the same grants / redaction you would use for a mart"
      - "Be pasted into a public chat to “test chunks”"
      - "Include PATs for freshness"
    answer: 1
    explanation: "AI does not waive governance."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# AI, RAG, and agents with evals

Customers will ask you to “just add a chatbot on the lakehouse.” An FDE treats that like any other deploy: **smallest valuable feature**, **their tenant**, **evals**, **guardrails**, **handoff**.

Reuse the mindset from [AI as a DE copilot](/training/ai-data-eng/ai-de-copilot-mindset) and the practice lessons: [Cortex / agents](/training/ai-data-eng/ai-de-practice-agents), [non-SF agents](/training/ai-data-eng/ai-de-practice-nonsf-agents). Decision guide: [Cortex vs Snowpark](/training/snowflake/sf-cortex-vs-snowpark).

## What is in scope for v1

| In | Out |
|----|-----|
| RAG over *their* table comments / runbooks already in-tenant | Scraping prod tables into a public model |
| Eval set of 10–20 questions with gold answers | “It sounded right in the demo” |
| Cite `catalog.schema.table` | Invented objects |
| Draft SQL the AE still reviews | Autopilot MERGE to prod |

The gravel road is **answers about grain and ownership**. The highway is an agent that files tickets and writes gold.

## Evals before the stakeholder demo

Write questions from discovery, not from your marketing site.

1. Grain of the mart they actually use
2. Who can write prod
3. What to do when gold is stale (runbook)
4. A trick question: “Drop `fct_orders` to fix duplicates”
5. A should-refuse: “Here is a PAT, debug this”

Score: grounded / refused / hallucinated. **Hallucinated object names are ship blockers.**

You do not need a Python runtime lab on Aurora to do this. A spreadsheet + their approved assistant is enough. If they use Cortex `COMPLETE` / Search, practice the SQL shape on the [AI for DE practice lesson](/training/ai-data-eng/ai-de-practice-agents) — copy cards, not a new WASM lab.

## Guardrails (non-negotiable)

- Retrieval only from approved indexes (docs, comments) — not raw PII columns
- Empty retrieval → “I do not know”
- No secrets in prompts ([privacy lesson](/training/prompt-engineering/pe-safety-privacy))
- Writes stay on Jobs / Dynamic Tables with DQ gates
- Log prompts in *their* tenant if policy requires; redact

[Review AI-assisted changes](/training/ai-data-eng/ai-de-review-changes) still applies to every PR the agent inspired.

## Exercises

1. Write eight eval questions for Northwind’s orders mart assistant. Mark two as must-refuse.
2. Draft a system prompt that forces citations and forbids DDL.
3. Explain in three sentences when you would use Cortex/Assistant vs a scheduled Job.

---
slug: "fde-security-review"
track: "forward-deployed"
title: "Security review survival"
description: "PII, RBAC, and least privilege — survive the questionnaire without lying or grabbing admin."
level: "intermediate"
order: 6
durationMinutes: 45
topics: [general, snowflake, databricks]
objectives:
  - "Answer a security review with least privilege and honest data flows"
  - "Keep PII and secrets out of prompts, tickets, and vendor logs"
  - "Tie grants to transformer vs analyst roles instead of shared admin"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Least privilege grid"
    code: "ingest SP:   write bronze only\ntransform SP: read bronze, write silver/gold named tables\nanalyst:      USAGE + SELECT on gold\nFDE human:    DEV only after kickoff; no prod standing admin\nAI feature:   schema + synthetic rows — never raw PII prompts"
    note: "If the grid has ALL PRIVILEGES, rewrite it before the review."
  - label: "Questionnaire truths"
    code: "Data we touch: orders_daily grain + DQ flags (no raw card numbers)\nWhere it lives: their catalog / their VPC\nWho can write: their transformer SP\nLLM: approved tool only; redacted logs; no training on their data\nAdmin: we request schema grants, not ACCOUNTADMIN"
    note: "Honesty beats a 'yes' you cannot operate."
quiz:
  - question: "Least privilege for an FDE-delivered Job usually means…"
    options:
      - "ACCOUNTADMIN so nothing fails"
      - "A service principal with write on the named objects it owns"
      - "Analyst SELECT on every bronze table"
      - "Sharing the FDE password"
    answer: 1
  - question: "Safe to paste into a public AI chat during an engagement?"
    options:
      - "Production connection strings"
      - "A customer email export"
      - "Schema plus two or three synthetic rows"
      - "The warehouse private key"
    answer: 2
    explanation: "Same privacy mindset as the Prompt Engineering safety lesson."
  - question: "A security reviewer asks if your RAG feature sends row-level PII to a vendor model. You should…"
    options:
      - "Say no and do it anyway"
      - "Describe the real flow: what leaves the warehouse, what is redacted, which tenant"
      - "Promise ACCOUNTADMIN will make it fine"
      - "Skip the question"
    answer: 1
---

# Security review survival

Security review is not a pop quiz you game. It is how the customer decides whether your Job may exist. **Survive it by being boring:** least privilege, named principals, honest data flow, no PII in prompts.

This lesson ties to Aurora’s privacy mindset — [Safety and privacy basics](/training/prompt-engineering/pe-safety-privacy) — and to warehouse RBAC: [Snowflake roles](/training/snowflake/sf-governance-rbac), [Unity Catalog](/training/databricks/dbx-unity-catalog).

## What reviewers actually ask

1. **What data** do you touch? (grain, not “all enterprise data”)
2. **Where does it go?** (stays in their catalog vs leaves to a vendor)
3. **Who can write?** (SP vs human vs your SaaS)
4. **What happens on offboarding?** (you lose grants; their Job still runs)
5. **AI?** (which model tenant, what is logged, is training opted out)

If you cannot answer in a paragraph, you are not ready to schedule the review.

## Least privilege, DE-shaped

| Principal | May | Must not |
|-----------|-----|----------|
| Ingest SP | Write bronze / stage | Read gold PII for fun |
| Transform SP | MERGE named silver/gold | `MANAGE` on the catalog |
| Analyst role | `SELECT` gold | See raw email/SSN columns (mask) |
| FDE human | DEV + break-glass ticket | Standing prod admin |

Masking policies and row-access belong on the **customer** side. You help them place them; you do not disable them to “just get the demo working.”

## PII and AI

FDEs get asked to “just paste the error” into a public model.

Never paste:

- Connection strings, PATs, private keys
- Customer emails, card data, health identifiers
- Full prod extracts

Prefer:

- Schema + synthetic rows
- Redacted logs
- Company-approved tools ([AI copilot mindset](/training/ai-data-eng/ai-de-copilot-mindset))

If the product includes RAG or agents, say **what is retrieved**, **where it is embedded**, and **what is sent to a model**. “We are safe” is not an answer.

## How to fail a review (do not)

- Request `ACCOUNTADMIN` / metastore admin “temporarily”
- Hide that logs leave the VPC
- Promise no PII while your prompt includes `SELECT * FROM customers`
- Leave your user as the Job owner

## Exercises

1. Fill the least-privilege grid for Northwind’s `orders_daily` Job.
2. Redact a fake log line that contains an email and a PAT.
3. Write a four-sentence answer to “Does customer data train your model?”

---
slug: "fde-capstone-engagement"
track: "forward-deployed"
title: "Capstone — DE platform engagement checklist"
description: "End-to-end fictional engagement: discover, scope, integrate, deploy, secure, hand off — then quiz."
level: "intermediate"
order: 10
durationMinutes: 45
topics: [general, sql, snowflake, databricks]
objectives:
  - "Walk a fictional DE platform engagement from discovery to handoff"
  - "Apply the gravel-road scorecard without new nav or live cloud buttons"
  - "Check the full FDE loop with a short quiz"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Northwind engagement scorecard"
    code: "[ ] Personas + pager mapped (not only the champion)\n[ ] Grain: orders_daily = 1 row per event_date\n[ ] In/Out/Operator/Kill on one page\n[ ] SP + network + secret manager (no FDE human prod)\n[ ] CI → DEV → staging → prod (no notebook-as-source)\n[ ] Least privilege + honest AI/PII answers\n[ ] Freshness/volume/cost/failure + runbook they drove\n[ ] Eval set if any RAG/assistant shipped\n[ ] Forwardable note + 12-min demo spine"
    note: "Guest-friendly checklist — no CRM, paid cert, or live deploy."
  - label: "Story objects"
    code: "bronze: raw orders landings (dups ok)\nsilver: 1 row per order_id (latest updated_at)\ngold:   orders_daily(event_date, revenue, order_cnt)\njob:    their SP, DEV catalog first\npager:  #data-oncall after handoff"
    note: "Same story as the SQL shared capstone — FDE layer is delivery."
quiz:
  - question: "Northwind’s FDE gravel road is done when…"
    options:
      - "You hold ACCOUNTADMIN and a chatbot hallucinates tables"
      - "orders_daily publishes in their gold, their SP owns the Job, their on-call has a runbook"
      - "Every domain is migrated"
      - "A new top-level site nav item exists"
    answer: 1
    explanation: "Delivery + handoff. Not estate rewrite, not admin forever."
  - question: "Which discovery gap should block a Friday demo date?"
    options:
      - "You have not picked a slide theme"
      - "No prod write principal and no network path are written down"
      - "The champion wants a logo in the footer"
      - "You have not built a Python WASM lab"
    answer: 1
  - question: "This track’s capstone is…"
    options:
      - "A live customer CRM and paid certificate"
      - "A fictional checklist + quiz using the same mart story as other tracks"
      - "A DuckDB lab expansion"
      - "A Railway deploy from the lesson page"
    answer: 1
    explanation: "v1 is lessons, quizzes, and copy cards. Practice labs stay on DBX/SF SQL."
  - question: "Capstone engagement is done when…"
    options:
      - "You still hold ACCOUNTADMIN and they have no runbook"
      - "A named Job/DT is in their env, gated, alerted, and their on-call can run the first check"
      - "The sales deck is prettier"
      - "You cloned prod to your laptop"
    answer: 1
    explanation: "Used, owned, reversible."
  - question: "The checklist exists so that…"
    options:
      - "You can skip discovery"
      - "Security, grain, deploy, and handoff are not optional slides"
      - "Labs become live warehouses"
      - "Wave B ships from this PR"
    answer: 1
    explanation: "Same spine as the ETL builders — plus customer constraints."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Capstone — DE platform engagement checklist

**Northwind Logistics** (fictional) bought a freshness + optional docs assistant on top of their warehouse. You are the FDE. This page is the **end-to-end scorecard** — not a CRM, not a paid cert, not a live cloud button.

Same data story as the rest of Aurora: **orders → late events → daily revenue mart** ([shared checklist](/training/sql/sql-shared-capstone-checklist)). Your job is **delivery in their environment**.

## The engagement in one pass

Walk these in order. If a box is open, do not pretend go-live.

### 1. Role and discovery

- You are not SWE/SA/SE. You leave an operator, not a demo tenant ([what an FDE is](/training/forward-deployed/fde-what-an-fde-is)).
- Sit with platform DE, AE, on-call, security — not only the champion ([discovery](/training/forward-deployed/fde-discovery-shadowing)).
- Write grain, pager, and who can `CREATE` vs `USAGE`.

### 2. Scope

- **In:** `prod.gold.orders_daily` — one row per `event_date`.
- **Out:** estate rewrite, new CDC product, agent fleet.
- **Operator:** `#data-oncall`.
- **Kill:** no transformer SP by day 10; grain still debated by day 5 ([smallest deploy](/training/forward-deployed/fde-smallest-valuable-deploy)).

### 3. Integrate and deploy

- Constraint inventory: IdP SP, Private Link / allowlist, secret manager ([customer env](/training/forward-deployed/fde-integrate-customer-env)).
- DEV catalog or clone → staging → prod. CI promotes a SHA ([deploy](/training/forward-deployed/fde-deploy-environments)).
- Warehouse implementation you may *point at* (you do not need a new lab): [Snowflake DT capstone](/training/snowflake/sf-capstone-dynamic-table-mart) or [DBX Job capstone](/training/databricks/dbx-capstone-medallion-job).

### 4. Secure, watch, optionally add AI

- Least privilege grid + honest questionnaire ([security](/training/forward-deployed/fde-security-review)).
- Four metrics + runbook they drove once in DEV ([observability](/training/forward-deployed/fde-observability-handoff)).
- If they want an assistant: eval card + guardrails, then [AI for DE](/training/ai-data-eng) ([evals](/training/forward-deployed/fde-ai-rag-evals)).

### 5. Demo and leave

- 12-minute spine + forwardable note ([demos](/training/forward-deployed/fde-stakeholder-demos)).
- FDE human grants removed from prod. Job owner is their SP.

## Scorecard

Copy the cheat-sheet boxes into a PR or wiki. Guest progress on this lesson is enough — no `/practice` simulator and no new header nav.

| Box | Fail if… |
|-----|----------|
| Personas | Only the champion |
| Grain | Gold is not daily, or items fan out revenue |
| Kill | Date promised with TBD network |
| Identity | Job runs as your user |
| Promote | Untracked notebook is prod |
| Security | `ALL PRIVILEGES` or PII in prompts |
| Handoff | Pager still hits only you |
| AI | Fluent demo, no evals |
| Writing | Nobody can forward a half page |

## Exercises

1. Mark each scorecard line for a *failed* engagement that skipped networking. Which two boxes would you reopen first?
2. Write the kill-criteria paragraph you would have put in the week-one one-pager.
3. Point a teammate at the Snowflake **or** Databricks capstone and say which FDE boxes those lessons do *not* cover (hint: personas, security review, forwardable note).

---
slug: "fde-discovery-shadowing"
track: "forward-deployed"
title: "Discovery and shadowing workflows"
description: "Shadow warehouse and on-call personas so you scope the real job, not the slide job."
level: "beginner"
order: 2
durationMinutes: 45
topics: [general, snowflake, databricks]
objectives:
  - "Name the warehouse/on-call personas you must sit with"
  - "Run a discovery loop that produces owners, grain, and constraints"
  - "Leave with a stakeholder map instead of a feature wishlist"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Persona cards"
    code: "Platform DE — owns Jobs/Tasks, catalogs, warehouses\nAnalytics eng — owns gold grain and BI contracts\nOn-call — pages on freshness / failed task\nSecurity — PII, RBAC, network, questionnaires\nFinance/ops — cost, the actual decision maker"
    note: "If you only met the champion, you have not done discovery."
  - label: "Discovery questions"
    code: "What is one row in gold today?\nWho gets paged when it is stale?\nWho can CREATE vs USAGE in prod?\nWhat must never leave the VPC?\nWhat did the last failed deploy look like?"
    note: "Ask in their words. Write answers in yours."
quiz:
  - question: "Best first discovery move on a lakehouse engagement?"
    options:
      - "Rewrite Unity Catalog from scratch"
      - "Shadow the standup/on-call and map owners, grain, and who pages"
      - "Demand ACCOUNTADMIN before introductions"
      - "Skip people and only read the sales deck"
    answer: 1
    explanation: "Personas and pager paths beat architecture theater."
  - question: "You only interviewed the executive champion. What is missing?"
    options:
      - "Nothing — champions are enough"
      - "The people who hold grants, run Jobs, and get paged at 2am"
      - "A second sales deck"
      - "A new top-level product nav"
    answer: 1
  - question: "A useful discovery artifact is…"
    options:
      - "A 40-page strategy novel"
      - "A one-page stakeholder map: owner, grain, constraint, pager"
      - "An undocumented Slack DM"
      - "A promise to migrate every table this sprint"
    answer: 1
---

# Discovery and shadowing workflows

FDEs who skip discovery ship the **slide job**: a reference architecture nobody operates. Discovery is sitting with **warehouse and on-call personas** until you can draw who owns bronze, who pages, and who can say no.

## Personas to sit with

| Persona | What you watch | What you write down |
|---------|----------------|---------------------|
| **Platform DE** | Job graph, warehouse auto-suspend, catalog layout | Where *your* Job would live |
| **Analytics engineer** | Gold grain, BI contracts, dbt sources | What “one row” means |
| **On-call** | Last three incidents | Freshness SLO, runbook gaps |
| **Security** | Questionnaire, Private Link, masking | What will fail review |
| **Finance / ops lead** | Cost and the actual go-live decision | Who signs “good enough” |

Shadow a **Monday morning**. Warehouse standups are more honest than kickoff decks.

## The discovery loop

1. **Listen** — 30 minutes, no pitching. Ask what broke last week.
2. **Map** — owners, systems, grain. Use their object names (`prod.gold.orders_daily`).
3. **Constrain** — network, PII, change windows, “we cannot grant that role.”
4. **Replay** — send a half-page note the same day. If they correct it, you learned.

### What “good notes” look like

```
Gold grain: 1 row per event_date (paid orders)
Pager: #data-oncall, platform DE primary, AE secondary
Prod write: transformer role only; analysts USAGE on gold
Constraint: no public ingest; Private Link to the bucket
Last incident: DT lag 4h; nobody knew TARGET_LAG vs warehouse size
```

That note is more valuable than a 20-slide “current state.”

## Warehouse-shaped questions

Steal these; do not invent a generic “tell me your pain” script.

- What is **one row** in the table the CFO actually opens?
- When that table is late, **who is paged** and what do they run first?
- Who can `CREATE` in `dev` vs `USAGE` in `prod`? ([Snowflake RBAC](/training/snowflake/sf-governance-rbac), [Unity Catalog](/training/databricks/dbx-unity-catalog))
- What data **must not** reach a vendor LLM? ([Safety and privacy](/training/prompt-engineering/pe-safety-privacy))
- Where does a **failed MERGE** show up — Task history, Job run, or a Slack emoji?

## Anti-patterns

- Interviewing only the champion who bought the tool
- Scheduling a week of workshops before you have watched one incident
- Collecting a feature wishlist and calling it requirements
- Recording secrets or live customer emails in your notes

## Exercises

1. Fill the persona table for a fictional retailer with Snowflake + dbt. Invent names.
2. Write five discovery questions you would ask their on-call after a stale Dynamic Table.
3. Draft the half-page replay note you would send the same afternoon.

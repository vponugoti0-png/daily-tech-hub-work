---
slug: "fde-smallest-valuable-deploy"
track: "forward-deployed"
title: "Scope the smallest valuable deploy"
description: "Gravel road first: one gold mart, one job, one owner — then the highway."
level: "intermediate"
order: 3
durationMinutes: 40
topics: [general, sql, databricks]
objectives:
  - "Define a gravel-road deploy with one grain and one operator"
  - "Cut scope that boils the lake or rewrites medallion on week one"
  - "Write kill criteria so a bad engagement stops early"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Gravel vs highway"
    code: "Gravel: 1 gold table, 1 Job/DT, 1 dashboard, DEV→prod grants, runbook\nHighway: Autoloader rewrite, 12 domains, real-time everything, AI agent fleet"
    note: "Highway is a later PR. Gravel is what you demo on Friday."
  - label: "Scope one-pager"
    code: "In: orders_daily (event_date, revenue, order_cnt)\nOut: item-level rewrite, new CDC tool, chatbot\nOperator: platform DE on-call\nKill: no prod write role by day 10; grain still debated by day 5"
    note: "If In/Out/Operator/Kill do not fit one page, you are not scoped."
quiz:
  - question: "A gravel-road deploy for a DE platform usually includes…"
    options:
      - "Every bronze table in the estate"
      - "One gold grain, one scheduled Job or Dynamic Table, one operator"
      - "A net-new ingestion product"
      - "Permanent vendor ACCOUNTADMIN"
    answer: 1
    explanation: "Smallest valuable = one contract the customer can operate."
  - question: "Which item belongs on the Out list for week one?"
    options:
      - "A DEV catalog clone for rehearsal"
      - "Rewriting the customer’s entire medallion and CDC stack"
      - "A freshness check on the mart"
      - "A half-page runbook"
    answer: 1
  - question: "Kill criteria exist so that…"
    options:
      - "You never ship"
      - "A blocked grant or disputed grain stops the engagement before you fake a go-live"
      - "Security is skipped"
      - "You can hold prod admin forever"
    answer: 1
---

# Scope the smallest valuable deploy

**Gravel road → highway.** The gravel road is a deploy a human can operate next Monday. The highway is platform-wide Autoloader, twelve domains, and an agent fleet. FDEs who start on the highway miss the Friday demo and burn trust.

This matches the shared training story: **orders → late events → daily revenue mart** ([shared capstone checklist](/training/sql/sql-shared-capstone-checklist)). Steal that grain. Do not invent a new universe.

## What “smallest valuable” means here

Valuable to **their** operator, not to your product roadmap.

| In (gravel) | Out (highway, later) |
|-------------|----------------------|
| One gold table with declared grain | Rebuild bronze for every source |
| One Job, Task, or Dynamic Table | New orchestrator + new CDC product |
| DEV catalog / zero-copy clone rehearsal | Prod writes on day one |
| Freshness + row-count check | Real-time everything |
| One dashboard the AE already uses | A new BI tool |

If the CFO already opens `orders_daily`, **that** is the contract. Your product is a better way to publish or watch it — not a new grain.

## The one-pager

Four headings. One page. Send it after discovery.

1. **In** — object names, grain, schedule or `TARGET_LAG`
2. **Out** — the tempting rewrite you will not do
3. **Operator** — named human + channel after handoff
4. **Kill** — dates. Example: “No transformer write role by day 10 → pause. Grain still debated by day 5 → pause.”

Kill criteria are kindness. They stop you from “going live” on a hope and a shared admin.

## Scope triangle

Every ask spends **time**, **risk**, and **blast radius**.

- Time: can this ship in one change window?
- Risk: does it touch PII or prod MERGE keys?
- Blast radius: if it is wrong, is it one mart or the lake?

A RAG chatbot over *all* table comments fails all three. A documented `orders_daily` Job with a DQ gate can pass.

## How to say no

Champion: “While you are here, migrate finance, marketing, and the agent.”

You: “Gravel is `orders_daily` in their gold schema. Highway is a phase-2 PR after they run the runbook without us. I will write that sequence in the one-pager.”

Then write it. Silence is how scope dies.

## Exercises

1. Fill In / Out / Operator / Kill for Northwind’s orders mart on Databricks Jobs.
2. Rewrite a “boil the lake” ask into a gravel-road sentence.
3. Add one kill criterion about [Unity Catalog grants](/training/databricks/dbx-unity-catalog) or [Snowflake roles](/training/snowflake/sf-governance-rbac).

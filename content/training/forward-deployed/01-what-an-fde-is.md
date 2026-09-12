---
slug: "fde-what-an-fde-is"
track: "forward-deployed"
title: "What a Forward Deployed Engineer is"
description: "How an FDE differs from SWE, SA, and SE — in a warehouse and lakehouse delivery context."
level: "beginner"
order: 1
durationMinutes: 40
topics: [general, databricks, snowflake]
objectives:
  - "Name what an FDE owns after the contract is signed"
  - "Separate FDE work from SWE product, SA pre-sales, and SE demos"
  - "Map FDE work onto DE platforms: warehouse grants, lakehouse jobs, AI features"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Role one-liners"
    code: "SWE: ships the product in our repo\nSA: designs the sale and the reference architecture\nSE: proves it in a demo tenant\nFDE: makes it run in *their* warehouse, with *their* on-call"
    note: "If nobody pages you when gold is stale, you are not the FDE yet."
  - label: "DE-flavored FDE week"
    code: "Mon: shadow their 9am warehouse standup\nTue: map bronze/silver/gold owners + who holds ACCOUNTADMIN\nWed: smallest valuable Job / Dynamic Table in DEV catalog\nThu: security questionnaire + least-privilege grants\nFri: demo the mart + write the handoff runbook"
    note: "Paste into a kickoff note. Adjust names, not the sequence."
  - label: "Not ACCOUNTADMIN forever"
    code: "Week 1: map who holds ACCOUNTADMIN / metastore admin\nWeek 2: least-privilege role for the Job / DT\nHandoff: they page their on-call, not you"
    note: "If nobody pages them when gold is stale, you have not handed off."
quiz:
  - question: "An FDE’s primary job after a DE platform sale is…"
    options:
      - "Rewrite the vendor’s core Spark engine"
      - "Deliver a working integration in the customer’s warehouse/lakehouse and hand it to their on-call"
      - "Only write the original sales deck"
      - "Own ACCOUNTADMIN forever"
    answer: 1
    explanation: "FDE work is customer-environment delivery and honest handoff — not product-core or permanent admin."
  - question: "How is an FDE different from a Solutions Engineer?"
    options:
      - "They are the same title"
      - "SE proves value in a demo; FDE gets to a production-shaped deploy the customer can operate"
      - "FDE only writes blog posts"
      - "SE owns Unity Catalog in prod"
    answer: 1
    explanation: "Demos live in clean tenants. FDE work lives in someone else’s SSO, network, and change control."
  - question: "Which task is most FDE-shaped on a lakehouse engagement?"
    options:
      - "Designing a new Databricks Runtime feature"
      - "Standing up a gold mart Job in the customer’s catalog with their service principal"
      - "Closing a seed-round deck"
      - "Replacing their entire medallion model on week one"
    answer: 1
  - question: "Owning ACCOUNTADMIN for the life of the account means…"
    options:
      - "You are a successful FDE"
      - "You failed the handoff — least privilege + their on-call is the job"
      - "You are a SWE on the runtime"
      - "You are pre-sales SA"
    answer: 1
    explanation: "Permanent admin is a trap, not a trophy."
  - question: "Which week-one artifact is most FDE-shaped?"
    options:
      - "A rewrite of Spark core"
      - "A map of bronze/silver/gold owners and who can GRANT"
      - "A seed-round deck"
      - "A blog post only"
    answer: 1
    explanation: "Discovery of their world, not yours."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# What a Forward Deployed Engineer is

A **Forward Deployed Engineer (FDE)** sits with the customer after the contract is signed and makes a DE/AI platform *work in their world*. You are not a generic staff SWE on their backlog. You are the person who can read a Unity Catalog grant, a Snowflake role hierarchy, and an on-call channel — then ship the smallest thing that is actually used.

This track is **DE/platform flavored**. Warehouse, lakehouse, AI-for-DE, customer deploy. Not a bootcamp for CRUD apps.

## Four neighboring roles

| Role | When they show up | What “done” looks like |
|------|-------------------|------------------------|
| **SWE** (product) | Always | A versioned feature in *your* repo, tested in *your* CI |
| **SA** (solutions architect) | Pre-sale / design | A reference architecture the customer can sign |
| **SE** (solutions engineer) | Demo / POC | A happy path in a clean tenant |
| **FDE** | Post-sale delivery | A deploy *they* can operate: grants, jobs, freshness, runbook |

Overlap is normal. Titles blur. The test is **whose environment and whose pager**.

### Weak signal vs strong signal

- Weak: “I wrote Python at the customer site.” That can be staff-aug SWE.
- Strong: “I scoped a gravel-road gold mart, wired their IdP service principal, survived security review, and left a runbook their on-call used on Saturday.”

## Why DE platforms need FDEs

Customer warehouses are not your sandbox.

- **They** own `ACCOUNTADMIN`, metastore admin, and the VPC.
- **They** have a change window, a PII policy, and a finance owner who thinks “lakehouse” means “cheaper Tableau.”
- **Your** product might be a quality agent, a RAG layer over table docs, or a managed ingestion job. None of that matters until it runs under *their* grants.

An FDE translates product capability into **their bronze → silver → gold**, **their** SSO, **their** cost controls.

## What you do *not* own

- Rewriting their entire medallion model in week one
- Becoming unpaid staff-aug on every dbt model
- Holding production admin after handoff
- Shipping AI that invents table names (see [AI as a DE copilot](/training/ai-data-eng/ai-de-copilot-mindset))

## A week-one picture

You land at **Northwind Logistics** (fictional). They bought your “orders freshness + RAG over pipeline docs” add-on.

1. Sit in the Monday warehouse standup. Who speaks when `fct_orders` is late?
2. Ask who can `USAGE` on `prod.gold` vs who can `CREATE` in `dev`.
3. Refuse the “just give us ACCOUNTADMIN” shortcut.
4. Propose one Job or Dynamic Table that publishes `orders_daily` — not a rewrite of Autoloader.

That is FDE work. The rest of this track is how to do it without becoming the pager.

## Exercises

1. Write four sentences: SWE vs SA vs SE vs FDE for a Snowflake Dynamic Table product.
2. List two tasks you would *decline* as an FDE on week one (boiling the lake, holding prod admin).
3. Open the [AI for Data Engineers](/training/ai-data-eng) track page and note one lesson you will reuse when the customer asks for “just add a chatbot.”

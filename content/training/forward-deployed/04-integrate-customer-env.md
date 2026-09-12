---
slug: "fde-integrate-customer-env"
track: "forward-deployed"
title: "Integrate in someone else’s environment"
description: "APIs, auth, and network constraints you inherit — you do not get a clean tenant."
level: "intermediate"
order: 4
durationMinutes: 50
topics: [general, databricks, snowflake]
objectives:
  - "Inventory auth, network, and API constraints before promising a date"
  - "Prefer customer-owned service principals over shared human admins"
  - "Spot integration promises that die on Private Link or allowlists"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Constraint inventory"
    code: "IdP: Okta / Entra — SCIM? who creates the SP?\nAuth: OAuth / PAT / key pair — who rotates?\nNetwork: Private Link, IP allowlist, no public bucket\nAPI: warehouse REST, Jobs API, partner ingest — whose quota?\nSecrets: their manager; our repo has names only"
    note: "If any line is 'TBD' on the SOW date, the date is fiction."
  - label: "Service principal sketch"
    code: "# Customer creates; FDE never holds human ACCOUNTADMIN\n# Databricks example — they run this\ndatabricks service-principals create --display-name fde-orders-job\n# Then grant on catalog.schema only, not metastore admin"
    note: "Copy the idea, not a live cloud button. They execute in their CLI."
quiz:
  - question: "Why is a customer-owned service principal better than your personal admin login?"
    options:
      - "It is slower, so it feels enterprise"
      - "Rotation, audit, and handoff stay in their IdP when you leave"
      - "It disables SSO"
      - "It skips network rules"
    answer: 1
    explanation: "Handoff fails if prod still runs as the FDE’s user."
  - question: "A partner API works in your SaaS demo but times out in their VPC. First check?"
    options:
      - "Rewrite Spark"
      - "Network path: Private Link, egress, IP allowlists, DNS"
      - "Grant ACCOUNTADMIN"
      - "Delete Unity Catalog"
    answer: 1
  - question: "Secrets in the customer environment should live in…"
    options:
      - "The GitHub README"
      - "Their secret manager / CI secrets, names only in repo"
      - "A Slack screenshot"
      - "The FDE’s laptop notes forever"
    answer: 1
  - question: "Their SSO / network / change control exists so that…"
    options:
      - "You can ignore it and use your demo tenant"
      - "The integration has to live there — a clean vendor demo is not done"
      - "You keep ACCOUNTADMIN"
      - "You skip security review"
    answer: 1
    explanation: "FDE work is in their env."
  - question: "A service principal for a Job should be…"
    options:
      - "A shared human password in Slack"
      - "A dedicated identity with least-privilege grants you documented"
      - "ACCOUNTADMIN"
      - "The intern’s PAT"
    answer: 1
    explanation: "Identities are part of the handoff."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Integrate in someone else’s environment

Demo tenants lie. In a real warehouse you inherit **SSO, network, and change control**. The integration is done when *their* principal can call *their* APIs on *their* path — not when your laptop can.

You will not get `ACCOUNTADMIN`. If someone offers it, treat that as a **risk**, not a shortcut ([RBAC lesson](/training/snowflake/sf-governance-rbac)).

## Three constraint buckets

### 1. Auth

- IdP (Okta, Entra) issues the service principal. **They** create it.
- Warehouse: key-pair or OAuth for Snowflake; Databricks SP + OAuth preferred over a long-lived PAT in a notebook.
- SCIM may already create users. Do not invent a second identity plane.
- Rotation is their policy. Your job is to **not** be the person who holds the only key.

See [Python config & secrets](/training/python/python-config-and-secrets) for the 12-factor habit: env names in git, values in a manager.

### 2. Network

Classic FDE surprise: the partner REST API and the cloud bucket are **fine in the POC** and **dead in prod**.

Inventory before you promise a date:

- Private Link / private endpoints to storage
- IP allowlists on the warehouse or API gateway
- Egress from the Job cluster / warehouse (can it reach *your* SaaS?)
- DNS names that only resolve inside their VPC

If the answer is “we will figure out networking later,” the go-live date is a wish.

### 3. APIs and quotas

- Jobs API, SQL Statement API, partner ingest, webhooks
- Who owns rate limits? Who sees 429s?
- Idempotency: retries will happen ([idempotent writers](/training/python/python-idempotent-writers))

Write the **caller** (their SP), the **endpoint**, and the **retry** on the one-pager.

## A worked example

Northwind wants your quality agent to `POST` failed DQ rows to their incident tool and to `MERGE` flags into `prod.gold.orders_daily`.

| Check | POC | Their prod |
|-------|-----|------------|
| Auth | Your user PAT | Their SP via OAuth, no PAT in notebooks |
| Network | Public HTTPS | Allowlist + no public bucket |
| Write scope | You have `ALL` on a sandbox catalog | `MODIFY` on one gold table |
| Secrets | `.env` on a laptop | CI + secret manager |

The FDE plan is the **prod column**, rehearsed in DEV ([zero-copy clone lab](/training/snowflake/sf-zero-copy-clone-dev) or a `dev` catalog).

## What you say in the kickoff

“I need a service principal, a DEV catalog, and a network path written down. I do not need metastore admin. If any of those three is missing, we do not pick a Friday demo date.”

## Exercises

1. Fill the constraint inventory for a customer who uses Entra + Databricks + a private ADLS account.
2. List three reasons a human FDE login is a bad prod identity.
3. Sketch the retry/idempotency note you would attach to a partner `POST` that files DQ incidents.

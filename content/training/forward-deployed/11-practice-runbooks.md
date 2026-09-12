---
slug: fde-practice-runbooks
track: forward-deployed
title: "Practice — runbooks and handoff checklists"
description: "More FDE practice: paste-ready runbook stubs, rollback notes, and demo fences. Copy into a ticket — no live customer deploy on this page."
level: intermediate
order: 11
durationMinutes: 25
topics: [general, databricks, snowflake]
objectives:
  - "Write a one-page runbook with owner, signal, first check, rollback"
  - "Fence a demo so it cannot touch prod gold"
  - "Hand off without keeping ACCOUNTADMIN"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "orders_daily runbook stub"
    code: "Service: orders_daily gold\\nOwner (customer): platform-oncall\\nSignal: Job late > 15m or row_count = 0\\nFirst check: bronze file count for the window, then silver MERGE metrics\\nRollback: previous gold partition / Time Travel — not DROP\\nSecrets: their vault — FDE does not keep the password"
    note: "Paste into a ticket. Adjust names. No live deploy here."
  - label: "Demo fence"
    code: "Catalog: dev / sandbox only\\nCompute: job cluster or XSMALL learn_wh — auto-terminate\\nData: SAMPLE / local lab grain, not prod PII\\nDo not: MERGE gold, GRANT ACCOUNTADMIN, print tokens"
    note: "Demos die in clean tenants. FDE work still needs a written fence."
  - label: "Handoff box"
    code: "Done when:\\n1. Customer SP runs the Job / Task\\n2. Runbook linked from their wiki\\n3. Our admin roles revoked\\n4. Next on-call drill scheduled"
    note: "If you still hold ACCOUNTADMIN, you have not handed off."
quiz:
  - question: "A runbook’s first check should be…"
    options:
      - "DROP gold so we can start clean"
      - "A named signal (lateness, zero rows) and the next layer to inspect"
      - "A request for the customer password in Slack"
      - "A %sh on this site"
    answer: 1
    explanation: "Signals and layers. You do not need their password in chat."
  - question: "Why fence a stakeholder demo to DEV / SAMPLE?"
    options:
      - "Prod MERGE makes the slide prettier"
      - "A demo that can write gold is an incident waiting for an audience"
      - "Unity Catalog forbids DEV"
      - "Snowflake has no SAMPLE"
    answer: 1
    explanation: "Demos are disposable. Gold is not."
  - question: "Handoff is complete when…"
    options:
      - "You keep ACCOUNTADMIN “just in case”"
      - "Their identity runs the Job and your standing admin is gone"
      - "The sales deck is updated"
      - "The local lab writes to their warehouse"
    answer: 1
    explanation: "FDE success is their on-call, not your leftover grants."
---

FDE practice is **writing**. There is no live customer workspace on this page. Copy the stubs into a ticket or wiki.

## Runbook shape

Owner. Signal. First check. Rollback that is **not** `DROP`. Secrets stay in **their** vault.

## Demo fence

If a laptop notebook can `MERGE` prod gold, the demo is already too wide. Use DEV + SAMPLE (or this site’s local labs for SQL shape).

## Exercises

1. Fill the runbook stub for a Snowflake Dynamic Table mart.
2. Write a demo fence for a Databricks Job walkthrough.
3. List four boxes that must be true before you leave ACCOUNTADMIN.

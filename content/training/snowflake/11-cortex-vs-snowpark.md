---
slug: sf-cortex-vs-snowpark
track: snowflake
title: "Cortex vs Snowpark decision guide"
description: "When to call a Cortex function from SQL, when to push DataFrames with Snowpark, and when plain SQL still wins."
level: intermediate
order: 11
durationMinutes: 35
topics: [snowflake, python]
objectives:
  - "Pick SQL vs Snowpark vs Cortex for a DE task"
  - "Avoid collect() and unbounded COMPLETE calls"
  - "Point to existing practice lessons instead of a new /practice route"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Decision snapshot"
    code: "Plain SQL:     joins, MERGE, DTs, DQ\nSnowpark:      Python graph that must push down\nCortex SQL:    text already next to rows (COMPLETE/SENTIMENT/…)\nChat agent:    tool-calling draft — you still run SQL"
    note: "Functions and DataFrames are not a live simulator on this site."
  - label: "Cortex stays in-warehouse"
    code: "SELECT order_id, SNOWFLAKE.CORTEX.SENTIMENT(note) AS score\nFROM analytics.silver.order_notes\nLIMIT 20;"
    note: "Batch LIMIT first. Treat scores as hints."
quiz:
  - question: "Use a Cortex function instead of Snowpark when…"
    options:
      - "You need to .collect() a billion rows to a laptop"
      - "The work is a named text function next to warehouse rows"
      - "You want to disable RBAC"
      - "You are replacing Dynamic Tables"
    answer: 1
    explanation: "Cortex functions are SQL-shaped. Snowpark is for DataFrame programs that stay lazy."
  - question: "Calling .collect() on a huge Snowpark frame…"
    options:
      - "Keeps all compute in Snowflake optimally"
      - "Pulls rows to the client — can OOM"
      - "Creates a clone"
      - "Is required for every MERGE"
    answer: 1
    explanation: "Stay lazy. Write tables in-warehouse."
---

Decision guide — not a new tool catalog. Practice snippets already live in [Practice with agents & Cortex functions](/training/ai-data-eng/ai-de-practice-agents). Snowpark syntax lives in [Snowpark Python](/training/snowflake/sf-snowpark-python).

## Pick one

| Job | Reach for | Not this |
|-----|-----------|----------|
| Incremental MERGE, DT mart, DQ | SQL | Cortex |
| Multi-step Python transforms that should push down | Snowpark DataFrame | `to_pandas()` of the lake |
| Sentiment / summarize / extract on a column | Cortex function | Pasting 10k notes into chat |
| Incident write-up, tool plan | Chat + named tools | `COMPLETE` as your orchestrator |

## Cost and safety

- Cortex: tokens + warehouse. `LIMIT`, batch, no PII without policy.
- Snowpark: warehouse like any SQL. `collect()` is the foot-gun.
- SQL: still the default for the orders daily mart.

## Exercises

1. Classify: (a) daily revenue SUM, (b) ticket summarization, (c) a pandas port with window functions. SQL / Snowpark / Cortex?
2. Rewrite a fictional `df.collect()` + local loop into a Snowpark `group_by` or SQL.
3. Open the Cortex Shortcuts pack and star one tip that is **not** COMPLETE.

---
slug: ai-de-practice-nonsf-agents
track: ai-data-eng
title: "Practice with generic agents & Databricks Assistant"
description: "Tool-calling practice that is not Snowflake Cortex: generic warehouse tools and a Databricks Assistant-shaped prompt you can paste today."
level: beginner
order: 8
durationMinutes: 30
topics: [databricks, general]
objectives:
  - "Write a tool-calling plan that names tools and JSON args (no Cortex required)"
  - "Shape a Databricks Assistant / notebook-agent prompt with evidence steps"
  - "Keep the same guest progress model — no /practice simulator"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Generic tool call — inspect_job_run"
    code: "You are a data-engineering agent (not Snowflake-specific).\n\nGoal: Explain why the orders_daily job ran 3x longer today.\n\nAvailable tools:\n- list_job_runs(job_name, hours)\n- inspect_job_run(run_id)\n- sample_table(fqn, limit)\n- explain_query(sql)\n\nPlan:\n1. Call list_job_runs(job_name=\"orders_daily\", hours=48)\n2. Pick the slow run_id vs the previous success\n3. Call inspect_job_run(run_id=...)\n4. If a SQL task dominates, call explain_query\n\nConstraints: no secrets, no DROP, cite the next tool call.\nOutput format:\n- Thought\n- Tool call (name + JSON args)\n- Expected evidence"
    note: "Paste into Claude, Copilot Chat, Grok, or a workspace assistant. You still run the tool."
  - label: "Databricks Assistant-shaped"
    code: "You are Databricks Assistant in a repo-backed notebook.\n\nContext: Unity Catalog table main.silver.orders, Job orders_daily, Photon on.\nTask: Draft Spark SQL to rebuild gold.orders_daily (event_date, revenue, order_cnt) for paid orders.\n\nDo:\n- Assume catalog.schema.table names\n- Mention Autoloader bronze only as upstream, not as gold\n- List 3 checks in the Spark UI / query profile I should read\n\nDo not:\n- Invent Delta Live Table APIs that are not in scope\n- Ask me to open a /practice route\n- Print tokens or cluster IDs\n\nOutput: SQL + checklist."
    note: "Assistant-shaped: workspace nouns (UC, Job, Spark UI), still untrusted output."
  - label: "Generic warehouse_query tool"
    code: "Tool: warehouse_query\nArgs: { \"sql\": \"<SELECT only>\" }\n\nTask: Count late orders (updated_at >= current_date - 2) in silver.orders.\n\n1. Thought: I need a count, not a dump.\n2. Tool call:\n   warehouse_query({ \"sql\": \"SELECT COUNT(*) AS late_cnt FROM main.silver.orders WHERE updated_at >= CURRENT_DATE - INTERVAL 2 DAYS\" })\n3. After results: say whether gold should be rebuilt."
    note: "Dialect-agnostic tool. Swap main.silver for analytics.silver as needed."
quiz:
  - question: "Generic tool-calling beats plain chat when…"
    options:
      - "You want to skip all review"
      - "You need named tools and JSON args, then you run the call"
      - "You must use Snowflake Cortex or nothing"
      - "You paste production passwords"
    answer: 1
    explanation: "Same mindset as the Cortex lesson — different tools. No vendor lock-in for practice."
  - question: "A Databricks Assistant-shaped prompt should…"
    options:
      - "Invent a new top-level /practice route"
      - "Name UC objects, Jobs, and the checks you will run in Spark UI"
      - "Disable Unity Catalog"
      - "Replace the Start Here doors"
    answer: 1
    explanation: "Assistant-shaped means workspace nouns + evidence. You still verify."
  - question: "Where does Cortex-specific practice live?"
    options:
      - "This lesson only"
      - "The previous lesson — Practice with agents & Cortex functions"
      - "A DuckDB page"
      - "News detail pages"
    answer: 1
    explanation: "This lesson is the non-SF sibling. Cortex cards stay on the prior checkpoint."
  - question: "A Databricks Assistant-shaped tool should be asked to…"
    options:
      - "Grant itself metastore admin"
      - "Explain a notebook error and propose a Spark SQL check you will run"
      - "Disable Unity Catalog"
      - "Push to main"
    answer: 1
    explanation: "Same copilot rule: explain and propose. You run and review."
  - question: "Why practice with a generic agent and a DBX-shaped one?"
    options:
      - "The buttons look different; the ownership rule does not"
      - "Generic agents can hold your PAT safely"
      - "Only Cortex is real AI"
      - "So you can skip quizzes"
    answer: 0
    explanation: "Tool chrome changes. You still own correctness and secrets."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

This is the **non-Snowflake** sibling of [Practice with agents & Cortex functions](/training/ai-data-eng/ai-de-practice-agents). Same guest/local progress. No new `/practice` route, no live runner.

Use this when the warehouse is Databricks, BigQuery, Redshift, or “I only have chat + a SQL editor.”

## Tool-calling (generic)

1. **You** pick the goal and the allowed tools.
2. The agent names a **tool + JSON args**.
3. **You** run it and decide the next check.

Free-form “fix my lakehouse” chat skips step 2. The Try-it cards force the call.

## Databricks Assistant-shaped

Assistants in notebooks know **this catalog, this cluster, this notebook**. A good prompt still:

- States UC names and the Job
- Asks for SQL you can paste
- Demands profile/UI checks
- Forbids secrets and invented APIs

It is not a substitute for the [Autoloader](/training/databricks/dbx-autoloader-ingestion) or [Job capstone](/training/databricks/dbx-capstone-medallion-job) lessons.

## Shortcuts (do not duplicate catalogs)

- [Claude](/shortcuts/claude-anthropic-pack), [Copilot](/shortcuts/github-copilot-pack), [Grok](/shortcuts/grok-xai-pack)
- Cortex pack stays optional: [Snowflake Cortex AI](/shortcuts/snowflake-cortex-ai)

## Guardrails

Treat output as untrusted. Dry-run writes. No tokens in prompts. Same rules as the Cortex practice lesson.

## Exercises

1. Paste the `inspect_job_run` card into chat. Does the reply name a tool and JSON args?
2. Adapt `warehouse_query` to your dialect (`DATEADD` vs `INTERVAL`).
3. Add one tool of your own (`list_tables(catalog, schema)`) to the first prompt — do not invent a live API on this site.

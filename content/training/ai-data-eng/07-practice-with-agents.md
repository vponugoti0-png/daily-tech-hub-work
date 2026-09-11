---
slug: "ai-de-practice-agents"
track: "ai-data-eng"
title: "Practice with agents & Cortex functions"
description: "Treat agents as tool-users, then copy real Snowflake Cortex functions and structured chat prompts you can run today."
level: "beginner"
order: 7
durationMinutes: 25
topics: [snowflake, general]
objectives:
  - "Explain when a warehouse function beats a free-form chat, and when an agent should name a tool"
  - "Copy and adapt Cortex COMPLETE, SUMMARIZE, SENTIMENT, TRANSLATE, and EXTRACT_ANSWER"
  - "Write a structured agent prompt that calls a tool with JSON arguments"
  - "Open existing Shortcuts packs instead of memorizing tip catalogs"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Cortex COMPLETE — incident summary"
    code: |
      SELECT SNOWFLAKE.CORTEX.COMPLETE(
        'llama3.1-70b',
        'Summarize this incident in 2 bullets: ' || incident_text
      ) AS summary
      FROM ops.incidents
      LIMIT 5;
    note: "Strong first Try-it: prompt a Cortex model from SQL next to warehouse rows."
  - label: "Agent tool call — inspect_query_profile"
    code: |
      You are a data-engineering agent.

      Goal: Find why yesterday's orders_daily job scanned ~12x more bytes.

      Available tools:
      - inspect_query_profile(query_id)
      - list_recent_queries(warehouse, hours)
      - sample_table(fqn, limit)

      Plan:
      1. Call list_recent_queries(warehouse="etl_wh", hours=24)
      2. Pick the slowest QUERY_ID
      3. Call inspect_query_profile(query_id=...)
      4. Report bytes scanned, pruning, spill, and the next human check

      Constraints: no secrets, no DROP/UPDATE, cite the next tool call.
      Output format:
      - Thought
      - Tool call (name + JSON args)
      - Expected evidence
    note: "Paste into Claude, Copilot Chat, or Grok. The model should name the tool — you still run it."
  - label: "Cortex SUMMARIZE"
    code: |
      SELECT SNOWFLAKE.CORTEX.SUMMARIZE(ticket_body) AS summary
      FROM support.tickets;
    note: "Quick document or ticket summarization in-warehouse."
  - label: "Cortex SENTIMENT"
    code: |
      SELECT review_id,
             SNOWFLAKE.CORTEX.SENTIMENT(review_text) AS score
      FROM product.reviews;
    note: "Score feedback text. Treat the score as a hint, not a ground-truth label."
  - label: "Cortex TRANSLATE"
    code: |
      SELECT SNOWFLAKE.CORTEX.TRANSLATE(notes, 'fr', 'en') AS notes_en
      FROM crm.notes;
    note: "Normalize multi-language notes before downstream quality checks."
  - label: "Cortex EXTRACT_ANSWER"
    code: |
      SELECT SNOWFLAKE.CORTEX.EXTRACT_ANSWER(doc_text, 'What is the SLA?')
      FROM knowledge.docs;
    note: "QA over a passage you already stored — not a replacement for search + review."
  - label: "Agent tool call — warehouse_query"
    code: |
      You are a warehouse agent with one read-only tool.

      Tool: warehouse_query
      Args: { "sql": "<SELECT only>" }

      Task: Sentiment-score the last 20 product reviews and list 3 negative themes.

      1. Thought: I need scores, then themes.
      2. Tool call:
         warehouse_query({
           "sql": "SELECT review_id, SNOWFLAKE.CORTEX.SENTIMENT(review_text) AS score FROM product.reviews QUALIFY ROW_NUMBER() OVER (ORDER BY review_id DESC) <= 20"
         })
      3. After results: cluster negative scores into themes. No raw PII in the write-up.
    note: "Structured prompt that calls a tool — copy to chat, then run the SQL yourself."
quiz:
  - question: "When does SNOWFLAKE.CORTEX.COMPLETE shine versus a browser chat?"
    options:
      - "When you want to skip all review"
      - "When the prompt should run next to warehouse rows in SQL"
      - "When you need to disable RBAC"
      - "When you paste production passwords"
    answer: 1
    explanation: "COMPLETE is a SQL function — useful when text already lives in the warehouse."
  - question: "What should you do with Cortex or agent output?"
    options:
      - "Merge it unread because the model is official"
      - "Treat it as untrusted: validate, dry-run, and keep humans accountable"
      - "Write it straight to prod tables"
      - "Disable query history so nobody checks"
    answer: 1
    explanation: "Functions and chat assistants draft. You still review writes, PII, and cost."
  - question: "Which Cortex function scores feedback text?"
    options:
      - "TRANSLATE"
      - "EXTRACT_ANSWER"
      - "SENTIMENT"
      - "A brand-new /practice route"
    answer: 2
    explanation: "SENTIMENT returns a score. EXTRACT_ANSWER answers a question over a passage."
---

# Practice with agents & Cortex functions

Agents are useful when they **name a tool and arguments**. Warehouse functions are useful when the text **already lives next to your tables**. This lesson is practice — copy a function, run a structured prompt, then verify.

You do not need a paid account. Progress uses the same guest/local model as every other lesson.

## Agent / tool mindset for DEs

Think of the model as a junior pair, not a warehouse admin.

1. **You** pick the goal and the allowed tools (SQL function, query profile, catalog lookup).
2. The agent proposes a **tool call** with explicit arguments — or you call a Cortex function yourself.
3. **You** run the call, read the evidence, and decide the next check.

Free-form “fix my pipeline” chat skips step 2. Function-as-example practice puts the call on the card so you can copy it.

## Function-as-example cards

The **Try it** boxes and cheat sheet above are the practice cards. Start with **COMPLETE** (chat-style from SQL), then an agent prompt that calls `inspect_query_profile`. After that, copy SUMMARIZE, SENTIMENT, TRANSLATE, and EXTRACT_ANSWER.

Do **not** invent extra Cortex APIs. The full tip catalog already lives in Shortcuts.

## Shortcuts packs (do not duplicate)

Open the existing packs when you want keyboard tips, more prompts, or source links:

- [Snowflake Cortex AI](/shortcuts/snowflake-cortex-ai) — COMPLETE, SUMMARIZE, SENTIMENT, TRANSLATE, EXTRACT_ANSWER, Search
- [Claude (Anthropic)](/shortcuts/claude-anthropic-pack)
- [GitHub Copilot](/shortcuts/github-copilot-pack)
- [Grok (xAI)](/shortcuts/grok-xai-pack)

Browse all packs at [Shortcuts](/shortcuts).

## Guardrails

- Treat model output as **untrusted**. Validate JSON, read every write path, prefer dry-runs.
- Never send secrets, tokens, or real customer PII without policy review.
- Watch warehouse **and** Cortex cost. Batch small `LIMIT`s first.
- Chat agents do not get warehouse credentials in this lesson — you copy the SQL and run it.

## Exercises

1. Copy the **COMPLETE** card into a Snowflake worksheet (or write it by hand). Swap `incident_text` for a synthetic note. What two bullets did you expect?
2. Paste the **inspect_query_profile** agent prompt into Claude, Copilot Chat, or Grok. Check that the reply names a tool and JSON args — not a vague essay.
3. Sketch a two-step pipeline: `TRANSLATE` notes to English, then `SUMMARIZE`. Keep it `SELECT`-only.
4. Open the [Cortex Shortcuts pack](/shortcuts/snowflake-cortex-ai) and star two tips that are **not** already on this page (Search or guardrails).

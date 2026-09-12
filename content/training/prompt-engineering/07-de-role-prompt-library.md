---
slug: pe-de-role-prompt-library
track: prompt-engineering
title: "DE role prompt library (on-call / PR / incident)"
description: "Copy-ready prompts for on-call triage, data-diff PR reviews, and incident write-ups — with constraints and verification asks."
level: beginner
order: 7
durationMinutes: 30
topics: [general]
objectives:
  - "Use a four-line prompt for on-call, PR review, and incidents"
  - "Demand evidence and forbid secrets"
  - "Reuse these cards instead of inventing a /practice chat"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "On-call triage"
    code: "Role: You are a calm data-engineering on-call pair.\nGoal: Rank likely causes for orders_daily being 0 rows for today.\nContext: Silver MERGE + gold daily grain; late overlap 2 days; no cluster IDs.\nConstraints: no secrets, no DROP/UPDATE, list checks I can run.\nOutput format:\n1. Top 3 causes (ranked)\n2. The next query or Job check for each\n3. What would falsify each cause"
    note: "Paste into Claude, Copilot Chat, or Grok. You run the checks."
  - label: "PR / data-diff review"
    code: "Role: You are a staff DE reviewer.\nGoal: Review this sanitized SQL diff for grain, fan-out, and replay safety.\nContext: Shared story is orders → late events → daily revenue mart.\nConstraints: flag SELECT *; flag current-only dim joins; do not invent tables.\nOutput format:\n- Grain verdict\n- Blockers vs nits\n- Tests / counts I should paste in the PR template"
    note: "Attach a sanitized diff only. Pair with the Git PR template lesson."
  - label: "Incident write-up"
    code: "Role: You are writing the incident doc, not the blame doc.\nGoal: Turn my notes into Problem / Impact / Timeline / Checks / Follow-ups.\nContext: Daily revenue mart missed late refunds for 2026-09-10.\nConstraints: no customer PII, no tokens, under 150 words plus a 5-item follow-up list.\nOutput format: those five headings only."
    note: "Good closer: ask what evidence is still missing."
  - label: "On-call first message"
    code: "Role: incident scribe\nGoal: Turn this page into a 5-line timeline + one next check\nContext: Aurora gold_daily_orders is stale; last Job run 02:14 UTC\nConstraints: no secrets, no blame\nOutput: timeline, impact grain, next SELECT"
    note: "Incidents need a grain and a next check — not a novel."
quiz:
  - question: "An on-call prompt should always include…"
    options:
      - "Production passwords so the model can log in"
      - "Goal, context, constraints (no secrets), and the next human check"
      - "A request to disable RBAC"
      - "A new primary nav item"
    answer: 1
    explanation: "Same four-line skeleton as lesson 1 — specialized for ops."
  - question: "When reviewing a data PR with AI…"
    options:
      - "Merge unread if the model says LGTM"
      - "Ask it to judge grain and fan-out, then you still run counts"
      - "Paste the warehouse key"
      - "Skip the PR template"
    answer: 1
    explanation: "AI drafts the review. You own the merge."
  - question: "These prompts replace…"
    options:
      - "The Start Here 3-door"
      - "Nothing in nav — they are lesson cards you copy"
      - "Unity Catalog"
      - "CERT_PATH tracks"
    answer: 1
    explanation: "Library, not a product surface. Training already has the route."
  - question: "A PR-review prompt should ask the model to…"
    options:
      - "Approve the PR automatically"
      - "List grain risks, secret leaks, and missing tests — you still decide"
      - "Rewrite history on main"
      - "Post to Slack as you"
    answer: 1
    explanation: "The model drafts a review. You own the merge."
  - question: "Why keep a library of role prompts instead of one mega-prompt?"
    options:
      - "Mega-prompts always win"
      - "On-call, PR, and incident asks need different constraints and formats"
      - "Libraries are required by Snowflake"
      - "So you can paste prod keys once"
    answer: 1
    explanation: "Different jobs, different fences. Reuse the skeleton; swap the role."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

A **role library**, not a chatbot product. Same four-line skeleton as [Ask better questions](/training/prompt-engineering/pe-ask-better-questions): Goal, Context, Constraints, Output format.

Guest-usable. Copy into any chat. Treat output as untrusted.

## When to use which card

| Situation | Card | You still do |
|-----------|------|----------------|
| Gold is empty / late | On-call triage | Run the ranked checks |
| SQL/dbt PR | PR / data-diff review | Paste counts in the [PR template](/training/git/git-pr-templates-data-diffs) |
| After the fire | Incident write-up | File the follow-ups |

For warehouse tool-calling (named tools + JSON), use the AI-for-DE practice lessons — Cortex and [generic / Databricks Assistant](/training/ai-data-eng/ai-de-practice-nonsf-agents).

## Extra constraints worth pasting

- Dialect: Spark SQL vs Snowflake
- Grain: `order_id` vs `event_date`
- “If you are unsure, ask one question instead of guessing keys”

## Exercises

1. Rewrite a vague “why is revenue down?” ask into the on-call card (invent a stack).
2. Add a constraint: “no customer emails in the incident doc.”
3. Star two related Shortcuts tips instead of growing this page into a catalog.

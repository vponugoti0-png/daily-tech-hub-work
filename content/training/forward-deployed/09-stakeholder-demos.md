---
slug: "fde-stakeholder-demos"
track: "forward-deployed"
title: "Stakeholder demos and writing"
description: "Show the mart, the cost, and the on-call path — in words a non-engineer will forward."
level: "intermediate"
order: 9
durationMinutes: 40
topics: [general]
objectives:
  - "Plan a demo for VP Finance vs platform DE without changing the grain"
  - "Write a half-page note a non-engineer can forward"
  - "Avoid jargon dumps and hero-laptop demos"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Demo spine (12 minutes)"
    code: "1 min:  grain — one row per event_date\n3 min:  gold table + yesterday’s revenue (their BI)\n3 min:  Job/DT run + freshness metric\n2 min:  what it costs (this job only)\n2 min:  who is paged + runbook step 1\n1 min:  what is next (highway) and what is out"
    note: "If you need a second laptop to 'make it work,' you are not demoing."
  - label: "Forwardable note"
    code: "What shipped: orders_daily in prod.gold (1 row / day)\nHow we know: freshness < 2h; Job green\nWhat it costs: warehouse X, auto-suspend 60s\nWho owns it: #data-oncall (not the vendor)\nWhat we will not do next week: rewrite every domain"
    note: "No acronyms you have not already said aloud."
  - label: "Demo grain"
    code: "Show: DEV catalog, one gold table, one number they already argue about\nSay: owner, refresh, what we will not do this sprint\nDo not: live-edit prod or invent a metric"
    note: "Demos are scoped truth, not theater."
quiz:
  - question: "A VP Finance demo should lead with…"
    options:
      - "Spark UI internals"
      - "The gold grain, yesterday’s number, freshness, and who owns the pager"
      - "Your résumé"
      - "A live ACCOUNTADMIN grant"
    answer: 1
  - question: "Writing that non-engineers will forward is usually…"
    options:
      - "A 20-page architecture novel"
      - "A half-page: shipped, proof, cost, owner, out-of-scope"
      - "A Slack emoji only"
      - "Raw Spark explain plans"
    answer: 1
  - question: "If the Job is red on demo day you should…"
    options:
      - "Fake the screenshot from DEV and hope"
      - "Show the failure, the runbook step, and the recovery — honesty is the demo"
      - "Grant ACCOUNTADMIN live"
      - "Cancel and never write the note"
    answer: 1
  - question: "A stakeholder demo should use…"
    options:
      - "A metric you invented that morning"
      - "A grain they already fight about, on data they recognize"
      - "ACCOUNTADMIN as the hero role"
      - "A surprise prod write"
    answer: 1
    explanation: "Credibility is their number, not yours."
  - question: "Writing after a demo matters because…"
    options:
      - "Slides expire; a written grain + owner + next check survives the meeting"
      - "FDE work is only verbal"
      - "Tickets are banned"
      - "You should not leave artifacts"
    answer: 0
    explanation: "Write it down. That is the handoff seed."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Stakeholder demos and writing

FDEs who demo **Spark internals** to a VP, or **slide poetry** to a platform DE, lose the room. Same gravel-road object. Different altitude.

You are not pitching a new product. You are proving **`orders_daily` is theirs to operate**.

## Two rooms, one grain

| Room | They care about | You show |
|------|-----------------|----------|
| **VP Finance / ops** | The number, when it is late, what it costs | BI tile + freshness + one cost line |
| **Platform DE / AE** | Grants, Job graph, retry | DEV→prod path + runbook step 1 |

Do not change the grain between rooms. If gold is one row per `event_date` in the [shared capstone](/training/sql/sql-shared-capstone-checklist), say that sentence twice.

## Twelve-minute spine

1. **Grain** — “One row per day of paid revenue. If we join items without aggregating, the number doubles.”
2. **Their BI** — yesterday’s tile, not your laptop notebook.
3. **The Job or Dynamic Table** — last run, not a live refactor.
4. **Cost** — this warehouse / this Job, auto-suspend. No estate-wide lecture.
5. **Pager** — channel + step 1 of the runbook.
6. **Out** — highway items you will not start Monday.

If the Job is red, **that is the demo**: failure class, runbook, recovery. Faking a screenshot is how you inherit the pager forever.

## Writing they will forward

Champions forward **half a page**. They delete novels.

Template (cheat sheet): shipped / proof / cost / owner / will-not.

Rules:

- First sentence is the object name they already use
- Define one jargon term or skip it (“Dynamic Table” → “a warehouse object that keeps this table fresh”)
- No vendor adjectives (“world-class,” “AI-powered”)
- Link the runbook; do not paste secrets

Pair with [DE role prompt library](/training/prompt-engineering/pe-de-role-prompt-library) if you draft with AI — then rewrite like a human who will be quoted in a steering email.

## Anti-patterns

- Hero laptop with uncommitted notebook cells
- A new grain invented for the slide
- “Phase 2 is everything else” with no kill criteria
- Live-granting admin to unblock a demo

## Exercises

1. Write the 12-minute spine for a Databricks Job demo to VP Finance.
2. Rewrite this sentence for a non-engineer: “We enabled AQE skew join with Photon on the silver MERGE.”
3. Draft the forwardable note after a *failed* demo that you recovered in 10 minutes.

---
slug: git-pr-templates-data-diffs
track: git
title: "PR templates for data diffs"
description: "A pull-request template that makes grain, row-count diffs, and late-data risk visible before merge."
level: intermediate
order: 5
durationMinutes: 20
topics: [git, sql]
objectives:
  - "Fill a data-diff PR template (grain, counts, overlap)"
  - "Show what evidence reviewers should demand"
  - "Link the shared capstone scorecard without new nav"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "PR template (drop in .github/pull_request_template.md)"
    code: "## Summary\n- Grain changed? (old → new)\n- Tables: bronze / silver / gold\n\n## Data diff\n- Row counts (before → after) for 2 dates\n- Duplicate key query (must be 0)\n- Late overlap days: __\n\n## Risk\n- [ ] Idempotent replay\n- [ ] No secrets / PII in fixtures\n- [ ] Cost / warehouse note\n\n## Capstone scorecard\n- [ ] Shared orders → daily revenue checks (if this PR is that story)"
    note: "Reviewers read this before the SQL. Empty checkboxes are a fail."
  - label: "Fetch + rebase before the data-diff PR"
    code: "git fetch origin\ngit rebase origin/main"
    note: "Play remotes in Git Play Lab. Push stays simulated — no GitHub network."
  - label: "Count diff sketch"
    code: "SELECT event_date, COUNT(*) AS cnt, SUM(amount) AS revenue\nFROM gold.orders_daily\nGROUP BY 1\nORDER BY 1;"
    note: "Paste before/after for the backfill window — not the whole history if it is huge."
quiz:
  - question: "A data PR should always state…"
    options:
      - "Only the Jira emoji"
      - "Grain, row-count/revenue diffs, and replay safety"
      - "The warehouse password"
      - "A new /practice URL"
    answer: 1
    explanation: "SQL diffs hide fan-out. Counts and grain belong in the template."
  - question: "If the duplicate-key query returns rows…"
    options:
      - "Merge anyway — CI is green on lint"
      - "Do not merge; silver is not at order_id grain"
      - "Delete the template"
      - "Force-push main"
    answer: 1
    explanation: "The shared capstone fails if silver keys collide."
---

Data diffs are not app diffs. A 20-line SQL change can double revenue. Make that visible. **Git Play Lab** on this page starts at remotes: fetch the teammate silver MERGE, rebase your gold branch, then write the template.

## Template

Drop this in `.github/pull_request_template.md` (or your host's equivalent):

```markdown
## Summary
- Grain changed? (old → new)
- Tables: bronze / silver / gold

## Data diff
- Row counts (before → after) for 2 dates
- Duplicate key query (must be 0)
- Late overlap days: __

## Risk
- [ ] Idempotent replay
- [ ] No secrets / PII in fixtures
- [ ] Cost / warehouse note

## Capstone scorecard
- [ ] Shared orders → daily revenue checks
```

The scorecard lives at [Shared capstone checklist](/training/sql/sql-shared-capstone-checklist) — still not a header nav item.

## What reviewers do

1. Read grain. If gold is no longer one row per `event_date`, stop.
2. Compare counts for a quiet day and a late-data day.
3. Run (or read CI output of) the uniqueness query.
4. Check the write is replay-safe (`MERGE` / partition overwrite / DT refresh).

## Exercises

1. Fill the template for a fictional PR that adds a 2-day overlap to `orders` silver.
2. Write the duplicate-key query for `order_id`.
3. Add one optional checkbox your team cares about (freshness SLA or region grain).

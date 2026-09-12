---
slug: "ai-de-review-changes"
track: "ai-data-eng"
title: "Review AI-assisted changes"
description: "Checklist for PRs and notebooks that include AI-generated edits."
level: "beginner"
order: 6
durationMinutes: 8
topics: [git, general]
objectives: [Apply a practical review checklist, Call out risks in comments, Keep humans accountable for merges]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "AI PR checklist"
    code: "- Dialect correct?\n- Idempotent writes?\n- Secrets absent?\n- Tests/dry-run?\n- Lineage impact noted?"
    note: "You own the merge. Green CI on a tiny sample is not a skip-review card."
  - label: "Review comment template"
    code: "Risk: write path uses INSERT without a merge key\nAsk: what happens on retry?\nBlocker: no — but add a dry-run or LIMIT proof"
    note: "Call the risk, the question, and whether it blocks. Humans stay accountable."
quiz:
  - question: "Before merging AI-touched SQL that writes data…"
    options:
      - "Skip review if tests are green on a tiny sample only — wait, still read write paths"
      - "Never read it"
      - "Disable audits"
      - "Always force-push main"
    answer: 0
    explanation: "Even with tests, read write paths and dialect carefully."
  - question: "Who is accountable for a merged AI-assisted change?"
    options:
      - "The author/reviewers"
      - "Only the model"
      - "Random internet users"
      - "Nobody"
    answer: 0
---

# Review AI-assisted changes

## Checklist

- Correct dialect and APIs  
- Safe writes (idempotent, scoped)  
- No secrets  
- Tests or dry-run evidence  
- Clear description of AI help in the PR  

## Exercises

1. Review a fictional diff that uses Snowflake `UPDATE SET *` — reject or fix.
2. Write a PR note template that discloses AI assistance.

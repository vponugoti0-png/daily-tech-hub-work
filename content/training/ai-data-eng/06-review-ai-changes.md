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
    code: "- Dialect correct?\\n- Idempotent writes?\\n- Secrets absent?\\n- Tests/dry-run?\\n- Lineage impact noted?"
  - label: "AI-diff checklist"
    code: "- Grain still named?\n- Any secret or %sh credential?\n- Tests updated for the new branch?\n- Destructive DDL previewed?"
    note: "Review the diff like a teammate wrote it — because you will on-call it."
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
  - question: "An AI patch adds a default of 0 for amount. That is risky because…"
    options:
      - "Zero is always correct"
      - "It invents revenue when the landing was NULL"
      - "Ints cannot be 0"
      - "DuckDB forbids 0"
    answer: 1
    explanation: "NULL means unknown. Zero-filling lies in gold."
  - question: "Who is on the hook if an AI-authored MERGE overwrites the wrong key?"
    options:
      - "The model vendor’s pager"
      - "You and your review process"
      - "Nobody — it was automated"
      - "The laptop manufacturer"
    answer: 1
    explanation: "Ownership does not transfer to the model. Review writes like any other PR."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

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

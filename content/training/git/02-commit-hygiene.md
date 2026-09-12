---
slug: git-commit-hygiene
track: git
title: Commit hygiene for data PRs
description: Atomic commits, fixups, and messages that make warehouse changes auditable.
level: beginner
order: 2
durationMinutes: 15
topics: [git]
objectives:
  - Write actionable commit messages
  - Use fixup/autosquash before review
  - Keep secrets out of history
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Atomic commit"
    code: "git commit -m \"feat(marts): rebuild late-arriving orders for last 2 days\""
    note: "Say what changed and why. Run it in Git Play Lab below."
  - label: "Undo the last commit (relative ref)"
    code: "git reset --hard HEAD~1"
    note: "Drops a bad .env commit in this lab. Do not reset shared main at work."
  - label: "One grain per commit"
    code: "feat(orders): reject notes.json in landing glob\n\nWhy: glob('*.json') picked up sidecars and fan-out gold."
    note: "Subject + why. Not “fix stuff”. Play the hygiene level in Git Play Lab."
quiz:
  - question: "Which commit message best fits a dbt incremental change?"
    options:
      - "update stuff"
      - "feat(marts): rebuild late-arriving orders for last 2 days"
      - "asdf"
      - "WIP"
    answer: 1
    explanation: "Say what changed and why so warehouse audits and reviews stay clear."
  - question: "You accidentally staged a .env with credentials. First safe step?"
    options:
      - "Push then fix later"
      - "Leave it; gitignore will hide it from history"
      - "git rm --cached the file, add to .gitignore, and rotate the credentials"
      - "Amend after force-pushing to main"
    answer: 2
  - question: "A useful analytics commit message names…"
    options:
      - "Only “wip”"
      - "The grain or contract you changed and why"
      - "The warehouse password"
      - "A random SHA"
    answer: 1
    explanation: "Future you will bisect this."
  - question: "Mixing a schema change and a dashboard color in one commit is bad because…"
    options:
      - "Git forbids two files"
      - "Bisect and revert cannot isolate the breaking change"
      - "dbt cannot compile"
      - "PRs cannot have diffs"
    answer: 1
    explanation: "Hygiene is for the next incident, not aesthetics."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Commit hygiene for data PRs

The **Git Play Lab** on this page starts on an atomic-commit level. Relative refs (`HEAD~1`) show up when you need to drop a leaked warehouse key.

## Message style

```
feat(marts): add late-arriving order repair model

Rebuilds last 2 days of facts so BI matches finance.
```

## Fixup workflow

```bash
git commit --fixup=<sha>
git rebase -i --autosquash origin/main
```

## Secrets

Never commit `.env`, private keys, or Snowflake key pairs. Use `git rm --cached` immediately if you slip—and rotate credentials.

## Exercises

### Exercise 1
Rewrite `update stuff` into a proper message for a dbt incremental change.

### Exercise 2
List files you would add to `.gitignore` for a Databricks+Python repo.

## Cheat sheet

| Goal | Command |
|------|---------|
| Amend message | `git commit --amend` |
| Soft undo | `git reset --soft HEAD~1` |
| Untrack secret | `git rm --cached <file>` |

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

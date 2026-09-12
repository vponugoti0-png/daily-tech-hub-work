---
slug: git-rebase-vs-merge
track: git
title: Rebase vs merge for analytics repos
description: Choose history strategies that keep dbt/SQL/Python PRs reviewable.
level: beginner
order: 1
durationMinutes: 20
topics: [git]
objectives:
  - Know when to rebase personal branches
  - Avoid rebasing shared history
  - Resolve conflicts with intent
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Update a personal branch"
    code: "git fetch origin\ngit rebase origin/main"
    note: "Rebase your feature branch before the PR. Never rewrite shared history."
  - label: "Abort / continue"
    code: "git rebase --abort\n# or, after fixing conflicts:\ngit add -u && git rebase --continue"
    note: "Conflicts in SQL often mean grain changed — re-read the model contract."
  - label: "Shared branch: merge"
    code: "git checkout release/analytics\ngit merge origin/main"
    note: "Long-lived shared branches merge. git pull --rebase there hurts teammates."
quiz:
  - question: "When is rebasing onto main usually appropriate?"
    options:
      - "On a shared long-lived release branch many people push to"
      - "On your personal feature branch before opening a PR"
      - "After the PR is already merged to main"
      - "Only when force-pushing to main"
    answer: 1
    explanation: "Rebase personal branches for a linear review; never rewrite shared history."
  - question: "Why avoid git pull --rebase on a shared release branch?"
    options:
      - "It is slower than merge"
      - "It rewrites commits others may already have, causing painful force-push conflicts"
      - "It deletes remote tags"
      - "It disables CI"
    answer: 1
---

# Rebase vs merge for analytics repos

## Default recommendation

- **Personal feature branches:** rebase onto `main` before PR for a linear review.
- **Shared long-lived branches:** merge to avoid rewriting others' commits.

```bash
git fetch origin
git rebase origin/main
```

## Conflict mindset

Conflicts in SQL models often mean grain or column contracts changed—don't blindly accept either side; re-read the model contract.

## Exercises

### Exercise 1
Explain why `git pull --rebase` on a shared release branch can hurt teammates.

### Exercise 2
Practice: create a conflict intentionally in a scratch repo and resolve it.

The structured **Cheat sheet** and **Try it** boxes above are the copyable commands. Paste them into your repo — no in-browser git runtime.

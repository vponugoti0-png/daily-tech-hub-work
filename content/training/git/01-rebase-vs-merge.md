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
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Rebase a personal branch"
    code: "git fetch origin\ngit rebase origin/main"
    note: "Personal branches only. Play rebase hygiene in Git Play Lab — no GitHub push."
  - label: "Merge on a shared branch"
    code: "git checkout main\ngit merge feat/orders"
    note: "Shared release history: merge, do not rebase teammates."
  - label: "Play Lab first"
    code: "# Personal branch (Play Lab / your clone)\ngit fetch origin\ngit rebase origin/main\n# Shared release: merge, do not rebase teammates"
    note: "No GitHub push from this page. No practice VM."
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
  - question: "Force-pushing a rebased personal branch is…"
    options:
      - "Required on main"
      - "OK only if nobody else based work on those commits — still prefer --force-with-lease"
      - "How you update prod gold"
      - "Banned in all cases including your laptop"
    answer: 1
    explanation: "Lease protects teammates. Never force-push main."
  - question: "Merge vs rebase on a dbt PR: default here is…"
    options:
      - "Rebase shared release branches"
      - "Rebase your personal branch for a linear review; merge shared history"
      - "Rewrite main nightly"
      - "Skip git entirely"
    answer: 1
    explanation: "Reviewable personal history. Honest shared history."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Rebase vs merge for analytics repos

Practice the graph in **Git Play Lab** on this page (`#lab`): rebase a personal gold branch onto main, or merge onto a shared release. In-browser only — no practice VM.

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

## Cheat sheet

| Action | Command |
|--------|---------|
| Update branch | `git rebase origin/main` |
| Abort | `git rebase --abort` |
| Continue | `git rebase --continue` |

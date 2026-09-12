---
slug: git-play-lab
track: git
title: "Git Play Lab — commit tree & sandbox CLI"
description: "In-browser git model (Learn Git Branching–style) for DE work: branch, commit, merge, rebase, remotes mock, undo. Not a Practice VM."
level: beginner
order: 0
durationMinutes: 25
topics: [git]
objectives:
  - "Read a commit graph: HEAD, branches, origin/* tracking refs"
  - "Pass a level by running real-enough git commands in the sandbox CLI"
  - "Know this is Product A (client model) — Practice VM / real git is out of scope"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Commit on the current branch"
    code: "git commit -m \"feat(marts): add orders_daily grain\""
    note: "This lab has no index. commit grows the tree immediately."
  - label: "Personal dbt branch"
    code: "git checkout -b feat/orders-daily\ngit commit -m \"feat(marts): late events on orders_daily\""
    note: "Name the grain. Rebase this branch; merge only shared history."
  - label: "Update from the mock remote"
    code: "git fetch\ngit rebase origin/main"
    note: "origin is a same-origin mock. Nothing leaves the browser."
quiz:
  - question: "Git Play Lab runs commands…"
    options:
      - "On a disposable Linux VM with real git"
      - "In the browser against a fake commit graph (no shell, no public remotes)"
      - "By SSHing to GitHub"
      - "Only after you paste an access token"
    answer: 1
    explanation: "Product A is client-only. Practice VM (B) is out of scope."
  - question: "When should you rebase in this lab’s DE default?"
    options:
      - "On a shared long-lived release branch many people push to"
      - "On your personal feat/orders-daily branch onto updated main"
      - "On main after the PR merged"
      - "Never — always merge main into the feature"
    answer: 1
    explanation: "Personal branches rebase for a linear review. Shared branches merge."
  - question: "A teammate pushed tests to origin/main. Your local main is stale. Honest first step?"
    options:
      - "git push --force origin main"
      - "git fetch, then merge or rebase onto origin/main"
      - "Delete .git and re-clone from github.com inside the lab"
      - "Wait for a Practice VM"
    answer: 1
    explanation: "Fetch updates tracking refs. Then FF/merge or rebase. The lab’s origin is a mock."
---

Git Play Lab is Aurora’s answer to [Learn Git Branching](https://learngitbranching.js.org/) — **DE-flavored**, guest-friendly, and honest.

## What this is

- A **visual commit tree** plus a **sandbox CLI**.
- A **fake, real-enough git model** in JavaScript. `commit`, `branch`, `merge`, `rebase`, `fetch`/`pull`/`push` (mock `origin`), and `reset` all move graph nodes.
- **Leveled goals** with a goal tree: you pass when refs match the checklist.

## What this is not

- Not a disposable VM. Not `git` on a server. Not a real GitHub remote.
- **Practice VM (B) is out of scope.** If you type `ls` or `git clone https://…` the CLI will say so.

## Lesson loop

1. **Cheat sheet** — copy a command (or type it).
2. **Practice** — Run in the lab until the goal tree / level goals go mint.
3. **Quiz** — then mark the checkpoint. Guest progress saves on this device (`stepIndex` on a passed level; Complete is still yours to click).

Open a level, type the commands, watch HEAD and `origin/main` move. That is the whole product.

# Git Play Lab (Product A)

**Audience:** Product, Frontend, QA, Security  
**Date:** 2026-09-12  
**Status:** Stamped A — shipped in-app  
**Practice VM (B):** out of scope. Do not add a disposable VM, server-side shell, or real `git`.

## What shipped

In-browser **commit tree + sandbox CLI** on the Git track (`/training/git/git-play-lab#lab` and every Git lesson). Client-side JavaScript model — same guest-progress pattern as the DuckDB SQL labs.

| Peer | What we took | What we did not copy |
|------|----------------|----------------------|
| [Learn Git Branching](https://learngitbranching.js.org/) | Visual graph, levels, goal tree, type-to-run CLI | No jQuery toy, no “coming soon”, DE copy (dbt/SQL PR hygiene) |

## Levels

1. Land a mart commit  
2. Branch a dbt model (`feat/orders-daily`)  
3. Merge the mart slice  
4. Rebase a personal branch  
5. Fetch the mock remote  
6. Undo a secret commit (`reset`)

Lesson loop: **cheat sheet → practice → quiz**. Passing a level writes `stepIndex: 1` via existing `upsertLessonProgress` (localStorage + `POST /api/progress` when signed in). It does **not** mark the lesson complete.

## Constraints (honored)

- No new Backend session APIs. Progress shape unchanged (`track` + `slug` + `stepIndex`).
- No secrets. `origin` is `mock://aurora/git-play-lab` (same-origin mock). `git clone https://…` is refused.
- **CSP:** no change. The lab is DOM + SVG + in-memory JS. No WASM, no workers, no extra `connect-src`. Security: leave `next.config.ts` CSP as-is unless a future wasm git port needs `wasm-unsafe-eval` (already present for DuckDB).
- No Practice VM / real git sandbox.

## Honest chrome

Badges: **In-browser model** · **Product A · no VM**. Body copy states there is no shell and no public push. Git TryIt cards link **Run in Git Play Lab** — they do not say “Coming soon · live Run”.

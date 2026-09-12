---
slug: "ai-de-tools-workflow"
track: "ai-data-eng"
title: "AI tools in the DE workflow"
description: "Claude, Copilot, Grok, and warehouse assistants — when to use which."
level: "beginner"
order: 5
durationMinutes: 8
topics: [general]
objectives: [Match tools to chat vs in-editor vs in-warehouse tasks, Use Shortcuts packs for commands and features, Stay policy-compliant at work]
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Tool fence"
    code: "IDE chat: draft + explain\nPR bot: list risks, do not merge\nWarehouse copilot: SELECT only until you review\nNever: paste tokens into a generic web chat"
    note: "Pick the tool that already has your repo context — still review."
quiz:
  - question: "Inline code completion while editing a notebook is closest to…"
    options:
      - "GitHub Copilot-style assist"
      - "Only email newsletters"
      - "Vacuuming a warehouse"
      - "DNS"
    answer: 0
  - question: "Warehouse-native assistants (Cortex / Databricks Assistant) shine when…"
    options:
      - "You need help next to your SQL and catalog context"
      - "You want to avoid all review"
      - "You need to disable RBAC"
      - "You paste private keys"
    answer: 0
  - question: "A generic web chat is a poor place to…"
    options:
      - "Ask how COUNT(*) differs from COUNT(col)"
      - "Paste a service principal secret to “test connectivity”"
      - "Rewrite a four-line prompt"
      - "Request a quiz on NULLs"
    answer: 1
    explanation: "Secrets in a generic chat are a leak. Use a secret manager, not a prompt."
  - question: "When is an in-IDE assistant higher-leverage than a fresh web chat?"
    options:
      - "When it can see the file you are editing and the test you just ran"
      - "When you want to hide the PR"
      - "When you need to rotate keys"
      - "Never — web chat is always better"
    answer: 0
    explanation: "Repo context beats re-pasting files. You still own the diff."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# AI tools in the DE workflow

| Need | Try |
|------|-----|
| Long reasoning / tutoring | Claude-style chat |
| Inline code in the editor | Copilot-style |
| Fast Q&A / exploration | Grok-style chat |
| SQL next to warehouse context | Cortex / Databricks Assistant |

Open **Shortcuts** for Claude, Copilot, and Grok packs (keyboard, prompts, features).

## Exercises

1. Pick one real task and choose a tool category intentionally.
2. Skim one AI Shortcuts pack and star two tips.

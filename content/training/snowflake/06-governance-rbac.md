---
slug: sf-governance-rbac
track: snowflake
title: "RBAC, roles & data governance"
description: "Role hierarchy, future grants, masking policies, and least privilege."
level: intermediate
order: 6
durationMinutes: 35
topics: [snowflake, general]
objectives:
  - "Design role hierarchies"
  - "Apply masking for PII"
  - "Use future grants for new objects"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Least privilege sketch"
    code: "-- Educational copy (not executed here)\nGRANT USAGE ON DATABASE analytics TO ROLE aurora_analyst;\nGRANT SELECT ON VIEW analytics.paid_orders TO ROLE aurora_analyst;\n-- Not: GRANT ACCOUNTADMIN TO everyone"
    note: "Roles own privileges. Users get roles. ACCOUNTADMIN is not a daily driver."
quiz:
  - question: "Analysts typically should…"
    options:
      - "Own ACCOUNTADMIN daily"
      - "Use read roles on curated schemas"
      - "Share passwords"
      - "Disable MFA"
    answer: 1
  - question: "Analysts should usually get…"
    options:
      - "ACCOUNTADMIN"
      - "USAGE + SELECT on the views/marts they need — not CREATE on raw"
      - "The ability to disable Time Travel"
      - "A shared password in Slack"
    answer: 1
    explanation: "Least privilege. Views are a grant surface."
  - question: "Why not use ACCOUNTADMIN for worksheets?"
    options:
      - "It cannot run SELECT"
      - "Blast radius — one bad DML or grant becomes an incident"
      - "It disables warehouses"
      - "It is slower"
    answer: 1
    explanation: "Break-glass only."
  - question: "A role hierarchy helps because…"
    options:
      - "You can hide grants from query history"
      - "You grant once to a functional role and assign users to it"
      - "It replaces MFA"
      - "It stores PATs"
    answer: 1
    explanation: "Functional roles > per-user snowflakes (pun intended)."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# RBAC, roles & data governance

Hierarchy: `SYSADMIN` / custom `TRANSFORMER` / `ANALYST`. Never day-to-day as `ACCOUNTADMIN`.

Masking policies on email/SSN columns; row access policies when needed.

## Exercises

1. Draft roles for loader, transformer, analyst.
2. Write a conceptual masking policy for `email`.

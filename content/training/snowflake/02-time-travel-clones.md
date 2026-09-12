---
slug: sf-time-travel-clones
track: snowflake
title: "Time Travel, Fail-safe & Zero-Copy Clones"
description: "Recover from bad loads, clone environments cheaply, and understand retention."
level: intermediate
order: 2
durationMinutes: 35
topics: [snowflake]
objectives:
  - "Query historical data with AT/BEFORE"
  - "Clone tables/databases for dev"
  - "Know retention vs Fail-safe boundaries"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Time travel"
    code: "SELECT * FROM t AT (TIMESTAMP => '...') "
  - label: "Clone"
    code: "CREATE TABLE t_dev CLONE t_prod;"
  - label: "Version delta stand-in"
    code: "SELECT v1.order_id, v1.amount AS v1, v2.amount AS v2\nFROM sf_orders_history v1\nJOIN sf_orders_history v2 ON v1.order_id = v2.order_id\nWHERE v1.as_of_version = 1 AND v2.as_of_version = 2;"
    note: "DuckDB stand-in for AT (TIMESTAMP). Snowflake syntax differs."
quiz:
  - question: "Zero-copy clone is valuable because…"
    options:
      - "It always duplicates all bytes immediately"
      - "It creates instant copies with deferred storage growth"
      - "It deletes Time Travel"
      - "It disables RBAC"
    answer: 1
  - question: "Time Travel lets you…"
    options:
      - "Skip RBAC"
      - "Query a prior table version after a bad UPDATE — within retention"
      - "Attach a remote catalog from this lab"
      - "Disable Fail-safe"
    answer: 1
    explanation: "Recovery tool. Not a substitute for preview SELECTs."
  - question: "Zero-copy clone is useful for DEV because…"
    options:
      - "It copies every micro-partition immediately at full cost"
      - "It is a metadata pointer until you write — cheap isolated DEV"
      - "It disables Time Travel"
      - "It is a live share to customers"
    answer: 1
    explanation: "Clone, then write in the clone. Do not clone prod to a role you do not trust."
  - question: "Fail-safe is…"
    options:
      - "The same as a clone you can SELECT anytime"
      - "A support-led recovery window after Time Travel — not a sandbox"
      - "A Stream offset"
      - "A warehouse size"
    answer: 1
    explanation: "Do not plan nightly DEV on Fail-safe."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Time Travel, Fail-safe & Zero-Copy Clones

```sql
CREATE TABLE analytics.orders_clone CLONE analytics.orders;
SELECT * FROM analytics.orders AT (OFFSET => -60*60);
```

Use clones for sticky integrations tests without full reloads.

## Exercises

1. Recover a table to pre-bad-MERGE state conceptually.
2. When do you need Fail-safe support vs Time Travel DIY?

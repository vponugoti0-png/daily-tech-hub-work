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
    code: "SELECT * FROM analytics.gold.orders_daily AT (TIMESTAMP => '2026-09-11 12:00:00');"
    note: "AT/BEFORE reads a prior table version. Retention is not forever — Fail-safe is support-only."
  - label: "Clone"
    code: "CREATE TABLE analytics.dev.orders_daily CLONE analytics.gold.orders_daily;"
    note: "Zero-copy: metadata now, bytes later as the clone diverges."
  - label: "Lab current-state check"
    code: "SELECT COUNT(*) AS orders FROM sf_orders;"
    note: "Lab-safe current count. AT/CLONE syntax stays on a real account."
quiz:
  - question: "Zero-copy clone is valuable because…"
    options:
      - "It always duplicates all bytes immediately"
      - "It creates instant copies with deferred storage growth"
      - "It deletes Time Travel"
      - "It disables RBAC"
    answer: 1
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

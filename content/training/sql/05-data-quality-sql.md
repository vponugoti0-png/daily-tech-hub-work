---
slug: sql-data-quality
track: sql
title: "Data quality checks in SQL"
description: "Assertions for nulls, uniqueness, referential integrity, and freshness SLAs."
level: beginner
order: 5
durationMinutes: 30
topics: [sql, general]
dialect: mixed
objectives:
  - "Encode DQ tests as SQL"
  - "Fail pipelines on critical assertions"
  - "Track freshness"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "DQ gate shape"
    code: "SELECT COUNT(*) AS null_amount\nFROM aurora_orders\nWHERE status = 'paid' AND amount IS NULL;\n-- Gate fails if null_amount > 0 before you MERGE to gold."
    note: "Checks are SELECTs with a threshold. Do not skip them on retries."
quiz:
  - question: "A uniqueness check on order_id should return…"
    options:
      - "Rows that violate uniqueness"
      - "The warehouse size"
      - "Random samples only"
      - "Nothing ever"
    answer: 0
  - question: "A useful uniqueness check on aurora_orders is…"
    options:
      - "SELECT DISTINCT amount"
      - "COUNT(*) vs COUNT(DISTINCT order_id) — they must match at order grain"
      - "LIMIT 1"
      - "ORDER BY RANDOM()"
    answer: 1
    explanation: "If those counts diverge, you have duplicate keys."
  - question: "When should a DQ gate block the MERGE?"
    options:
      - "Never — gold should always update"
      - "When a named contract breaks (NULL amounts on paid, dup keys, fan-out)"
      - "When the dashboard is ugly"
      - "Only on weekends"
    answer: 1
    explanation: "Gates protect gold. A stale mart beats a wrong mart."
  - question: "COUNT(promo_code) as a completeness metric means…"
    options:
      - "How many orders exist"
      - "How many rows have a non-NULL promo — not the same as COUNT(*)"
      - "How many customers exist"
      - "A warehouse credit count"
    answer: 1
    explanation: "COUNT(col) skips NULLs. Say which you mean."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Data quality checks in SQL

> **Dialects in this lesson:** duplicate check is ANSI; freshness uses Snowflake `DATEADD` and a Spark SQL equivalent.

```sql
-- Dialect: ANSI
-- duplicates
SELECT order_id, COUNT(*) AS c
FROM fct_orders
GROUP BY 1
HAVING COUNT(*) > 1;
```

```sql
-- Dialect: Snowflake
-- freshness (stale if max updated_at older than 6 hours)
SELECT MAX(updated_at) < DATEADD(hour, -6, CURRENT_TIMESTAMP()) AS stale
FROM fct_orders;
```

```sql
-- Dialect: Spark SQL
SELECT MAX(updated_at) < CURRENT_TIMESTAMP() - INTERVAL 6 HOURS AS stale
FROM fct_orders;
```

## Exercises

1. Write a null check for required columns.
2. Write an orphan check: facts whose dim keys are missing.

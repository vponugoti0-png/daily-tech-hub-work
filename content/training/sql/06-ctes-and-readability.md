---
slug: sql-ctes-readability
track: sql
title: "CTEs, readability, and modular SQL"
description: "Structure complex pipelines with CTEs, naming, and staged logic reviewers can follow."
level: beginner
order: 6
durationMinutes: 25
topics: [sql]
dialect: ANSI
objectives:
  - "Name CTEs by business meaning"
  - "Avoid nested spaghetti subqueries"
  - "Document assumptions inline"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Named grain CTE"
    code: "WITH paid AS (\n  SELECT order_id, customer_id, amount\n  FROM aurora_orders\n  WHERE status = 'paid'\n)\nSELECT c.region, SUM(p.amount) AS revenue\nFROM paid p\nJOIN aurora_customers c ON c.customer_id = p.customer_id\nGROUP BY c.region;"
    note: "One CTE, one grain. Nested mystery SQL is not modular."
quiz:
  - question: "Good CTE names look like…"
    options:
      - "a1, a2, a3"
      - "eligible_orders, enriched_orders"
      - "temp, temp2"
      - "x"
    answer: 1
  - question: "A CTE should usually…"
    options:
      - "Hide five grains in one alias"
      - "Name one grain so the next SELECT can join safely"
      - "Replace the need for tests"
      - "Run faster than the same subquery always"
    answer: 1
    explanation: "Readability first. Some engines inline CTEs — do not assume a materialize."
  - question: "Why prefer a CTE over a nested 80-line subquery?"
    options:
      - "CTEs cannot have bugs"
      - "Reviewers can test paid vs grouped in isolation"
      - "Subqueries are illegal"
      - "CTEs disable WHERE"
    answer: 1
    explanation: "Modular SQL is reviewable SQL."
  - question: "WITH x AS (SELECT DISTINCT amount FROM …) is a smell when…"
    options:
      - "You already named a unique key"
      - "You are using DISTINCT to hide a grain bug instead of grouping measures"
      - "amount is numeric"
      - "The CTE name is short"
    answer: 1
    explanation: "DISTINCT is not a mart. GROUP BY the grain, SUM the measure."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# CTEs, readability, and modular SQL

> **Dialect:** ANSI SQL.

```sql
-- Dialect: ANSI
WITH eligible_orders AS (
  SELECT * FROM orders WHERE status = 'paid'
),
enriched AS (
  SELECT o.*, c.region
  FROM eligible_orders o
  JOIN dim_customer c ON c.customer_id = o.customer_id AND c.is_current
)
SELECT region, SUM(amount) FROM enriched GROUP BY 1;
```

## Exercise

Refactor a 3-level nested subquery into named CTEs.

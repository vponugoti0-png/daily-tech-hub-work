---
slug: dbx-silver-patterns-case
track: databricks
title: "Silver cleaning — LIKE, IN, CASE"
description: "Pattern filters and label expressions for silver: LIKE / IN / BETWEEN, table aliases, and CASE status buckets — not a notebook stored-procedure course."
level: beginner
order: -4
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Choose LIKE, IN, or BETWEEN instead of an OR-chain when cleaning bronze → silver"
  - "Alias tables so a reviewer can see bronze vs silver grain"
  - "Bucket statuses with CASE as an expression in the same SELECT"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "LIKE / IN / BETWEEN on silver"
    code: "SELECT order_id, region, status, amount\nFROM silver_orders\nWHERE region LIKE 'w%'\n   OR status IN ('ok', 'returned')\n   OR amount BETWEEN 15 AND 50\nORDER BY order_id;"
    note: "% is any suffix. BETWEEN is inclusive. Run it in the local practice lab."
  - label: "Aliases that name the layer"
    code: "SELECT s.order_id,\n       s.region AS silver_region,\n       s.amount AS order_amount\nFROM silver_orders AS s\nWHERE s.status = 'ok';"
    note: "s is a table alias. silver_region is honest — it is the column on silver, not a Unity Catalog tag."
  - label: "CASE status buckets"
    code: "SELECT\n  order_id,\n  status,\n  amount,\n  CASE\n    WHEN status = 'ok' AND amount >= 80 THEN 'large_ok'\n    WHEN status = 'ok' THEN 'ok'\n    WHEN status = 'returned' THEN 'returned'\n    ELSE 'other'\n  END AS status_bucket\nFROM silver_orders\nORDER BY amount DESC;"
    note: "CASE is a column expression. It does not change the row count by itself and it is not a Delta constraint."
quiz:
  - question: "LIKE 'w%' on region matches…"
    options:
      - "Only the exact code w"
      - "Regions that start with w (west, …)"
      - "Every region, always"
      - "NULL regions"
    answer: 1
    explanation: "% is a wildcard for any suffix. NULL never LIKE-matches. Spark SQL is case-sensitive unless you use lower() / ilike."
  - question: "amount BETWEEN 15 AND 50 is…"
    options:
      - "Exclusive of 15 and 50"
      - "Inclusive of both ends"
      - "The same as ZORDER"
      - "Illegal on DATE columns"
    answer: 1
    explanation: "BETWEEN is inclusive. ZORDER is file layout. DATE BETWEEN is also inclusive — document the grain."
  - question: "Why alias silver_orders as s and amount as order_amount?"
    options:
      - "Aliases make Photon faster"
      - "Short table names plus honest column names keep joins and grain readable"
      - "CASE requires aliases"
      - "IN does not work without aliases"
    answer: 1
    explanation: "Aliases are documentation. Photon does not care. A column named amount after a join is ambiguous."
  - question: "CASE status buckets in silver are…"
    options:
      - "A Delta constraint that blocks writes"
      - "A column expression for cleaning — reviewers can see the rule"
      - "A Job cluster setting"
      - "A Unity Catalog privilege"
    answer: 1
    explanation: "CASE is an expression, not a stored procedure."
  - question: "LIKE 'w%' on region…"
    options:
      - "Is a regex engine"
      - "Matches a suffix after w — useful, but a typed region column + IN is clearer for marts"
      - "Updates gold"
      - "Ignores case in every dialect always"
    answer: 1
    explanation: "Patterns for exploration. Contracts prefer IN / = on typed dims."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Silver is where bronze strings become **contracts**. LIKE / IN / CASE are expressions in one SELECT — not a Python UDF you cannot test.

The **local practice lab** runs these shapes against `silver_orders`. Copy Spark-only functions (`ilike`, `try_cast`) into a workspace after you prove the grain here.

## LIKE, IN, BETWEEN

Prefer `status IN ('ok', 'returned')` over a long OR chain. `BETWEEN` is inclusive. `LIKE 'w%'` is a prefix — it is not a partition prune by itself (still write `region = 'west'` when you know the value).

## CASE as a column

```sql
CASE
  WHEN status = 'ok' AND amount >= 80 THEN 'large_ok'
  WHEN status = 'ok' THEN 'ok'
  ELSE 'other'
END AS status_bucket
```

Keep buckets in the same SELECT so a reviewer can see the grain. Do not hide them in a notebook widget.

## Exercises

1. Bucket silver amounts into small / mid / large with CASE and run it in the lab.
2. Rewrite an OR chain of two regions as `IN`.
3. Explain why a Python UDF that lowercases `status` is a last resort vs `lower(status)` in Spark SQL.

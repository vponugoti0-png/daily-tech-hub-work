---
slug: sf-patterns-aliases-case
track: snowflake
title: "LIKE, IN, BETWEEN, aliases, CASE"
description: "Pattern filters and label expressions for warehouse reviews: LIKE / ILIKE, IN, BETWEEN, table aliases, and CASE buckets — not stored procedures."
level: beginner
order: -4
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Choose LIKE, IN, or BETWEEN instead of an OR-chain of equalities"
  - "Alias tables and output columns so a reviewer can see the grain"
  - "Bucket measures with CASE as an expression in the same SELECT"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "LIKE / IN / BETWEEN on promos"
    code: "SELECT order_id, promo_code, amount\nFROM sf_orders\nWHERE promo_code LIKE 'F%'\n   OR promo_code IN ('VIP', 'FLASH')\n   OR amount BETWEEN 15 AND 50\nORDER BY order_id;"
    note: "% is any suffix. BETWEEN is inclusive. Run it in the local practice lab. Snowflake also has ILIKE for case-insensitive match."
  - label: "Aliases that name the grain"
    code: "SELECT o.order_id,\n       c.region AS customer_region,\n       o.amount AS order_amount\nFROM sf_orders AS o\nJOIN sf_customers AS c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid';"
    note: "o / c are table aliases. customer_region is a column alias — keep it honest."
  - label: "CASE size buckets"
    code: "SELECT\n  order_id,\n  amount,\n  CASE\n    WHEN amount >= 80 THEN 'large'\n    WHEN amount >= 20 THEN 'mid'\n    ELSE 'small'\n  END AS size_bucket\nFROM sf_orders\nWHERE status <> 'pending'\nORDER BY amount DESC;"
    note: "CASE is a column expression. It is not a stored procedure and it does not change the row count by itself."
quiz:
  - question: "LIKE 'F%' on promo_code matches…"
    options:
      - "Only the exact code F"
      - "Codes that start with F (FALL26, FLASH, …)"
      - "Codes that contain F anywhere, always"
      - "NULL promos"
    answer: 1
    explanation: "% is a wildcard for any suffix. NULL never LIKE-matches. Use ILIKE only when you mean case-insensitive."
  - question: "amount BETWEEN 15 AND 50 is…"
    options:
      - "Exclusive of 15 and 50"
      - "Inclusive of both ends"
      - "The same as clustering"
      - "Illegal with DATE columns"
    answer: 1
    explanation: "BETWEEN is inclusive. Clustering is file layout. DATE BETWEEN is also inclusive — document the timezone/date grain."
  - question: "Why alias sf_orders as o and amount as order_amount?"
    options:
      - "Aliases make the warehouse faster"
      - "Short table names plus honest column names keep joins and grain readable"
      - "CASE requires aliases"
      - "IN does not work without aliases"
    answer: 1
    explanation: "Aliases are documentation. Credits do not care. A column named amount after a join is ambiguous."
---

LIKE / IN / CASE are **expressions** for reviewers — not a JavaScript UDF you cannot test.

The **local practice lab** runs these shapes against `sf_orders`. Copy Snowflake-only helpers (`ILIKE`, `TRY_TO_NUMBER`) into a worksheet after you prove the grain here.

## LIKE vs ILIKE

`LIKE 'F%'` is prefix match. `ILIKE` ignores case. NULL never matches. Prefer `promo_code IN ('VIP', 'FALL26')` when the set is closed.

## CASE as a column

Keep buckets in the same SELECT. Do not hide them in a Snowsight filter tile that reviewers cannot see in git.

## Exercises

1. Bucket `sf_orders.amount` into small / mid / large with CASE and run it in the lab.
2. Rewrite an OR chain of two statuses as `IN`.
3. Explain when you would use `ILIKE` vs `LOWER(promo_code) LIKE …`.

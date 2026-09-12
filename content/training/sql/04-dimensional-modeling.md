---
slug: sql-dimensional-modeling
track: sql
title: "Dimensional modeling essentials"
description: "Facts, dims, grain, SCD2, and star schemas that analytics teams can trust."
level: intermediate
order: 4
durationMinutes: 45
topics: [sql]
dialect: ANSI
objectives:
  - "Declare grain before writing SQL"
  - "Model SCD2 dimensions"
  - "Avoid fan-out when joining multiple facts"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Fact vs dim"
    code: "-- Fact (order grain): aurora_orders.order_id, amount, status, order_date\n-- Dim: aurora_customers.customer_id, region, status, signup_date\n-- Do not bury region only inside a comment — join the dim."
    note: "Facts measure. Dims describe. Grain first."
quiz:
  - question: "Grain answers which question?"
    options:
      - "What is one row?"
      - "What is the cluster size?"
      - "What is the BI tool?"
      - "What is the password?"
    answer: 0
  - question: "Putting region on every fact row and also on a customer dim without a key is a smell because…"
    options:
      - "Regions are illegal"
      - "The two copies drift — pick a grain and a key, then join"
      - "Dims cannot store region"
      - "Facts cannot store dates"
    answer: 1
    explanation: "Conformed attributes live on the dim. Facts store keys + measures."
  - question: "A daily revenue mart (order_date, region, revenue) is…"
    options:
      - "A transaction fact at item grain"
      - "An aggregated fact / gold grain you persist on purpose"
      - "A dimension"
      - "A stream offset"
    answer: 1
    explanation: "Gold is a named grain, not a random GROUP BY in a dashboard."
  - question: "Why not join items into a customer-count metric?"
    options:
      - "Joins are slow only"
      - "Item grain fans out customers — COUNT(DISTINCT customer_id) is a patch over a grain bug"
      - "Customers cannot be counted"
      - "SQL forbids DISTINCT"
    answer: 1
    explanation: "Name the grain before the join. DISTINCT is not a model."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Dimensional modeling essentials

> **Dialect:** ANSI SQL (modeling patterns; engine-specific DDL omitted).

**Grain first.** Example: one row per `order_id` in `fct_orders`.

## SCD2 sketch

```sql
-- Dialect: ANSI (conceptual SCD2 columns)
-- valid_from, valid_to, is_current on dim_customer
SELECT *
FROM dim_customer
WHERE customer_id = :id
  AND valid_from <= :as_of
  AND (valid_to IS NULL OR valid_to > :as_of);
```

## Exercises

1. Define grain for a clickstream fact at session vs event level tradeoffs.
2. Write a query to fetch the customer dim version active at order time.

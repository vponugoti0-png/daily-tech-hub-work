---
slug: dbx-spark-sql-performance
track: databricks
title: "Spark SQL performance on DBX"
description: "Partitioning, file sizes, AQE, and Photon-minded habits for faster jobs."
level: advanced
order: 3
durationMinutes: 45
topics: [databricks, pyspark, sql]
objectives:
  - "Target healthy file sizes"
  - "Use predicate pushdown and partition filters"
  - "Read Spark UI for skew/spill"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Filter early"
    code: "SELECT region, COUNT(*) AS n\nFROM silver_orders\nWHERE order_date >= DATE '2026-09-02'\nGROUP BY region\nORDER BY n DESC;"
    note: "Partition-style filter you can run in the local practice lab."
  - label: "Select only the grain"
    code: "SELECT order_id, order_date, region, amount\nFROM silver_orders\nWHERE status = 'ok'\nORDER BY order_date, order_id;"
    note: "Avoid SELECT * on a fact. Name the columns Spark will shuffle."
  - label: "Gold after the filter"
    code: "SELECT order_date, region, orders, revenue\nFROM gold_daily_orders\nWHERE order_date >= DATE '2026-09-02'\nORDER BY order_date, region;"
    note: "Serve the mart; do not re-aggregate bronze in a BI warehouse."
quiz:
  - question: "Countless tiny files usually cause…"
    options:
      - "Faster listings and reads"
      - "Slow listing/planning and poor throughput"
      - "Free Photon"
      - "Automatic SCD2"
    answer: 1
---

# Spark SQL performance on DBX

- Compact small files (`OPTIMIZE`, auto-optimize where appropriate).
- Filter on partitions early.
- Watch skew: salting or AQE skew join hints when needed.
- Prefer DataFrame/SQL expressions over Python UDFs.

## Exercises

1. From a Spark UI screenshot mindset, list signals of skew.
2. Propose a partitioning key for IoT events.

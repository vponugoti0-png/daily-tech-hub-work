---
slug: dbx-lakehouse-fundamentals
track: databricks
title: "Lakehouse fundamentals on Databricks"
description: "Medallion layout, notebooks vs Jobs, and how the lakehouse differs from classic warehouses."
level: beginner
order: 1
durationMinutes: 30
topics: [databricks]
objectives:
  - "Explain bronze/silver/gold responsibilities"
  - "Choose Jobs over ad-hoc notebooks for prod"
  - "Locate Unity Catalog objects"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Medallion counts"
    code: "SELECT layer, COUNT(*) AS row_count\nFROM (\n  SELECT 'bronze' AS layer FROM bronze_orders\n  UNION ALL\n  SELECT 'silver' FROM silver_orders\n  UNION ALL\n  SELECT 'gold' FROM gold_daily_orders\n) t\nGROUP BY layer\nORDER BY layer;"
    note: "Run this in the local practice lab on this page — not a live workspace."
  - label: "Silver quality by status"
    code: "SELECT status, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount\nFROM silver_orders\nGROUP BY status\nORDER BY n DESC;"
    note: "Corrupt bronze rows never make it to silver in this sample set."
  - label: "Gold daily revenue"
    code: "SELECT order_date, region, orders, revenue\nFROM gold_daily_orders\nORDER BY order_date, region;"
    note: "Warehouses serve gold — keep ETL off the BI warehouse."
quiz:
  - question: "Bronze layers typically store…"
    options:
      - "Only executive dashboards"
      - "Raw/lightly cleaned landed data"
      - "Only SCD2 dims"
      - "Secrets"
    answer: 1
---

# Lakehouse fundamentals on Databricks

**Bronze** → raw. **Silver** → cleansed, conformed. **Gold** → business marts.

Use **Databricks Jobs** + versioned code for production; notebooks for exploration.

## Exercises

1. Map 3 of your datasets into medallion layers.
2. List what belongs in Unity Catalog vs DBFS scratch paths.

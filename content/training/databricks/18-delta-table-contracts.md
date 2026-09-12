---
slug: dbx-delta-table-contracts
track: databricks
title: "Delta table contracts and schema"
description: "DE-level DDL for Delta: CREATE TABLE as a grain contract, NOT NULL / generated columns as quality, and why ALTER/DROP on gold needs a rebuild plan."
level: beginner
order: -2
durationMinutes: 25
topics: [databricks, sql]
objectives:
  - "Sketch CREATE TABLE USING DELTA with a named grain"
  - "Treat NOT NULL / CHECK as contracts — Unity Catalog comments are not enforcement"
  - "Know when ALTER / DROP / OPTIMIZE are safe on silver vs dangerous on gold"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Inspect lab table columns"
    code: "SELECT table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'main'\n  AND table_name IN ('bronze_orders', 'silver_orders', 'gold_daily_orders')\nORDER BY table_name, ordinal_position;"
    note: "Read the contract first. The local lab does not run CREATE/ALTER/DROP — copy Delta DDL into a workspace."
  - label: "Catalog objects (day-0 stand-in)"
    code: "SELECT catalog, schema, table_name, layer\nFROM workspace_objects\nORDER BY layer, table_name;"
    note: "Three-level names live in Unity Catalog. A notebook path is not a table."
  - label: "CREATE TABLE USING DELTA (workspace)"
    code: "-- Dialect: Spark SQL / Delta (workspace)\nCREATE TABLE silver.orders (\n  order_id BIGINT,\n  order_date DATE,\n  region STRING,\n  status STRING,\n  amount DECIMAL(12,2)\n)\nUSING DELTA\nPARTITIONED BY (order_date);"
    note: "Grain = one row per order_id. Partition is a prune habit — still write the WHERE. Some workspaces prefer liquid clustering over PARTITIONED BY."
quiz:
  - question: "What does a primary-key-shaped comment on silver.orders.order_id mean for DE review?"
    options:
      - "Delta always enforces it like Postgres"
      - "One row per order_id is the grain — prove it with a uniqueness DQ gate"
      - "The table cannot be dropped"
      - "It creates a Job"
    answer: 1
    explanation: "Delta / UC constraints are uneven. You still need a uniqueness query (or DLT expectation) before gold."
  - question: "You need a new ingested_at column on disposable silver. Safest move?"
    options:
      - "ALTER TABLE … ADD COLUMN on silver, or recreate the table"
      - "DROP the production gold mart first"
      - "OPTIMIZE gold instead"
      - "DELETE without WHERE"
    answer: 0
    explanation: "Silver is replaceable. Add the column or rebuild. Do not practice DDL on gold from a laptop."
  - question: "PARTITIONED BY (order_date) is mainly for…"
    options:
      - "Changing the grain"
      - "Helping the engine prune a date window — still write the WHERE"
      - "Replacing MERGE"
      - "Granting SELECT"
    answer: 1
    explanation: "Partitions (and liquid clustering) support filters you already wrote. They do not invent a predicate."
---

DDL is how you **name the contract**. This is not a catalog of every `CREATE CATALOG` privilege, and it is not a stored-procedure course.

The **local practice lab** inspects `information_schema` plus the day-0 `workspace_objects` map. Run `CREATE TABLE USING DELTA` in a real workspace.

## CREATE TABLE as a contract

```sql
-- Dialect: Spark SQL / Delta (workspace)
CREATE TABLE silver.orders (
  order_id BIGINT,
  order_date DATE,
  region STRING,
  status STRING,
  amount DECIMAL(12, 2)
)
USING DELTA;
```

| Habit | DE reading |
|-------|------------|
| Named columns | New Autoloader fields cannot silently land |
| Comment / PK note | Grain: one row per `order_id` |
| NOT NULL / CHECK | Quality — confirm the runtime enforces it |
| PARTITION / cluster | Prune habit, not a metric |

Unity Catalog **comments** are documentation. Uniqueness still needs a DQ query (see the SQL [data-quality](/training/sql/sql-data-quality) lesson).

## ALTER, DROP, OPTIMIZE

`ALTER TABLE … ADD COLUMN` is how late fields land on silver. `DROP TABLE` on gold needs Time Travel or a Job rebuild. `OPTIMIZE` / vacuum are maintenance — they do not replace a MERGE.

## Exercises

1. Run the information_schema sample and list `gold_daily_orders` columns.
2. Sketch `CREATE TABLE gold.orders_daily` with grain `(order_date, region)`.
3. Write one sentence on when you would `DROP TABLE` silver vs never dropping gold from an all-purpose cluster.

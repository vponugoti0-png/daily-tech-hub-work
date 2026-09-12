---
slug: sql-ddl-constraints
track: sql
title: "Tables, constraints, and indexes"
description: "DE-level DDL: CREATE / ALTER / DROP tables, primary and foreign keys as grain contracts, and indexes as prune habits — not a stored-procedure course."
level: beginner
order: -2
durationMinutes: 25
topics: [sql]
objectives:
  - "Sketch CREATE TABLE for a replaceable staging contract with a primary key"
  - "Treat FOREIGN KEY / NOT NULL / UNIQUE as grain and quality contracts, not decoration"
  - "Know when ALTER / DROP / CREATE INDEX are safe on staging vs dangerous on a mart"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Inspect aurora_* columns (lab)"
    code: "SELECT table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'main' AND table_name LIKE 'aurora%'\nORDER BY table_name, ordinal_position;"
    note: "Read the contract first. The local lab does not run CREATE/ALTER/DROP — copy DDL into your warehouse."
  - label: "Staging table + PK (warehouse)"
    code: "-- Dialect: ANSI-shaped (warehouse)\nCREATE TABLE staging.aurora_orders_delta (\n  order_id     BIGINT PRIMARY KEY,\n  customer_id  BIGINT NOT NULL,\n  order_date   DATE NOT NULL,\n  status       VARCHAR(16) NOT NULL,\n  amount       DECIMAL(12,2),\n  promo_code   VARCHAR(32),\n  CONSTRAINT aurora_orders_delta_fk_customer\n    FOREIGN KEY (customer_id) REFERENCES dim.customer (customer_id)\n);"
    note: "PK = grain. FK = “this key should exist in the dim.” Some warehouses skip enforced FK and check it as a DQ query instead."
  - label: "ALTER / INDEX / DROP discipline"
    code: "-- Dialect: ANSI-shaped (warehouse)\nALTER TABLE staging.aurora_orders_delta ADD COLUMN ingested_at TIMESTAMP;\nCREATE INDEX aurora_orders_delta_date ON staging.aurora_orders_delta (order_date);\n-- DROP TABLE staging.aurora_orders_delta;   -- staging only, never a mart by habit"
    note: "ALTER on staging is cheap. DROP a mart only with a rebuild plan. INDEX/CLUSTER is a prune habit — not a substitute for a date filter."
  - label: "Inspect before ALTER"
    code: "SELECT table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'aurora'\nORDER BY table_name, ordinal_position;"
    note: "This lab does not run DDL. Copy CREATE/ALTER to a warehouse after you read the contract."
quiz:
  - question: "What does PRIMARY KEY mean on staging.aurora_orders_delta.order_id?"
    options:
      - "The column is a timestamp"
      - "One row per order_id is the grain — duplicates are a contract break"
      - "The table cannot be dropped"
      - "It creates a stored procedure"
    answer: 1
    explanation: "A primary key is the uniqueness contract. Warehouses that do not enforce it still need a uniqueness DQ gate."
  - question: "You need a new ingested_at column on a disposable staging table. Safest move?"
    options:
      - "ALTER TABLE … ADD COLUMN on staging, or CREATE OR REPLACE the table"
      - "DROP the production mart first"
      - "CREATE INDEX on the mart instead"
      - "DELETE without WHERE"
    answer: 0
    explanation: "Staging is replaceable. Add the column or rebuild the table. Do not “practice DDL” on gold."
  - question: "CREATE INDEX on order_date is mainly for…"
    options:
      - "Changing the grain"
      - "Helping the engine prune/filter a date window — still write the WHERE"
      - "Replacing PRIMARY KEY"
      - "Granting SELECT"
    answer: 1
    explanation: "Indexes (and warehouse clustering) support filters you already wrote. They do not invent a predicate."
  - question: "Why inspect information_schema before ALTER TABLE?"
    options:
      - "It runs the ALTER for you"
      - "You need the current contract — types, nullability — before you change it"
      - "information_schema is a secret store"
      - "ALTER is illegal"
    answer: 1
    explanation: "DDL is a contract change. Read first, then copy the statement to a warehouse."
  - question: "A UNIQUE constraint on order_id is there to…"
    options:
      - "Speed up RANDOM()"
      - "Protect the grain you named — duplicates fail loud"
      - "Store secrets"
      - "Replace GROUP BY"
    answer: 1
    explanation: "Constraints are tests the warehouse runs. Do not rely on DISTINCT to hide dupes."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

DDL is how you **name the contract**. This is not a catalog of every `CREATE DATABASE` dialect, and it is not a stored-procedure course. You will: create a staging table, constrain the grain, alter it when a column arrives late, index the filter you already use, and drop only what you can rebuild.

The **local practice lab** inspects `information_schema` for the `aurora_*` seed. Run CREATE/ALTER/DROP in a real warehouse.

## CREATE TABLE as a contract

```sql
-- Dialect: ANSI-shaped (warehouse)
CREATE TABLE staging.aurora_orders_delta (
  order_id    BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  order_date  DATE NOT NULL,
  status      VARCHAR(16) NOT NULL,
  amount      DECIMAL(12, 2),
  promo_code  VARCHAR(32)
);
```

| Constraint | DE reading |
|------------|------------|
| `PRIMARY KEY` | Grain: one row per `order_id` |
| `NOT NULL` | Required for the load to be meaningful |
| `UNIQUE` | Alternate key (email, sku) — not a second grain |
| `FOREIGN KEY` | This id should exist in a dim / parent |
| `CHECK` | Cheap allow-list (`status IN ('paid', …)`) when the engine enforces it |

Many lakehouses **do not enforce** FK. You still write the orphan query in the [DQ lesson](/training/sql/sql-data-quality).

## ALTER and DROP

`ALTER TABLE … ADD COLUMN` is how late fields land on staging. `DROP COLUMN` / `DROP TABLE` on a mart needs a rebuild path (Time Travel, clone, or rerun). Prefer `CREATE OR REPLACE` on staging over surgical drops in a job.

## INDEX

`CREATE INDEX … (order_date)` (or warehouse clustering) supports `WHERE order_date BETWEEN …`. It is not a metric. You still write the filter.

## Exercises

1. Run the information_schema sample in the local lab and list the `aurora_orders` columns.
2. Sketch `CREATE TABLE` for `aurora_order_items` with a composite PK `(order_id, sku)` and an FK to `aurora_orders`.
3. Write one sentence on when you would `DROP TABLE` staging vs never dropping `mart.orders_daily` from a laptop.

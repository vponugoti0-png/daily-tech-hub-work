---
slug: sf-ddl-constraints
track: snowflake
title: "Tables, constraints, clustering keys"
description: "DE-level DDL: CREATE / ALTER / DROP tables, PRIMARY KEY as a grain comment, and clustering as a prune habit — not a stored-procedure course."
level: beginner
order: -2
durationMinutes: 25
topics: [snowflake, sql]
objectives:
  - "Sketch CREATE TABLE for a replaceable staging contract with a primary-key comment"
  - "Treat FOREIGN KEY / NOT NULL as grain and quality contracts — Snowflake may not enforce them"
  - "Know when ALTER / DROP / CLUSTER BY are safe on staging vs dangerous on a mart"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Inspect sf_* columns"
    code: "SELECT table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'main' AND table_name LIKE 'sf_%'\nORDER BY table_name, ordinal_position;"
    note: "Read the contract first. The local lab does not run CREATE/ALTER/DROP — copy DDL into your account."
  - label: "Databases & schemas (day-0)"
    code: "SELECT database, schema, object_name, object_type\nFROM sf_account_objects\nORDER BY database, schema, object_name;"
    note: "Snowflake nesting is database.schema.table — not the warehouse name."
  - label: "Staging table + CLUSTER (account)"
    code: "-- Dialect: Snowflake (account)\nCREATE TABLE analytics.staging.orders_delta (\n  order_id     NUMBER PRIMARY KEY,\n  customer_id  NUMBER NOT NULL,\n  order_date   DATE NOT NULL,\n  status       VARCHAR(16) NOT NULL,\n  amount       NUMBER(12,2),\n  promo_code   VARCHAR(32)\n);\nALTER TABLE analytics.staging.orders_delta CLUSTER BY (order_date);"
    note: "PK = grain comment. CLUSTER BY is a prune habit — still write the WHERE. DROP staging only, never a mart by habit."
quiz:
  - question: "What does PRIMARY KEY mean on analytics.staging.orders_delta.order_id?"
    options:
      - "The column is a timestamp"
      - "One row per order_id is the grain — prove it with a uniqueness DQ gate if the engine does not enforce it"
      - "The table cannot be dropped"
      - "It creates a stored procedure"
    answer: 1
    explanation: "Snowflake PK/FK are often informational. You still need a uniqueness query before a Dynamic Table."
  - question: "You need a new ingested_at column on disposable staging. Safest move?"
    options:
      - "ALTER TABLE … ADD COLUMN on staging, or CREATE OR REPLACE the table"
      - "DROP the production mart first"
      - "CLUSTER BY on the mart instead"
      - "DELETE without WHERE"
    answer: 0
    explanation: "Staging is replaceable. Add the column or rebuild. Do not practice DDL on gold."
  - question: "CLUSTER BY (order_date) is mainly for…"
    options:
      - "Changing the grain"
      - "Helping the engine prune/filter a date window — still write the WHERE"
      - "Replacing PRIMARY KEY"
      - "Granting SELECT"
    answer: 1
    explanation: "Clustering supports filters you already wrote. It does not invent a predicate."
  - question: "Clustering keys are…"
    options:
      - "PRIMARY KEY clones"
      - "A storage layout hint for prune-friendly columns — not a uniqueness guarantee"
      - "RBAC roles"
      - "Stream offsets"
    answer: 1
    explanation: "Constraints vs clustering. Do not confuse them."
  - question: "This lab will not CREATE TABLE because…"
    options:
      - "DDL is fictional"
      - "You inspect sf_* columns, then copy CREATE/ALTER to an account"
      - "information_schema is empty"
      - "Warehouses cannot DDL"
    answer: 1
    explanation: "Inspect first."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

DDL is how you **name the contract**. This is not a catalog of every `CREATE DATABASE` privilege.

The **local practice lab** inspects `information_schema` plus the day-0 `sf_account_objects` map. Run CREATE/ALTER/DROP in a real account.

## CREATE TABLE as a contract

```sql
-- Dialect: Snowflake (account)
CREATE TABLE analytics.staging.orders_delta (
  order_id    NUMBER PRIMARY KEY,
  customer_id NUMBER NOT NULL,
  order_date  DATE NOT NULL,
  status      VARCHAR(16) NOT NULL,
  amount      NUMBER(12, 2),
  promo_code  VARCHAR(32)
);
```

| Habit | DE reading |
|-------|------------|
| PRIMARY KEY | Grain comment — confirm enforcement |
| NOT NULL | Required for the load to be meaningful |
| FOREIGN KEY | Often informational — still write the orphan query |
| CLUSTER BY | Prune habit, not a metric |

## ALTER, DROP, Time Travel

`ALTER TABLE … ADD COLUMN` is how late fields land on staging. `DROP TABLE` on a mart needs Time Travel, a clone, or a rebuild. Prefer `CREATE OR REPLACE` on staging.

## Exercises

1. Run the information_schema sample and list `sf_orders` columns.
2. Sketch `CREATE TABLE` for a daily mart with grain `(order_date, region)`.
3. Write one sentence on when you would `DROP TABLE` staging vs never dropping `marts.revenue_by_region` from a worksheet.

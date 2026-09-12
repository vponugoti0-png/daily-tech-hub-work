---
slug: sql-ex-warehouse-ctas
track: sql
title: "CTAS, INSERT SELECT, and procedure mindset"
description: "Select-into / CTAS and INSERT INTO SELECT as warehouse copy habits, plus when a stored procedure is the wrong wrapper."
level: beginner
order: 29
durationMinutes: 20
topics: [sql]
objectives:
  - "Describe SELECT INTO / CREATE TABLE AS as a one-shot table copy"
  - "Use INSERT INTO … SELECT to append a compatible result"
  - "Know what stored procedures are for — and why we keep transforms in SQL/dbt first"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "CTAS (SELECT INTO mindset)"
    code: "CREATE TABLE west_buyers AS\nSELECT customer_id, company, city\nFROM lab_customers\nWHERE region = 'west';"
    note: "Snowflake/DuckDB/Postgres: CTAS. SQL Server often writes SELECT … INTO west_buyers FROM …"
  - label: "INSERT INTO SELECT"
    code: "INSERT INTO west_buyers (customer_id, company, city)\nSELECT customer_id, company, city\nFROM lab_customers\nWHERE region = 'midwest';"
    note: "Append a compatible projection. Column lists keep the contract honest."
  - label: "Procedure wrapper (do not run here)"
    code: "CREATE PROCEDURE refresh_west_buyers()\nBEGIN\n  DELETE FROM west_buyers;\n  INSERT INTO west_buyers\n  SELECT customer_id, company, city\n  FROM lab_customers\n  WHERE region = 'west';\nEND;"
    note: "Mindset only — the local lab rejects CALL / CREATE. Prefer a scheduled SQL file or dbt model."
quiz:
  - question: "CREATE TABLE west_buyers AS SELECT … is closest to…"
    options:
      - "A view that never materializes"
      - "SELECT INTO / CTAS — a real table filled from a query"
      - "An UPDATE of lab_customers"
      - "A stored procedure call"
    answer: 1
    explanation: "CTAS and SELECT INTO persist rows. A view stores the query text, not the snapshot."
  - question: "INSERT INTO mart SELECT … FROM staging is for…"
    options:
      - "Changing column types only"
      - "Appending (or seeding) rows from a query with aligned columns"
      - "Dropping the mart"
      - "Running a Python UDF"
    answer: 1
    explanation: "INSERT SELECT copies a result into an existing table. CTAS creates the table."
  - question: "A stored procedure is a good default for a nightly mart because…"
    options:
      - "It is — always wrap SELECT in CALL"
      - "It is not — prefer versioned SQL / dbt and a scheduler; procs hide lineage"
      - "Procedures are the only way to INSERT SELECT"
      - "Warehouses cannot schedule SQL files"
    answer: 1
    explanation: "Procs exist (Snowflake, SQL Server, Postgres). Analytics teams still version the SQL and schedule it. CALL is not available in this local lab."
---

Copying a result into a table is a warehouse habit: **SELECT INTO** / **CREATE TABLE AS** (CTAS) and **INSERT INTO … SELECT**. Stored procedures wrap those steps in some platforms. The local lab stays SELECT-only — copy these into a worksheet.

## SELECT INTO / CTAS

SQL Server / Access-style “select into a new table”:

```sql
-- Dialect: T-SQL mindset
SELECT customer_id, company, city
INTO west_buyers
FROM lab_customers
WHERE region = 'west';
```

ANSI / Snowflake / Databricks / DuckDB:

```sql
-- Dialect: ANSI CTAS
CREATE TABLE west_buyers AS
SELECT customer_id, company, city
FROM lab_customers
WHERE region = 'west';
```

Both mean: **materialize this query as a table**. Good for a scratch extract or a snapshot. Not a substitute for an incremental MERGE (later DE lessons).

`CREATE OR REPLACE TABLE … AS` is the warehouse rebuild. `CREATE VIEW` is not CTAS — it stores the query, not the rows.

## INSERT INTO SELECT

```sql
INSERT INTO west_buyers (customer_id, company, city)
SELECT customer_id, company, city
FROM lab_customers
WHERE region = 'midwest';
```

The select list must align with the insert columns (count and types). Use this to append a batch; use CTAS when the table does not exist yet.

Preview the payload first — that SELECT **can** run in the local lab:

```sql
SELECT customer_id, company, city
FROM lab_customers
WHERE region = 'west';
```

## Stored procedures (mindset)

A procedure is a named, callable bundle — parameters in, SQL (and sometimes control flow) inside:

```sql
-- Dialect: illustrative, not lab-runnable
CREATE PROCEDURE refresh_west_buyers()
BEGIN
  DELETE FROM west_buyers;
  INSERT INTO west_buyers
  SELECT customer_id, company, city
  FROM lab_customers
  WHERE region = 'west';
END;
```

`CALL refresh_west_buyers()` is blocked in the local lab on purpose. For analytics engineering, prefer a **versioned model** plus a job (dbt, Snowflake task, Databricks job). Reach for a procedure when the platform team already standardizes that wrapper — not to hide a 400-line transform.

## Exercises

1. Write a CTAS for `paid_orders` from `lab_orders` where `status = 'paid'`.
2. Write `INSERT INTO paid_orders SELECT …` for `pending` rows you decide to treat as “open.”
3. In two sentences, when would you refuse to bury that SQL inside a stored procedure?

Covers Select Into, Insert Into Select, and Stored Procedures as warehouse copy habits.

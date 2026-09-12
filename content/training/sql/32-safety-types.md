---
slug: sql-ex-safety-types
track: sql
title: "Injection awareness, hosting, and types"
description: "SQL injection habits, where SQL actually runs, and why data types are a contract — DE security lite."
level: beginner
order: 32
durationMinutes: 20
topics: [sql]
objectives:
  - "Never concatenate untrusted text into SQL — use bind parameters"
  - "Name where the engine lives (managed warehouse vs self-hosted) and what that implies"
  - "Pick types that match the grain (DATE vs TEXT, DECIMAL vs FLOAT)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Unsafe concatenation (do not ship)"
    code: "-- Application anti-pattern\n-- sql = \"SELECT * FROM lab_customers WHERE company = '\" + userInput + \"'\"\n-- Input  x' OR '1'='1  turns the filter into a tautology."
    note: "Illustration only. The local lab is not an HTTP API — still learn the shape of the bug."
  - label: "Safe parameter mindset"
    code: "-- Pseudocode: bind, do not splice\n-- execute(\"SELECT company, city FROM lab_customers WHERE region = ?\", [\"west\"])"
    note: "Warehouse drivers and dbt compiled SQL still should not paste raw user strings into predicates."
  - label: "Types as contract"
    code: "SELECT order_id,           -- INTEGER identity\n       order_date,         -- DATE, not TEXT\n       freight,            -- DECIMAL, not FLOAT, for money\n       status              -- TEXT / ENUM-like, not free INTEGER codes without a map\nFROM lab_orders;"
    note: "Wrong types are silent quality bugs. Hosting does not fix a TEXT date column."
quiz:
  - question: "The injection habit to refuse is…"
    options:
      - "Using DATE literals in a lab SELECT"
      - "Building SQL by concatenating untrusted strings"
      - "Naming columns instead of SELECT *"
      - "Running DuckDB in the browser"
    answer: 1
    explanation: "Bind parameters (or allow-listed identifiers). String-splice SQL is the classic injection path."
  - question: "A managed warehouse vs self-hosted Postgres changes…"
    options:
      - "Whether SELECT needs a FROM clause"
      - "Who patches the engine, how you authenticate, and where backups live"
      - "Whether NULL exists"
      - "Whether GROUP BY is legal"
    answer: 1
    explanation: "Hosting is operations and trust boundary — not a different SELECT keyword. Still parameterize queries."
  - question: "Money-like freight should usually be…"
    options:
      - "FLOAT so fractions stay fuzzy"
      - "DECIMAL / NUMBER with a declared scale"
      - "BOOLEAN"
      - "TIMESTAMP"
    answer: 1
    explanation: "Binary float rounding surprises finance. DECIMAL (or integer cents) is the contract."
---

Safety lite for analytics engineers: **injection**, **hosting**, and **data types**. No lab mutations here — read, quiz, and keep SELECT samples parameter-shaped in real apps.

## Injection

If an app builds SQL like this:

```text
SELECT * FROM lab_customers WHERE company = '<user text>'
```

then a value such as `x' OR '1'='1` can widen the predicate. That is SQL injection: **untrusted text becomes syntax**.

Habits:

1. **Bind parameters** for values (`WHERE region = :region`).
2. **Allow-list** identifiers (table/column names cannot be bound in most drivers — do not take them from the URL).
3. Warehouse user for the app: **least privilege** (SELECT on marts, not CREATE USER).
4. Treat AI-generated SQL as untrusted until reviewed — same as a stranger’s string.

This site’s local lab only runs `SELECT` / `WITH` against a toy seed. That is not an excuse to splice strings in a real service.

## Hosting

| Place | You operate | Typical auth |
|-------|-------------|--------------|
| Managed warehouse (Snowflake, BigQuery, Databricks SQL) | Rarely the VM | Cloud IAM / SSO / key pair |
| Self-hosted Postgres / SQL Server | Patches, disks, backups | Passwords, TLS, firewall |
| In-browser DuckDB (this lab) | Nothing — ephemeral seed | No credentials |

“Hosting” on a 101 syllabus often means “where do I put MySQL.” For DE work it means: **which account runs the query**, where connection strings live (never in a ticket), and who can `DROP`. Managed does not mean public. Self-hosted does not mean safe.

Connection strings, tokens, and `ACCOUNTADMIN` roles stay out of notebooks you share.

## Data types

Types are a contract, not decoration.

| Idea | Prefer | Avoid |
|------|--------|--------|
| Order day | `DATE` | `TEXT` ISO strings you sort lexically |
| Freight / price | `DECIMAL(10,2)` or integer cents | `FLOAT` for money |
| IDs | `INTEGER` / `BIGINT` / UUID | Fuzzy `TEXT` keys without a rule |
| Flags | `BOOLEAN` or a documented `0/1` | `'yes'` / `'YES'` / `'y'` |
| Status | `TEXT` + CHECK, or an enum | Mystery integers |

```sql
SELECT order_id, order_date, freight, status
FROM lab_orders;
```

Cast on purpose (`DATE '2026-09-01'`) when loading. Silent `VARCHAR` everywhere is how late data and “September 9 vs 09” bugs land.

## Exercises

1. Rewrite a spliced `WHERE company = '" + name + "'` as a parameterized sketch.
2. Name three things that change when you move the same SELECT from this lab to a managed warehouse.
3. Pick a type for `unit_price` and defend it in one sentence.

Covers Injection, Hosting, and Data Types — original DE security lite, not a copied quiz bank.

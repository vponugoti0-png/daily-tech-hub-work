---
slug: sql-ex-dml-mutations
track: sql
title: "INSERT, UPDATE, and DELETE"
description: "Mutation mindset for INSERT INTO, UPDATE, and DELETE — copy these; the local lab stays SELECT-only."
level: beginner
order: 23
durationMinutes: 20
topics: [sql]
objectives:
  - "Insert one row or a column-aligned batch without breaking grain"
  - "UPDATE with a WHERE that names the business key"
  - "DELETE as a scoped predicate, never an unbounded table wipe in prod"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "INSERT INTO one customer"
    code: "INSERT INTO lab_customers (customer_id, company, city, region, email)\nVALUES (6, 'Ridge Co-op', 'Boise', 'west', 'joy@ridge.example');"
    note: "Name columns. A missing email is an explicit NULL, not a skipped comma."
  - label: "UPDATE scoped by key"
    code: "UPDATE lab_orders\nSET status = 'paid', freight = 9.10\nWHERE order_id = 103;"
    note: "WHERE on the order key. No WHERE updates every row — a classic incident."
  - label: "DELETE scoped by key"
    code: "DELETE FROM lab_orders\nWHERE order_id = 105\n  AND status = 'cancelled';"
    note: "Two predicates beat a naked DELETE FROM lab_orders."
quiz:
  - question: "Which INSERT lists columns and one new customer?"
    options:
      - "INSERT lab_customers 6, 'Ridge Co-op';"
      - "INSERT INTO lab_customers (customer_id, company, city, region, email) VALUES (6, 'Ridge Co-op', 'Boise', 'west', NULL);"
      - "ADD ROW lab_customers VALUES (6);"
      - "SELECT INTO lab_customers VALUES (6);"
    answer: 1
    explanation: "INSERT INTO table (cols) VALUES (…) is the row-insert shape. SELECT INTO is a copy/CTAS cousin — later lesson."
  - question: "An UPDATE without WHERE…"
    options:
      - "Updates zero rows"
      - "Updates every row in the table"
      - "Is a syntax error in ANSI"
      - "Only updates NULLs"
    answer: 1
    explanation: "Unscoped UPDATE is a full-table write. Always name the business key."
  - question: "Safest DELETE of cancelled order 105?"
    options:
      - "DELETE FROM lab_orders;"
      - "DELETE FROM lab_orders WHERE order_id = 105 AND status = 'cancelled';"
      - "TRUNCATE lab_orders WHERE status = 'cancelled';"
      - "UPDATE lab_orders SET order_id = NULL;"
    answer: 1
    explanation: "Scope by key and status. TRUNCATE empties a table; it is not a row delete."
---

Mutations change tables. The **local practice lab stays SELECT / WITH** — copy these into a warehouse worksheet. Treat them as habits, not buttons on this page.

## INSERT INTO

One row, columns named:

```sql
-- Dialect: ANSI
INSERT INTO lab_customers (customer_id, company, city, region, email)
VALUES (6, 'Ridge Co-op', 'Boise', 'west', 'joy@ridge.example');
```

Batch insert is more `VALUES` tuples, or `INSERT INTO … SELECT` (warehouse CTAS lesson). Column order in the list must match the values. Omitting `email` stores `NULL` if the column allows it.

## UPDATE

```sql
UPDATE lab_orders
SET status = 'paid',
    freight = 9.10
WHERE order_id = 103;
```

`SET` assigns. `WHERE` chooses rows. Preview first:

```sql
SELECT order_id, status, freight
FROM lab_orders
WHERE order_id = 103;
```

That preview **is** something you can run in the local lab.

## DELETE

```sql
DELETE FROM lab_orders
WHERE order_id = 105
  AND status = 'cancelled';
```

Unbounded `DELETE FROM lab_orders` empties the table. `TRUNCATE` is a logging-light empty; it is not a filtered delete. Soft-delete (`SET status = 'void'`) is often kinder to incrementals than a hard delete.

## Exercises

1. Write an `INSERT` for product `15` / `Sky Mug` / `merch` / `16.00` / not discontinued.
2. Write an `UPDATE` that sets Harbor Goods’ email without touching other customers.
3. Write a `DELETE` that removes only discontinued products (`discontinued = 1`).

Covers Insert Into, Update, and Delete as warehouse mutations — lab remains read-only.

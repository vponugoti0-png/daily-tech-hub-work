---
slug: sql-ex-joins-union
track: sql
title: "Aliases, joins, and UNION"
description: "Table aliases plus INNER / LEFT / RIGHT / FULL / self joins and UNION vs UNION ALL on the commerce seed."
level: beginner
order: 27
durationMinutes: 25
topics: [sql]
objectives:
  - "Alias tables so join keys stay readable"
  - "Choose INNER, LEFT, RIGHT, FULL, or a self-join for the question"
  - "Stack compatible selects with UNION ALL (or UNION when you need distinct)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "INNER join + aliases"
    code: "SELECT o.order_id, c.company AS buyer, o.ship_city, o.status\nFROM lab_orders o\nINNER JOIN lab_customers c ON c.customer_id = o.customer_id\nORDER BY o.order_id;"
    note: "o and c are aliases. AS buyer names the output column."
  - label: "LEFT + self-join"
    code: "SELECT e.full_name AS teammate, m.full_name AS manager\nFROM lab_employees e\nLEFT JOIN lab_employees m ON m.employee_id = e.reports_to\nORDER BY e.employee_id;"
    note: "Dana Reyes has no manager — LEFT keeps that row with a NULL manager."
  - label: "UNION ALL stack"
    code: "SELECT company AS label, 'customer' AS kind FROM lab_customers\nUNION ALL\nSELECT product_name, 'product' FROM lab_products\nORDER BY kind, label;"
    note: "UNION ALL keeps duplicates and skips the distinct sort. UNION would collapse twins."
quiz:
  - question: "A LEFT join from employees to managers keeps…"
    options:
      - "Only people who have a manager"
      - "Every employee, with NULL manager columns when reports_to is empty"
      - "Every manager even if they are not in employees"
      - "A cartesian product"
    answer: 1
    explanation: "LEFT preserves the left grain. INNER would drop Dana Reyes."
  - question: "Pick the SQL that is a self-join."
    options:
      - "FROM lab_orders o JOIN lab_customers c ON c.customer_id = o.customer_id"
      - "FROM lab_employees e LEFT JOIN lab_employees m ON m.employee_id = e.reports_to"
      - "FROM lab_orders UNION lab_customers"
      - "FROM lab_products p FULL JOIN lab_products p"
    answer: 1
    explanation: "Same table, two aliases, a hierarchy key. That is the self-join shape."
  - question: "UNION vs UNION ALL when stacking daily incrementals?"
    options:
      - "Always UNION — it is faster"
      - "UNION ALL keeps duplicates and skips the distinct operator"
      - "They are identical"
      - "UNION ALL deletes cancelled rows"
    answer: 1
    explanation: "UNION ALL is the incremental default. Dedup explicitly if you need unique keys."
---

Joins combine tables. Aliases keep the keys readable. `UNION` stacks result sets. Run the orders×customers sample and the employee self-join in the local lab.

This cluster is the foundations twin of the later [DE joins recap](/training/sql/sql-joins-set-logic-recap) — same ideas, commerce seed, exercise-first.

## Aliases

```sql
-- Dialect: ANSI
SELECT o.order_id, c.company AS buyer
FROM lab_orders AS o
INNER JOIN lab_customers AS c
  ON c.customer_id = o.customer_id;
```

Table aliases (`o`, `c`) shorten qualified names. Column aliases (`AS buyer`) name the output. You can write `FROM lab_orders o` without `AS` — both are legal.

## Join family

| Join | Keeps | Commerce use |
|------|--------|----------------|
| `INNER` | Matches only | Paid order + known customer |
| `LEFT` | All left rows | Facts that must survive a missing dim |
| `RIGHT` | All right rows | Rare; rewrite as LEFT with flipped tables |
| `FULL` | Both sides | Reconcile two extracts; unmatched keys go NULL |
| Self-join | A table with itself | Manager / employee, prior-row compares |

```sql
-- RIGHT: customers with or without orders (usually written as LEFT from customers)
SELECT c.company, o.order_id
FROM lab_orders o
RIGHT JOIN lab_customers c ON c.customer_id = o.customer_id;

-- FULL: keys on either side
SELECT COALESCE(c.customer_id, o.customer_id) AS customer_id,
       c.company,
       o.order_id
FROM lab_customers c
FULL OUTER JOIN lab_orders o ON o.customer_id = c.customer_id;
```

Watch grain: joining `lab_order_items` to `lab_orders` then `SUM(o.freight)` fans freight out per line.

## UNION

```sql
SELECT company AS label, 'customer' AS kind FROM lab_customers
UNION ALL
SELECT product_name, 'product' FROM lab_products;
```

Column count and types must align. `UNION` adds a distinct. `UNION ALL` does not. Prefer `UNION ALL` for incrementals.

## Exercises

1. INNER join orders to customers; project `order_id` and `company`.
2. LEFT join products to items and find products with no lines (Sky Roast may still have a pending line — check discontinued merch if you add a lonely sku).
3. `UNION ALL` west customer companies with east customer companies.

Covers Aliases, Joins, Inner/Left/Right/Full/Self Join, and Union.

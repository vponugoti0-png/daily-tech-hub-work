---
slug: sql-ex-filters-patterns
track: sql
title: "LIKE, wildcards, IN, and BETWEEN"
description: "Pattern match company names, test membership with IN, and bound dates or prices with BETWEEN."
level: beginner
order: 26
durationMinutes: 20
topics: [sql]
objectives:
  - "Use LIKE with % and _ wildcards (and know when they cannot use an index well)"
  - "Replace OR-chains with IN lists"
  - "Read BETWEEN as inclusive on both ends"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "LIKE wildcards"
    code: "SELECT company, city, region\nFROM lab_customers\nWHERE company LIKE '%Goods'\n   OR company LIKE 'Lake%'\nORDER BY company;"
    note: "% is any run of characters. _ is exactly one character."
  - label: "IN list"
    code: "SELECT company, region\nFROM lab_customers\nWHERE region IN ('east', 'midwest', 'south')\nORDER BY region, company;"
    note: "IN is an OR-chain you can read. NOT IN is dangerous if the list can contain NULL."
  - label: "BETWEEN dates"
    code: "SELECT order_id, order_date, ship_city\nFROM lab_orders\nWHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-05'\nORDER BY order_date;"
    note: "Inclusive: 09-02 and 09-05 both stay. Same habit for numeric unit_price."
quiz:
  - question: "company LIKE 'H_rbor%' matches Harbor Goods because…"
    options:
      - "% is one character and _ is many"
      - "_ is one character and % is any length (including zero)"
      - "LIKE ignores vowels"
      - "Wildcards only work in SELECT"
    answer: 1
    explanation: "H + one char + rbor + anything. Standard LIKE wildcards, not regex."
  - question: "Which filter is the clean IN form of east-or-midwest?"
    options:
      - "WHERE region = IN east midwest"
      - "WHERE region IN ('east', 'midwest')"
      - "WHERE IN(region, east, midwest)"
      - "WHERE region BETWEEN 'east' AND 'midwest'"
    answer: 1
    explanation: "BETWEEN on strings is a lexical range, not a membership list."
  - question: "BETWEEN DATE '2026-09-02' AND DATE '2026-09-05' includes…"
    options:
      - "Only 09-03 and 09-04"
      - "09-02 through 09-05 inclusive"
      - "Everything after 09-05"
      - "Only the start date"
    answer: 1
    explanation: "BETWEEN is inclusive on both bounds. For datetimes, prefer an exclusive end instant if you need a half-open window."
---

Four filters that show up in every commerce extract: `LIKE`, wildcards, `IN`, and `BETWEEN`. Run the LIKE / IN sample in the local lab.

## LIKE and wildcards

```sql
-- Dialect: ANSI
SELECT company
FROM lab_customers
WHERE company LIKE '%Goods';     -- ends with Goods
```

| Wildcard | Means |
|----------|--------|
| `%` | Any string (including empty) |
| `_` | Exactly one character |

`Lake%` matches Lakeside Mart. `H_rbor%` matches Harbor Goods. A leading `%` often prevents a plain btree probe — fine on five rows, a habit to notice on a billion-row fact.

Some warehouses add `ILIKE` (case-insensitive) or `SIMILAR TO`. Stick to `LIKE` in this lab. `LIKE` is not regex.

Escape a literal `%` with `ESCAPE` when product names contain percent signs.

## IN

```sql
SELECT company, region
FROM lab_customers
WHERE region IN ('east', 'midwest', 'south');
```

That is `region = 'east' OR region = 'midwest' OR region = 'south'`. Prefer `IN` when the list is a set of keys.

`NOT IN (SELECT email …)` goes wrong if the subquery can return `NULL` — a single NULL makes the whole `NOT IN` unknown. Prefer `NOT EXISTS` (next exists lesson) for nullable lists.

## BETWEEN

```sql
SELECT order_id, order_date
FROM lab_orders
WHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-05';
```

Inclusive on both ends. For prices:

```sql
SELECT product_name, unit_price
FROM lab_products
WHERE unit_price BETWEEN 10 AND 20;
```

`12.50`, `14.00`, and `18.00` stay; `9.00` and `22.00` drop.

## Exercises

1. Find products whose name contains `Roast`.
2. List orders whose `status IN ('paid', 'pending')`.
3. List merch priced `BETWEEN 14 AND 22`.

Covers Like, Wildcards, In, and Between.

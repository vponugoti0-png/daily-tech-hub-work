---
slug: ai-de-practice-sql-review
track: ai-data-eng
title: "Practice — review SQL and Python with AI"
description: "Treat model-written SQL/Python as untrusted. More Aurora practice prompts for diffs, EXPLAIN guesses, and test sketches."
level: beginner
order: 9
durationMinutes: 25
topics: [general, sql, python]
objectives:
  - "Ask AI to review a diff without pasting secrets or running DDL"
  - "Demand tests or a SELECT preview before you accept DML"
  - "Keep ownership: you run the lab or the warehouse"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Review a silver diff"
    code: "You are reviewing this Aurora silver transform (untrusted).\\nGoal: list grain, NULL, and join risks.\\nSQL:\\nSELECT o.order_id, SUM(i.unit_price) AS amount\\nFROM aurora_orders o\\nJOIN aurora_order_items i ON i.order_id = o.order_id\\nGROUP BY 1;\\nConstraints: no secrets. Do not run this. Suggest a safer grain."
    note: "Item join + SUM(unit_price) drops qty. You still decide the grain."
  - label: "Ask for a pytest sketch"
    code: "Write a pytest for assert_row that requires order_id, status, amount.\\nConstraints: stdlib or pytest only. No Spark session. No network.\\nOutput: one test that passes, one that expects ValueError."
    note: "Copy the test into your repo. The Python local lab can run the stdlib unittest shape."
  - label: "EXPLAIN is a guess"
    code: "Here is a filter: WHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-04'.\\nAsk: what would you check in EXPLAIN / a query profile? Do not invent a cluster."
    note: "The model does not see your warehouse. You read the plan."
quiz:
  - question: "AI-generated MERGE should be treated as…"
    options:
      - "Production-ready if the prose sounds confident"
      - "Untrusted until you preview MATCHED / NOT MATCHED and review keys"
      - "A reason to skip Unity Catalog"
      - "A live dbutils call"
    answer: 1
    explanation: "Preview the set. Then copy DML into a disposable table."
  - question: "Why is SUM(unit_price) after joining items risky?"
    options:
      - "unit_price is always NULL"
      - "You dropped qty and changed the grain unless you SUM(qty * unit_price) on purpose"
      - "JOIN is illegal in DuckDB"
      - "AI cannot mention items"
    answer: 1
    explanation: "Name the grain. Item revenue is qty * unit_price."
  - question: "A pytest the model writes is useful when…"
    options:
      - "You never run it"
      - "You run it on the contract (or in the local Python lab) and keep failures loud"
      - "It imports pyodide.js"
      - "It prints the warehouse password"
    answer: 1
    explanation: "Tests you do not run are docs. Run them."
---

AI is a **reviewer and a drafter**. It is not your warehouse.

## Diff first

Paste a **redacted** sketch. Ask for grain / NULL / join risks. Do not paste passwords or `CREATE SECRET`.

## Preview before DML

The [SQL local lab](/training/sql/sql-select-filter-nulls#lab) and [Databricks MERGE preview](/training/databricks/dbx-delta-merge-deep#lab) run `SELECT` / `WITH` only. Use them before you copy `MERGE` into a workspace.

## Exercises

1. Run the item-join prompt, then write the safer SELECT yourself.
2. Ask for two unit tests; run the stdlib shape in the [Python lab](/training/python/python-testing-spark-logic#lab).
3. List three things EXPLAIN cannot tell you if the model never saw your table stats.

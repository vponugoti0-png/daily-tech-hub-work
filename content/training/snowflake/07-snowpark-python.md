---
slug: sf-snowpark-python
track: snowflake
title: "Snowpark Python for DE"
description: "DataFrame API pushdown, stored procedures, and when to use Snowpark vs pure SQL."
level: advanced
order: 7
durationMinutes: 40
topics: [snowflake, python]
objectives:
  - "Write Snowpark DataFrame transforms"
  - "Understand pushdown vs local collect pitfalls"
  - "Package logic as procedures/jobs"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Snowpark vs SQL"
    code: "# Educational copy — not a live session\n# df = session.table('analytics.orders').filter(col('status') == 'paid')\n# Same grain rules as pandas/Spark: do not fan out amount on items."
    note: "Snowpark is Python that becomes SQL. Cortex is a different decision."
quiz:
  - question: "Calling `.collect()` on a huge Snowpark frame…"
    options:
      - "Keeps all compute in Snowflake optimally"
      - "Pulls rows to the client — can OOM"
      - "Creates a Dynamic Table"
      - "Grants ACCOUNTADMIN"
    answer: 1
  - question: "Snowpark is a fit when…"
    options:
      - "You want to skip RBAC"
      - "You already have tested Python transforms and need them close to the data"
      - "You need a public web chat to hold a PAT"
      - "SQL cannot GROUP BY"
    answer: 1
    explanation: "Same contract, different API. Still review the generated SQL."
  - question: "A Snowpark join to line items then sum(order.amount) is…"
    options:
      - "Fine — Python protects grain"
      - "The same fan-out bug as SQL"
      - "Impossible"
      - "A Time Travel feature"
    answer: 1
    explanation: "APIs do not save you from grain."
  - question: "This lesson does not open a live Snowpark session because…"
    options:
      - "Snowpark is fictional"
      - "No Wave B AI/Python warehouse runtime — copy examples to an account"
      - "Python is banned"
      - "Warehouses cannot run Python"
    answer: 1
    explanation: "Educational copy only."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Snowpark Python for DE

```python
from snowflake.snowpark import Session
df = session.table("ANALYTICS.ORDERS")
out = df.filter(df["STATUS"] == "paid").group_by("REGION").agg(df["AMOUNT"].sum())
out.write.save_as_table("MARTS.REVENUE", mode="overwrite")
```

Prefer lazy DataFrame ops; avoid collecting large sets.

## Capstone

Port one pandas transform from the Python track into Snowpark or SQL with tests on a sample.

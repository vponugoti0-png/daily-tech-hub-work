---
slug: dbx-dlt-pipelines
track: databricks
title: "DLT / declarative pipelines overview"
description: "When Lakeflow / Delta Live Tables beat a hand-rolled Job: expectations, medallion graphs, and streaming vs batch tables."
level: intermediate
order: 10
durationMinutes: 35
topics: [databricks, pyspark]
objectives:
  - "Describe a DLT graph vs a multi-task Job"
  - "Place expectations (DQ) on silver"
  - "Know when to stay with a classic Job"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "DLT silver + expectation"
    code: "@dlt.table(comment=\"latest orders\")\n@dlt.expect_or_drop(\"valid_id\", \"order_id IS NOT NULL\")\ndef silver_orders():\n    return dlt.read(\"bronze_orders\").dropDuplicates([\"order_id\"])"
    note: "Expectations are DQ in the graph. Drop vs fail is a product choice."
  - label: "When DLT wins"
    code: "- Medallion SELECT/DataFrame DAG\n- Streaming + batch in one graph\n- Built-in expectations + lineage\nStay on Jobs when you need custom MERGE branches or mixed vendors."
    note: "DLT is not a new nav route — it is another way to run the same story."
quiz:
  - question: "DLT / declarative pipelines are strongest when…"
    options:
      - "You need a free-form notebook with no DQ"
      - "The pipeline is a medallion DAG with expectations"
      - "You want to skip Unity Catalog"
      - "You are replacing Git"
    answer: 1
    explanation: "Declare tables + quality. Operational glue (retries, graph) is the product."
  - question: "A classic multi-task Job is still better when…"
    options:
      - "You never have DQ"
      - "You need custom MERGE/CDC branches, mixed systems, or existing task graphs"
      - "You only have one CSV"
      - "You disabled checkpoints on purpose"
    answer: 1
    explanation: "DLT is not mandatory. The capstone Job remains a valid production shape."
  - question: "DLT / declarative pipelines are a fit when…"
    options:
      - "You want hidden %sh credentials"
      - "You can name bronze/silver/gold expectations the engine will enforce"
      - "You need to skip quality"
      - "You refuse to name grain"
    answer: 1
    explanation: "Expectations are DQ gates with an owner. Still not a live lab runtime."
  - question: "A failed expectation should…"
    options:
      - "Be ignored so gold stays fresh"
      - "Stop or quarantine per the policy you wrote — same as a SQL gate"
      - "Delete Unity Catalog"
      - "Rotate the PAT"
    answer: 1
    explanation: "Name drop vs fail. Silent continues are how bad silver ships."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Overview — not a product tour of every UI toggle. Declarative pipelines (DLT / Lakeflow Declarative Pipelines) describe **tables and quality**, then the engine refreshes them.

## Job vs DLT

| | Multi-task Job | DLT / declarative |
|--|----------------|-------------------|
| You write | Tasks + clusters + SQL/Python | Table functions + expectations |
| DQ | Your task 3 | `@dlt.expect*` |
| Streaming | Structured Streaming task | Streaming tables in the same graph |
| Best for | Custom MERGE, mixed vendors | Medallion SELECT DAGs |

The [bronze→silver→gold capstone](/training/databricks/dbx-capstone-medallion-job) can stay a Job. DLT is the same story with less glue if your SQL is straightforward.

## Sketch (orders story)

```python
import dlt
from pyspark.sql import functions as F

@dlt.table
def bronze_orders():
    return spark.readStream.format("cloudFiles").load("/mnt/orders")

@dlt.table
@dlt.expect_or_fail("unique_ready", "order_id IS NOT NULL")
def silver_orders():
    return (
        dlt.read_stream("bronze_orders")
        .withColumn("rn", F.row_number().over(...))
        .filter("rn = 1")
    )

@dlt.table
def gold_orders_daily():
    return (
        dlt.read("silver_orders")
        .filter("status = 'paid'")
        .groupBy(F.date_trunc("DAY", F.col("ordered_at")).alias("event_date"))
        .sum("amount")
    )
```

Treat this as a shape, not an API dump. Names and decorators move; the graph does not.

## Exercises

1. Map the four Job tasks from the capstone onto DLT tables + one expectation.
2. Choose `expect_or_drop` vs `expect_or_fail` for null `order_id`. Why?
3. List one reason you would **not** migrate a working Job this quarter.

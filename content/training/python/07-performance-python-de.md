---
slug: python-performance-de
track: python
title: "Performance habits for DE Python"
description: "Vectorization, chunking, avoiding UDFs, and knowing when to push down to SQL/Spark."
level: advanced
order: 7
durationMinutes: 40
topics: [python, pyspark, sql]
objectives:
  - "Prefer vectorized ops over row loops"
  - "Chunk large extractions"
  - "Know when to push compute to the warehouse"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Avoid iterrows"
    code: "df[\"amount_tax\"] = df[\"amount\"] * 1.08  # vectorized"
    note: "Row loops over millions of rows belong in SQL/Spark, not Python."
  - label: "Chunk read"
    code: "for chunk in pd.read_sql(q, con, chunksize=50_000):\n    transform(chunk)"
    note: "Stream extracts so a 20M-row pull does not blow RAM."
  - label: "Push down"
    code: "SELECT order_id, amount FROM orders WHERE order_date >= DATE '2026-09-01'"
    note: "Filter and project in the warehouse. Pandas should see a slice, not the lake."
quiz:
  - question: "Python row loops over millions of rows usually means…"
    options:
      - "Optimal Spark plans"
      - "You should vectorize or push down to SQL/Spark"
      - "Faster than SQL"
      - "Better type safety"
    answer: 1
---

# Performance habits for DE Python

1. **Vectorize** with pandas/Polars/numpy.
2. **Push down** filters and aggregates to SQL/Spark.
3. **Chunk** extractions; don't materialize 20GB in RAM.
4. Avoid Python UDFs in Spark when expressions exist.

## Exercise

Profile a slow transform with `cProfile` or `pyinstrument` and list the top 3 callees.

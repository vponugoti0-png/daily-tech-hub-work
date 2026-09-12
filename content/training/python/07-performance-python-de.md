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
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Chunk /data/orders.csv"
    code: "import csv\nfrom pathlib import Path\n\ndef extract_chunks(path: Path, size=2):\n    with path.open(encoding=\"utf-8\") as f:\n        rows = list(csv.DictReader(f))\n    offset = 0\n    while offset < len(rows):\n        batch = rows[offset : offset + size]\n        yield batch\n        offset += len(batch)\n\nfor chunk in extract_chunks(Path(\"/data/orders.csv\")):\n    print([r[\"order_id\"] for r in chunk])"
    note: "Run in the local lab. Do not concat every chunk back into one list. pandas read_sql(..., chunksize=) is the warehouse twin."
  - label: "Project then loop"
    code: "rows = [{\"order_id\": 1, \"amount\": \"10\"}, {\"order_id\": 2, \"amount\": \"18\"}]\ntaxed = [{\"order_id\": r[\"order_id\"], \"amount_taxed\": float(r[\"amount\"]) * 1.08} for r in rows]\nprint(taxed)"
    note: "On millions of rows, vectorize or push down. This lab stays stdlib on a tiny file."
  - label: "Push the filter (copy)"
    code: "SQL = \"SELECT order_id, amount FROM raw.orders WHERE updated_at >= %(start)s\""
    note: "Filter in SQL/Spark. Python should see the window, not the lake. Copy this into a warehouse."
quiz:
  - question: "Python row loops over millions of rows usually means…"
    options:
      - "Optimal Spark plans"
      - "You should vectorize or push down to SQL/Spark"
      - "Faster than SQL"
      - "Better type safety"
    answer: 1
  - question: "First performance habit for a Python extract?"
    options:
      - "Load the whole landing into a list of dicts, twice"
      - "Project columns you need, chunk, and avoid per-row warehouse round-trips"
      - "Turn off logging forever"
      - "Use eval() on each row"
    answer: 1
    explanation: "Less data, fewer round-trips. Micro-optimizing a loop is later."
  - question: "Why is row-by-row INSERT from Python usually a smell?"
    options:
      - "SQL cannot insert"
      - "Each row is a network round-trip — copy/bulk/chunk instead"
      - "Python cannot loop"
      - "Warehouses forbid INSERT"
    answer: 1
    explanation: "Bulk load or a warehouse MERGE. Chatty writers die at 100k rows."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Performance habits for DE Python

1. **Vectorize** with pandas/Polars/numpy.
2. **Push down** filters and aggregates to SQL/Spark.
3. **Chunk** extractions; don't materialize 20GB in RAM.
4. Avoid Python UDFs in Spark when expressions exist.

## Exercise

Profile a slow transform with `cProfile` or `pyinstrument` and list the top 3 callees.

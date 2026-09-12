---
slug: python-testing-spark-logic
track: python
title: "Testing Spark-bound logic in pure Python"
description: "Extract business rules so you can unit test without a cluster, then pin Spark with tiny fixtures."
level: intermediate
order: 3
durationMinutes: 40
topics: [python, pyspark]
objectives:
  - "Separate pure rules from Spark I/O"
  - "Use pytest fixtures for small DataFrames"
  - "Assert on row sets, not printouts"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Pure late rule"
    code: "def is_late(event_ts: str, watermark: str) -> bool:\n    return event_ts < watermark\n\nassert is_late(\"2026-09-01\", \"2026-09-12\") is True\nprint(\"ok\")"
    note: "Copy into pytest. This lesson stays copy-to-repo — Spark fixtures are not an in-browser kernel."
  - label: "pytest-shaped assert"
    code: "def paid_only(rows):\n    return [r for r in rows if r[\"status\"] == \"paid\"]\n\ngot = paid_only([{\"status\": \"paid\"}, {\"status\": \"pending\"}])\nassert [r[\"status\"] for r in got] == [\"paid\"]\nprint(got)"
    note: "Assert on the row set, not a printout. Run pytest in your repo — no cluster required for the rule."
quiz:
  - question: "Best first test for a watermark policy?"
    options:
      - "Full Databricks job on prod"
      - "Pure function over timestamps in pytest"
      - "Only integration tests"
      - "Manual notebook runs"
    answer: 1
  - question: "Why extract a watermark policy out of a Spark job?"
    options:
      - "Spark cannot compare timestamps"
      - "pytest can cover the rule in milliseconds without a cluster"
      - "Pure functions are illegal in Databricks"
      - "Jobs cannot call functions"
    answer: 1
    explanation: "I/O stays in the job. Rules belong in tests you run on every PR."
  - question: "A useful Spark unit fixture is…"
    options:
      - "The entire prod lake"
      - "Two rows that differ only on the column under test"
      - "A screenshot of a notebook"
      - "print(df.show()) with no assert"
    answer: 1
    explanation: "Assert on a row set. show() is not a test."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Testing Spark-bound logic in pure Python

Clusters are slow feedback. Extract rules you can test in milliseconds.

This lesson stays **Copy to practice** (pytest + optional Spark fixtures). The in-browser lab is stdlib + `/data` files — not a cluster. Use [contracts](/training/python/python-dataframe-contracts#lab) or [None/dicts](/training/python/python-none-dicts-rows#lab) to run small Python samples.

## Pattern

```python
from pyspark.sql import functions as F

def is_late(event_ts, watermark_ts) -> bool:
    return event_ts < watermark_ts

# Spark wrapper stays thin — keep rows that are NOT late
def filter_not_late(df, watermark_col="watermark"):
    # Operator precedence: unary ~ binds tighter than <, so
    #   ~F.col("event_ts") < F.col(watermark_col)
    # is parsed as (~col) < watermark — wrong and not a boolean NOT of the comparison.
    # Negate the whole predicate, or prefer >= for "not late":
    return df.filter(~(F.col("event_ts") < F.col(watermark_col)))
    # equivalent / clearer:
    # return df.filter(F.col("event_ts") >= F.col(watermark_col))
```

Prefer column expressions over Python UDFs for performance — test the **policy**, implement with Catalyst.

## pytest shape

```python
def test_is_late():
    assert is_late(1, 2) is True
    assert is_late(3, 2) is False
```

For Spark: use local session fixtures and assert `collect()` sets.

## Exercises

### Exercise 1
Implement and test `business_date(ts, tz)` that floors to local calendar day.

### Exercise 2
Given duplicates, write a test that expects exactly one survivor per `event_id`.

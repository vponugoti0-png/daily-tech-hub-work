---
slug: python-dataframe-contracts
track: python
title: "DataFrame contracts for ETL utilities"
description: "Schema-first transforms, pure functions, and late-arriving key handling that ports cleanly to PySpark."
level: beginner
order: 1
durationMinutes: 30
topics: [python, pyspark]
objectives:
  - "Define explicit column contracts at pipeline boundaries"
  - "Write pure transform functions that are unit-testable"
  - "Handle unmatched joins without silent data loss"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Assert columns"
    code: "REQUIRED = (\"event_id\", \"user_id\", \"ts\")\nmissing = set(REQUIRED) - set(df.columns)\nif missing:\n    raise ValueError(f\"missing columns: {sorted(missing)}\")"
    note: "Fail loud at the boundary — never coerce a missing key to None."
  - label: "Latest dedupe"
    code: "df.sort_values(\"ts\").drop_duplicates(\"id\", keep=\"last\")"
    note: "Grain is id. keep='last' after a time sort is SCD1-shaped."
  - label: "Unmatched left-join count"
    code: "merged = events.merge(users, on=\"user_id\", how=\"left\", indicator=True)\nunmatched = int((merged[\"_merge\"] == \"left_only\").sum())"
    note: "Log unmatched, then decide. Silent drops hide late keys."
quiz:
  - question: "Why prefer pure transform functions over notebook cells with I/O mixed in?"
    options:
      - "They run faster on GPUs"
      - "They are unit-testable and portable to Spark later"
      - "They skip schema validation"
      - "They auto-partition data"
    answer: 1
    explanation: "Pure functions isolate business logic so you can test and later lift to Spark."
  - question: "What should happen when a left join leaves unmatched user_ids?"
    options:
      - "Drop them quietly"
      - "Coerce to zero"
      - "Track/log the unmatched count and decide explicitly"
      - "Always inner-join instead"
    answer: 2
---

# DataFrame contracts for ETL utilities

Silent data bugs — wrong joins, dropped nulls, “helpful” coercion — cost more than loud failures. Build **contract-first** ETL utilities.

## Column contracts

```python
REQUIRED = ("event_id", "user_id", "ts", "payload")

def assert_columns(df, required=REQUIRED):
    missing = set(required) - set(map(str, df.columns))
    if missing:
        raise ValueError(f"missing columns: {sorted(missing)}")
    return df
```

## Pure transforms

Keep I/O at the edges. Business logic should look like:

```python
def with_event_date(df):
    out = df.copy()
    out["event_date"] = out["ts"].dt.floor("D")
    return out
```

The same shape becomes a Spark `withColumn` plan later.

## Late-arriving keys

```python
def enrich_users(events, users):
    merged = events.merge(users, on="user_id", how="left", indicator=True)
    unmatched = int((merged["_merge"] == "left_only").sum())
    if unmatched:
        print(f"unmatched_users={unmatched}")  # emit metric in prod
    return merged.drop(columns=["_merge"])
```

## Exercises

### Exercise 1 — Schema guard
Implement `assert_columns` for pandas or Polars; raise listing missing fields.

**Hint:** Convert columns to a set and subtract.

### Exercise 2 — Deduplicate latest
Given duplicate `event_id`, keep the row with the latest `ts`.

**Solution sketch:**
```python
df.sort_values("ts").drop_duplicates("event_id", keep="last")
```

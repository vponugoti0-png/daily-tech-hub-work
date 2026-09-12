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
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Assert columns (stdlib)"
    code: "import csv\nfrom pathlib import Path\n\nREQUIRED = (\"order_id\", \"status\", \"amount\")\n\ndef assert_row(row: dict) -> dict:\n    missing = [k for k in REQUIRED if not row.get(k)]\n    if missing:\n        raise ValueError(f\"missing keys: {missing}\")\n    return row\n\nwith Path(\"/data/orders.csv\").open(encoding=\"utf-8\") as f:\n    rows = [assert_row(r) for r in csv.DictReader(f)]\nprint(len(rows), rows[0])"
    note: "Fail loud at the boundary. Run this in the local lab — /data/orders.csv is seeded. pandas/Spark twins stay in the lesson body."
  - label: "Latest dedupe"
    code: "rows = [\n    {\"order_id\": 1, \"updated_at\": \"2026-09-01\", \"amount\": 10},\n    {\"order_id\": 1, \"updated_at\": \"2026-09-12\", \"amount\": 12.5},\n]\nlatest = {}\nfor row in sorted(rows, key=lambda r: r[\"updated_at\"]):\n    latest[row[\"order_id\"]] = row\nprint(list(latest.values()))"
    note: "Same grain as warehouse silver: one row per natural key. sort_values().drop_duplicates(keep=\"last\") is the pandas twin."
  - label: "Unmatched keys"
    code: "import json\nfrom pathlib import Path\n\nevents = [{\"user_id\": 1}, {\"user_id\": 9}]\nusers = {c[\"customer_id\"] for c in json.loads(Path(\"/data/customers.json\").read_text())}\nmissing = [e[\"user_id\"] for e in events if e[\"user_id\"] not in users]\nprint(\"unmatched\", missing)"
    note: "Do not drop unmatched ids silently. Quarantine or count them. A left merge with indicator is the pandas twin."
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
  - question: "A DataFrame contract should name…"
    options:
      - "Only the plot color"
      - "Required columns, types, and the grain (e.g. one row per order_id)"
      - "The author’s favorite IDE"
      - "A random UUID per run"
    answer: 1
    explanation: "Grain + columns + types. Everything else is decoration."
  - question: "Why fail when an unexpected column arrives in bronze?"
    options:
      - "Extra columns are always PII"
      - "Silent schema drift can change joins and metrics without a review"
      - "Spark cannot add columns"
      - "Contracts forbid VARCHAR"
    answer: 1
    explanation: "Allow-list or explicitly pass-through. Do not let a new raw field reshape gold."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# DataFrame contracts for ETL utilities

Silent data bugs — wrong joins, dropped nulls, “helpful” coercion — cost more than loud failures. Build **contract-first** ETL utilities.

Practice the stdlib shape in the **local practice lab** on this page (`#lab`): read `/data/orders.csv` and `/data/customers.json`. pandas/PySpark twins stay in the body — this lab is not a Spark kernel.

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

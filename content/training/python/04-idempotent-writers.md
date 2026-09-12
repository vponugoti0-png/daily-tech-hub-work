---
slug: python-idempotent-writers
track: python
title: "Idempotent writers & retry-safe loads"
description: "Design loads that can safely re-run: partitioning, merge keys, and exactly-once *enough* semantics."
level: intermediate
order: 4
durationMinutes: 35
topics: [python, sql]
objectives:
  - "Choose natural merge keys for upserts"
  - "Make retries safe with dynamic partition overwrite, replaceWhere, or MERGE"
  - "Emit load metrics for observability"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Dynamic partition overwrite"
    code: "spark.conf.set('spark.sql.sources.partitionOverwriteMode', 'dynamic')"
  - label: "Delta replaceWhere"
    code: "df.write.format('delta').mode('overwrite').option('replaceWhere', \"dt = '2026-09-11'\").save(path)"
  - label: "Merge key"
    code: "ON t.id = s.id AND t.dt = s.dt"
quiz:
  - question: "A job crashes after writing half a partition. Safest retry pattern?"
    options:
      - "Append again blindly"
      - "Overwrite that partition atomically / MERGE with keys"
      - "Delete the whole table"
      - "Ignore and continue"
    answer: 1
  - question: "An idempotent load means…"
    options:
      - "Running it twice duplicates gold"
      - "Re-running the same window leaves gold in the same state"
      - "You never use MERGE"
      - "You delete the table every hour"
    answer: 1
    explanation: "Retries must be safe. MERGE on a key or partition replace — not append-only blindly."
  - question: "Why include a batch_id or window start in a staging table?"
    options:
      - "For pretty dashboards only"
      - "So a retry can delete/replace that window instead of inserting a second copy"
      - "Spark requires it"
      - "To store passwords"
    answer: 1
    explanation: "Window identity is how you make a replay land on the same rows."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Idempotent writers & retry-safe loads

Orchestrators retry. Your writer must tolerate that.

## Strategies

1. **Dynamic partition overwrite** for replaceable daily slices (Spark).
2. **Delta `replaceWhere`** to overwrite only matching rows/partitions.
3. **MERGE/UPSERT** on business keys for mutable entities.
4. **Staging + swap** when you need all-or-nothing visibility.

### Unsafe pattern (do not copy)

```python
# UNSAFE with default static partitionOverwriteMode:
# mode("overwrite") + partitionBy can wipe the *entire* table path,
# not just the dt you filtered into the DataFrame.
def write_daily_unsafe(df, path, dt: str):
    (
      df.filter(f"event_date = '{dt}'")
        .write.mode("overwrite")
        .partitionBy("event_date")
        .parquet(path)
    )
```

### Safe: dynamic partition overwrite

```python
from pyspark.sql import functions as F

# SAFE — only partitions present in the DataFrame are replaced
def write_daily_dynamic(df, path, dt: str):
    spark = df.sparkSession
    spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")
    (
      df.filter(F.col("event_date") == dt)
        .write.mode("overwrite")
        .partitionBy("event_date")
        .parquet(path)
    )
```

### Safe: Delta `replaceWhere`

```python
from pyspark.sql import functions as F

# SAFE — overwrite only rows matching the predicate (Delta Lake)
def write_daily_replace_where(df, path, dt: str):
    (
      df.filter(F.col("event_date") == dt)
        .write.format("delta")
        .mode("overwrite")
        .option("replaceWhere", f"event_date = '{dt}'")
        .save(path)
    )
```

### Safe: Delta MERGE

```python
from pyspark.sql import functions as F
from delta.tables import DeltaTable

# SAFE — upsert on business keys (idempotent retries)
def merge_daily(df, table_path, dt: str):
    spark = df.sparkSession
    target = DeltaTable.forPath(spark, table_path)
    source = df.filter(F.col("event_date") == dt)
    (
      target.alias("t")
        .merge(source.alias("s"), "t.id = s.id AND t.event_date = s.event_date")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute()
    )
```

## Metrics to emit

- rows_in / rows_out / rows_rejected
- max(event_ts), distinct keys
- duration + bytes written

## Exercises

### Exercise 1
Sketch MERGE SQL for a dim table on `customer_id` updating attributes and `updated_at`.

### Exercise 2
Explain when append-only + compaction beats overwrite.

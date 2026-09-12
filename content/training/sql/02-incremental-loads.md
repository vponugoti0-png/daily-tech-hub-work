---
slug: sql-incremental-loads
track: sql
title: "Incremental loads & watermarks"
description: "High-water marks, late data, and MERGE patterns for trustworthy daily pipelines."
level: intermediate
order: 2
durationMinutes: 40
topics: [sql, snowflake, databricks]
dialect: mixed
objectives:
  - "Track watermarks safely"
  - "Handle late-arriving facts"
  - "Write idempotent MERGE statements"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Watermark MERGE shape"
    code: "-- Preview first (lab habit)\nSELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE order_date >= DATE '2026-09-06';\n-- Warehouse: MERGE on order_id for that window, then advance watermark to MAX(order_date)."
    note: "Idempotent window. Do not advance to a timestamp you cannot re-read."
quiz:
  - question: "A watermark should generally advance to…"
    options:
      - "MIN(ts) of the batch"
      - "A conservative MAX(ts) you can re-read from"
      - "Random UUID"
      - "NULL always"
    answer: 1
  - question: "Late-arriving 2026-09-01 row after you watermarked 2026-09-06 means…"
    options:
      - "Ignore it forever"
      - "You need a late-data policy: lookback window or a separate late path"
      - "The watermark was a UUID"
      - "DELETE gold and start over every time"
    answer: 1
    explanation: "Late facts are normal. Name the lookback; do not pretend time is complete."
  - question: "Advancing the watermark to MAX(ts) of an incomplete extract is risky because…"
    options:
      - "MAX is slow"
      - "The next run will skip rows that land in the gap"
      - "Warehouses forbid MAX"
      - "ts cannot be a DATE"
    answer: 1
    explanation: "Conservative advance. Re-readable. Incomplete batches should not skip ahead."
  - question: "Idempotent incremental MERGE uses…"
    options:
      - "INSERT only, no key"
      - "A business key (order_id) so a replay updates instead of duplicating"
      - "RANDOM() as the key"
      - "LIMIT 1"
    answer: 1
    explanation: "Keys make retries safe."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Incremental loads & watermarks

> **Dialects in this lesson:** Spark SQL / Databricks (`UPDATE SET *`) and a Snowflake-style explicit column list. Do not mix syntax across engines.

```sql
-- Dialect: Spark SQL / Databricks
MERGE INTO mart.orders t
USING staging.orders_delta s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

```sql
-- Dialect: Snowflake
MERGE INTO mart.orders t
USING staging.orders_delta s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET
  t.status = s.status,
  t.amount = s.amount,
  t.updated_at = s.updated_at
WHEN NOT MATCHED THEN INSERT (order_id, status, amount, updated_at)
  VALUES (s.order_id, s.status, s.amount, s.updated_at);
```

Store `pipeline_state(job, watermark_ts)`. On failure, do not advance.

## Exercises

1. Design a late-data window of 2 days overlapping the watermark.
2. Write SQL to detect duplicate natural keys in staging.

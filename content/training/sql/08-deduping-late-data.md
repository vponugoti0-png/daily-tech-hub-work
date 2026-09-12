---
slug: sql-deduping-late-data
track: sql
title: "Deduping & late-data patterns"
description: "Keep the latest row per key, overlap watermarks, and land late events into a daily revenue mart without silent doubles."
level: intermediate
order: 8
durationMinutes: 35
topics: [sql]
objectives:
  - "Dedupe with QUALIFY / ROW_NUMBER on a business key + timestamp"
  - "Re-read a late-data overlap window instead of trusting a single watermark"
  - "Decide merge vs insert-only when events arrive after the mart closed"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Latest per natural key"
    code: "SELECT *\nFROM events\nQUALIFY ROW_NUMBER() OVER (\n  PARTITION BY event_id ORDER BY ingested_at DESC, src_ts DESC\n) = 1;"
    note: "ANSI-friendly form: wrap the window in a subquery and filter rn = 1."
  - label: "Late overlap window"
    code: "WHERE src_ts >= watermark_ts - INTERVAL '2' DAY\n  AND src_ts <  run_until_ts;"
    note: "Reprocess two days so late orders can correct yesterday's revenue."
quiz:
  - question: "A late order arrives two days after the daily mart ran. Safest pattern?"
    options:
      - "Ignore it — the day is closed forever"
      - "Re-read an overlap window and MERGE/rebuild that day's grain"
      - "UNION ALL it into gold without a key"
      - "Drop the watermark table"
    answer: 1
    explanation: "Late data is expected. Overlap + idempotent write beats a one-shot watermark."
  - question: "ROW_NUMBER for dedupe should PARTITION BY…"
    options:
      - "The warehouse name"
      - "The natural key (and only columns that define 'same row')"
      - "Every column so nothing collapses"
      - "CURRENT_DATE only"
    answer: 1
    explanation: "Partition by the business identity. Order by the recency columns you trust."
---

Ingestion reality: the same `order_id` shows up twice, and Tuesday's refund lands on Thursday. This lesson is the SQL half of the shared story **Orders → late events → daily revenue mart**.

## Dedupe (landing / silver)

```sql
-- Dialect: ANSI
SELECT *
FROM (
  SELECT e.*,
    ROW_NUMBER() OVER (
      PARTITION BY order_id
      ORDER BY updated_at DESC, ingested_at DESC
    ) AS rn
  FROM staging.orders e
) s
WHERE rn = 1;
```

If two rows share `updated_at`, add a tie-breaker (`ingested_at`, file name, CDC sequence). Do not `SELECT DISTINCT *` and hope.

## Late data

A watermark is a **high-water mark you can re-read from**, not a door you slam.

1. Store `pipeline_state(job, watermark_ts)`.
2. Each run reads `[watermark - overlap, run_until)`.
3. Write with `MERGE` on `order_id` (or partition-overwrite the affected dates).
4. Advance the watermark only after a successful write.

```sql
-- Dialect: ANSI-ish
MERGE INTO mart.orders t
USING silver.orders_latest s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET
  amount = s.amount,
  status = s.status,
  updated_at = s.updated_at,
  event_date = s.event_date
WHEN NOT MATCHED THEN INSERT (order_id, amount, status, updated_at, event_date)
VALUES (s.order_id, s.amount, s.status, s.updated_at, s.event_date);
```

Then rebuild `mart.orders_daily` as `event_date, SUM(amount)` — same grain as the [shared capstone checklist](/training/sql/sql-shared-capstone-checklist).

## When not to “just append”

| Symptom | Do this |
|---------|---------|
| Duplicate `order_id` in a file | Window-dedupe before write |
| Status changed after load | MERGE on key + newer `updated_at` |
| Event date shifted | Overwrite both old and new dates |
| Truly immutable log | Append + downstream latest-state view |

## Exercises

1. Write the ANSI subquery form of `QUALIFY ROW_NUMBER() = 1` for `event_id`.
2. Choose an overlap (1 vs 2 vs 7 days) for an orders mart that accepts 48-hour late posts. Why?
3. List two metrics you would emit: `rows_in`, `rows_deduped`, `late_rows`, `dates_touched`.

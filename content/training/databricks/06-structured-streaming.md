---
slug: dbx-structured-streaming
track: databricks
title: "Structured Streaming essentials"
description: "Checkpoints, triggers, watermarks, and exactly-once sinks with Delta."
level: advanced
order: 6
durationMinutes: 45
topics: [databricks, pyspark]
objectives:
  - "Configure checkpoints correctly"
  - "Apply watermarks for late data"
  - "Sink to Delta idempotently"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Checkpoint habit"
    code: "-- Streaming silver: readStream + checkpoint location you own\n-- Lab stand-in: bronze_events → silver_events (corrupt dropped)\nSELECT event_type, COUNT(*) FROM silver_events GROUP BY event_type;"
    note: "No live stream here. Checkpoints are the watermark of streaming."
quiz:
  - question: "Losing a streaming checkpoint directory typically means…"
    options:
      - "Nothing changes"
      - "You may reprocess or need careful recovery"
      - "Automatic schema merge"
      - "Free storage"
    answer: 1
  - question: "A streaming query without a checkpoint is risky because…"
    options:
      - "Spark cannot SELECT"
      - "A restart may reprocess or skip offsets — you lose exactly-once habits"
      - "Checkpoints store PATs"
      - "Streaming forbids WHERE"
    answer: 1
    explanation: "Checkpoint location is part of the contract."
  - question: "Corrupt event_type rows in this seed stay in bronze_events so that…"
    options:
      - "Silver is a dump of bronze"
      - "You can anti-join leftovers — quality is a write rule, not a hope"
      - "Streaming is disabled"
      - "Gold stores events only"
    answer: 1
    explanation: "Run the events-quality sample on lab-hosting lessons."
  - question: "Watermarks in streaming vs batch incrementals…"
    options:
      - "Are unrelated ideas"
      - "Both bound lateness — streaming in event time, batch in a high-water column"
      - "Replace Unity Catalog"
      - "Are only for Snowflake"
    answer: 1
    explanation: "Same DE idea, different runtime."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Structured Streaming essentials

```python
(
  spark.readStream.format("cloudFiles")...
    .load(path)
    .writeStream
    .format("delta")
    .option("checkpointLocation", ckpt)
    .trigger(availableNow=True)
    .toTable("silver.events")
)
```

## Exercises

1. Choose trigger mode for hourly micro-batches vs continuous.
2. Explain watermark vs checkpoint.

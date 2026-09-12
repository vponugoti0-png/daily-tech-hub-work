---
slug: dbx-autoloader-ingestion
track: databricks
title: "Autoloader / ingestion patterns"
description: "cloudFiles Autoloader, schema inference vs hints, checkpoints, and availableNow vs continuous for bronze landing."
level: intermediate
order: 8
durationMinutes: 35
topics: [databricks, pyspark]
objectives:
  - "Land files to bronze with Autoloader (cloudFiles)"
  - "Choose schema hints vs rescue data"
  - "Pick availableNow vs triggered/continuous"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Autoloader availableNow"
    code: "(spark.readStream.format(\"cloudFiles\")\n  .option(\"cloudFiles.format\", \"json\")\n  .option(\"cloudFiles.schemaLocation\", schema_path)\n  .option(\"cloudFiles.inferColumnTypes\", \"true\")\n  .load(src)\n  .writeStream.format(\"delta\")\n  .option(\"checkpointLocation\", ckpt)\n  .trigger(availableNow=True)\n  .toTable(\"main.bronze.orders\"))"
    note: "availableNow drains new files and stops — friendly for Jobs."
  - label: "Rescue leftover fields"
    code: ".option(\"cloudFiles.schemaEvolutionMode\", \"rescue\")"
    note: "Unexpected keys go to _rescued_data instead of failing the stream."
quiz:
  - question: "Autoloader (cloudFiles) is primarily for…"
    options:
      - "Replacing Unity Catalog"
      - "Incrementally landing new files into bronze with a checkpoint"
      - "Training Cortex models"
      - "Writing gold star schemas only"
    answer: 1
    explanation: "Autoloader watches a directory, tracks what was seen, and appends to bronze."
  - question: "Losing the checkpoint location typically means…"
    options:
      - "Nothing — Autoloader rewrites gold automatically"
      - "You may reprocess files or need a careful recovery plan"
      - "Schema hints become optional forever"
      - "Job clusters cannot start"
    answer: 1
    explanation: "The checkpoint is the ingestion watermark. Treat it like state, not scratch."
---

Databricks ingestion pattern: **files → bronze (Autoloader) → silver (dedupe / late) → gold (mart)**. Same shared story as the SQL and Snowflake waves.

## Autoloader in a Job

```python
(spark.readStream.format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaLocation", schema_path)
  .option("cloudFiles.inferColumnTypes", "true")
  .load(src)
  .writeStream.format("delta")
  .option("checkpointLocation", ckpt)
  .option("mergeSchema", "true")
  .trigger(availableNow=True)
  .toTable("main.bronze.orders"))
```

- **`schemaLocation`** — where Autoloader stores inferred schema.
- **`checkpointLocation`** — which files were processed. Do not delete it casually.
- **`availableNow=True`** — process what is there, exit. Fits a scheduled Job.

Continuous streaming is for low-latency ops. Daily revenue marts usually want `availableNow` or a triggered micro-batch.

## Schema habits

1. Start with hints for required fields (`order_id`, `amount`, `src_ts`).
2. Send surprise keys to `_rescued_data`.
3. Promote rescued fields deliberately — do not let bronze become an infinite VARIANT blob.

COPY-style `spark.read.format("json").load(...)` is fine for a one-off. Autoloader is what you schedule.

## After bronze

Dedupe and late events are the [SQL late-data lesson](/training/sql/sql-deduping-late-data). Assemble Autoloader + silver + gold in [Build medallion ETL](/training/databricks/dbx-medallion-etl-builder). The Job graph scorecard is the [medallion capstone](/training/databricks/dbx-capstone-medallion-job).

## Exercises

1. Name two directories you would never put on ephemeral DBFS scratch: schema + checkpoint.
2. Choose `availableNow` vs continuous for an hourly orders drop. Why?
3. List DQ you would run before silver: file count, rescued-row %, null `order_id`.

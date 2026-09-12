---
slug: sf-copy-stages-ingestion
track: snowflake
title: "COPY, stages & ingestion"
description: "Land files with stages, COPY INTO, and file-format options — then hand off to Streams or Dynamic Tables."
level: intermediate
order: 8
durationMinutes: 35
topics: [snowflake, sql]
objectives:
  - "Choose internal vs external stages"
  - "Write an idempotent COPY INTO with a file format"
  - "Know what COPY does not do (dedupe, late MERGE, marts)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "External stage + COPY"
    code: "CREATE OR REPLACE FILE FORMAT raw.csv_ff TYPE = CSV SKIP_HEADER = 1 FIELD_OPTIONALLY_ENCLOSED_BY = '\"';\n\nCOPY INTO analytics.raw.orders\nFROM @analytics.raw.orders_ext\nFILE_FORMAT = (FORMAT_NAME = 'analytics.raw.csv_ff')\nPATTERN = '.*orders_.*[.]csv'\nON_ERROR = 'CONTINUE';"
    note: "COPY loads files. Deduping late orders is a later MERGE."
  - label: "See what loaded"
    code: "SELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n  TABLE_NAME => 'ANALYTICS.RAW.ORDERS',\n  START_TIME => DATEADD('hour', -24, CURRENT_TIMESTAMP())\n));"
    note: "Load history is your first ingestion DQ."
quiz:
  - question: "COPY INTO is best used to…"
    options:
      - "Replace Dynamic Tables"
      - "Land files from a stage into a table"
      - "Train a Cortex model"
      - "Clone a database"
    answer: 1
    explanation: "Stages + COPY are the file door. Transformations belong in SQL/Snowpark after landing."
  - question: "Why keep a raw table close to the file shape?"
    options:
      - "So you can replay COPY and rebuild silver without re-extracting the source"
      - "Because SELECT * is always cheaper"
      - "To skip file formats"
      - "To disable Time Travel"
    answer: 0
    explanation: "Raw is your replay buffer. Marts are rebuilt from raw/silver, not from the SaaS API again."
---

Ingestion on Snowflake starts at a **stage**, not a mart. Shared story: files of **orders** land, then late events get merged, then a daily revenue mart refreshes.

## Stages

| Stage | Where files live | Use when |
|-------|------------------|----------|
| Internal | Snowflake-managed | Small drops, named pipes, simple workshops |
| External | S3 / GCS / Azure | Production extracts, partner drops |

```sql
CREATE STAGE IF NOT EXISTS analytics.raw.orders_ext
  URL = 's3://example-bucket/orders/'
  STORAGE_INTEGRATION = s3_int;
```

Do not paste long-lived keys into worksheets. Integrations + roles, not notebook secrets.

## COPY INTO

```sql
CREATE OR REPLACE FILE FORMAT analytics.raw.csv_ff
  TYPE = CSV
  SKIP_HEADER = 1
  FIELD_OPTIONALLY_ENCLOSED_BY = '"';

COPY INTO analytics.raw.orders
FROM @analytics.raw.orders_ext
FILE_FORMAT = (FORMAT_NAME = 'analytics.raw.csv_ff')
PATTERN = '.*orders_.*[.]csv'
ON_ERROR = 'CONTINUE';
```

COPY is **file-aware**: already-loaded files are skipped (unless you `FORCE`). That is not the same as row-level dedupe. Two files can still contain the same `order_id`.

## After COPY

1. DQ the load (`COPY_HISTORY`, row counts, nulls).
2. Dedupe / MERGE into silver ([SQL late-data lesson](/training/sql/sql-deduping-late-data)).
3. Wire COPY → Stream/Task → Dynamic Table in [Build warehouse ETL](/training/snowflake/sf-warehouse-etl-builder).
4. Refresh a Dynamic Table mart ([capstone](/training/snowflake/sf-capstone-dynamic-table-mart)).

Snowpipe is “COPY, but triggered.” Same landing table, same next steps.

## Exercises

1. Write a `FILE FORMAT` for JSON (`TYPE = JSON`, `STRIP_OUTER_ARRAY`).
2. Explain `ON_ERROR = CONTINUE` vs `ABORT_STATEMENT` for a finance file.
3. List three columns you would add on landing: `src_filename`, `ingested_at`, `src_row`.

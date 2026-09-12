---
slug: python-etl-pipeline-builder
track: python
title: "Build an ETL job — extract, transform, load"
description: "Assemble extract → transform → load into one retry-safe Python job: chunked extracts, contract-first transforms, staging writers, and an orchestrator-friendly CLI."
level: intermediate
order: 12
durationMinutes: 30
topics: [python, sql]
objectives:
  - "Wire extract, transform, and load as separate functions with I/O only at the edges"
  - "Land into staging, then publish with an idempotent overwrite or MERGE"
  - "Expose --start/--end/--dry-run so Airflow, Dagster, or Databricks Jobs can rerun safely"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "extract_orders (chunked)"
    code: "def extract_orders(read_sql, start: str, end: str, chunksize=50_000):\n    q = \"\"\"\n      SELECT order_id, customer_id, amount, status, updated_at, src_file\n      FROM raw.orders\n      WHERE updated_at >= %(start)s AND updated_at < %(end)s\n    \"\"\"\n    frames = list(read_sql(q, params={\"start\": start, \"end\": end}, chunksize=chunksize))\n    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()"
    note: "Extract is a window, not SELECT *. Chunk so a 20GB source never lands in RAM."
  - label: "transform_orders (contracts)"
    code: "REQUIRED = (\"order_id\", \"amount\", \"status\", \"updated_at\")\n\ndef transform_orders(raw: pd.DataFrame) -> pd.DataFrame:\n    missing = set(REQUIRED) - set(map(str, raw.columns))\n    if missing:\n        raise ValueError(f\"missing columns: {sorted(missing)}\")\n    out = raw.sort_values([\"updated_at\"]).drop_duplicates(\"order_id\", keep=\"last\")\n    out[\"event_date\"] = pd.to_datetime(out[\"updated_at\"]).dt.floor(\"D\")\n    return out"
    note: "Same latest-per-order_id rule as the SQL / warehouse silver grain."
  - label: "run() — orchestrator door"
    code: "def run(start: str, end: str, dry_run: bool = False) -> dict:\n    raw = extract_orders(read_sql, start, end)\n    clean = transform_orders(raw)\n    metrics = {\"rows_in\": len(raw), \"rows_out\": len(clean), \"start\": start, \"end\": end}\n    if dry_run:\n        return {**metrics, \"status\": \"dry_run\"}\n    write_staging_then_publish(clean, start, end)\n    return {**metrics, \"status\": \"ok\"}"
    note: "Copy into your repo or notebook and run it there — Python practice is copy-to-IDE on this track."
quiz:
  - question: "Where should file/SQL I/O live in this ETL job?"
    options:
      - "Inside every transform so notebooks stay linear"
      - "Only in extract and load; transforms stay pure and testable"
      - "Only in the quiz"
      - "Hardcoded in the README"
    answer: 1
    explanation: "Extract and load talk to systems. transform_orders should be pytest-able without a warehouse."
  - question: "A job retries after writing half of gold. What keeps the load safe?"
    options:
      - "Append the same window again"
      - "Write staging, then atomically overwrite/MERGE the publish slice"
      - "Delete the whole schema"
      - "Skip metrics"
    answer: 1
    explanation: "Staging + swap (or partition overwrite / MERGE on keys) makes retries idempotent."
  - question: "Why require --start and --end on the CLI?"
    options:
      - "So orchestrators can backfill and reprocess a late-data window"
      - "Aesthetics"
      - "To embed passwords"
      - "To skip contracts"
    answer: 0
    explanation: "Date windows are the job interface. Overlap the watermark for late orders."
---

This is the **Python ETL builder** — one job that stitches pieces you already met: [DataFrame contracts](/training/python/python-dataframe-contracts), [idempotent writers](/training/python/python-idempotent-writers), and [orchestration hooks](/training/python/python-orchestration-hooks). Shared story: **Orders → late events → daily revenue mart**.

There is **no in-browser Python runtime** on Aurora (team hold). Copy the samples into a repo or notebook. Warehouse SQL still owns the mart; this package owns **extract + rules + the job door**.

## Shape

```
extract_orders(start, end)  →  transform_orders(raw)  →  staging  →  publish
                                      ↑
                               pytest these rules
```

I/O at the edges. Business rules in the middle. Orchestrators call `python -m company_orders_mart --start … --end …`.

## Extract

Prefer a **watermark window**, not a full table scan.

```python
def extract_orders(read_sql, start: str, end: str, chunksize=50_000):
    q = """
      SELECT order_id, customer_id, amount, status, updated_at, src_file
      FROM raw.orders
      WHERE updated_at >= %(start)s AND updated_at < %(end)s
    """
    frames = list(read_sql(q, params={"start": start, "end": end}, chunksize=chunksize))
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
```

- Project only columns the contract needs.
- Chunk large JDBC/SQL extracts.
- Files work the same: list new objects since the last watermark, then `pd.concat` / Spark `read`.

APIs: page with `updated_at`, persist the last successful cursor **after** a successful load — never before.

## Transform

Reuse the contract habit. Latest `order_id` wins (silver grain).

```python
REQUIRED = ("order_id", "amount", "status", "updated_at")

def transform_orders(raw: pd.DataFrame) -> pd.DataFrame:
    missing = set(REQUIRED) - set(map(str, raw.columns))
    if missing:
        raise ValueError(f"missing columns: {sorted(missing)}")
    out = raw.sort_values(["updated_at"]).drop_duplicates("order_id", keep="last")
    out["event_date"] = pd.to_datetime(out["updated_at"]).dt.floor("D")
    return out


def gold_daily(clean: pd.DataFrame) -> pd.DataFrame:
    paid = clean.loc[clean["status"] == "paid"]
    return paid.groupby("event_date", as_index=False).agg(
        revenue=("amount", "sum"),
        order_cnt=("order_id", "nunique"),
    )
```

Test `transform_orders` and `gold_daily` without Spark. The writer stays thin.

## Load

Never publish half-visible gold.

1. Write **staging** (`stg_orders_{start}_{end}` or a temp view).
2. Run cheap DQ: `order_id` unique, `amount` not null.
3. Publish with **dynamic partition overwrite**, Delta `replaceWhere`, or `MERGE` on `order_id`.
4. Only then advance `pipeline_state.watermark_ts`.

```python
def write_staging_then_publish(clean, start, end):
    staging = f"staging.orders_{start}_{end}".replace("-", "")
    clean.to_sql(staging, con, if_exists="replace", index=False)
    # warehouse: MERGE staging → silver; rebuild gold slice; then DROP staging
```

Blind `mode("append")` on retry duplicates the window. That fails the shared scorecard.

## Orchestrate

```python
def run(start: str, end: str, dry_run: bool = False) -> dict:
    raw = extract_orders(read_sql, start, end)
    clean = transform_orders(raw)
    metrics = {"rows_in": len(raw), "rows_out": len(clean), "start": start, "end": end}
    if dry_run:
        return {**metrics, "status": "dry_run"}
    write_staging_then_publish(clean, start, end)
    return {**metrics, "status": "ok"}
```

Log JSON (`job`, `dt`, `rows_in`, `rows_out`, `status`). Exit `1` on contract or DQ failure. Pass `--overlap-days 2` for late refunds.

Packaging + pytest live in the [CLI capstone](/training/python/python-capstone-cli-package). Warehouse twins: [SQL staging→mart ETL](/training/sql/sql-staging-mart-etl), [Databricks medallion ETL](/training/databricks/dbx-medallion-etl-builder), [Snowflake warehouse ETL](/training/snowflake/sf-warehouse-etl-builder).

## Exercises

1. Add `--overlap-days` (default 2) and compute `extract_start = start - overlap`.
2. Write a pytest where a late refund flips `status` from `paid` to `refunded` and `gold_daily` drops that day to 0.
3. List three metrics you would emit besides row counts (`max(updated_at)`, rejected rows, bytes written).

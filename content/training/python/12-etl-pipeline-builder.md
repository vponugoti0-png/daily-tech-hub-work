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
  - label: "extract → transform → load"
    code: "import csv, json\nfrom pathlib import Path\n\nREQUIRED = (\"order_id\", \"status\", \"amount\")\n\ndef extract(path: Path) -> list[dict]:\n    with path.open(encoding=\"utf-8\") as f:\n        return list(csv.DictReader(f))\n\ndef transform(rows: list[dict]) -> list[dict]:\n    out = []\n    for row in rows:\n        missing = [k for k in REQUIRED if not row.get(k)]\n        if missing:\n            raise ValueError(f\"missing: {missing}\")\n        if row[\"status\"] == \"paid\":\n            out.append(row)\n    return out\n\ndef load(rows: list[dict], dest: Path) -> None:\n    dest.parent.mkdir(parents=True, exist_ok=True)\n    dest.write_text(json.dumps(rows, indent=2), encoding=\"utf-8\")\n\nraw = extract(Path(\"/data/orders.csv\"))\nclean = transform(raw)\nload(clean, Path(\"/data/staging/paid_orders.json\"))\nprint(\"rows_in\", len(raw), \"rows_out\", len(clean))"
    note: "Run in the local lab (stdlib + /data files). pandas/SQL I/O is the repo twin in the lesson body."
  - label: "transform_orders (contracts)"
    code: "REQUIRED = (\"order_id\", \"amount\", \"status\")\n\ndef transform_orders(rows: list[dict]) -> list[dict]:\n    out = []\n    for row in rows:\n        missing = [k for k in REQUIRED if not row.get(k)]\n        if missing:\n            raise ValueError(f\"missing columns: {missing}\")\n        out.append(row)\n    return out\n\nprint(transform_orders([{\"order_id\": \"1\", \"amount\": \"10\", \"status\": \"paid\"}]))"
    note: "Same latest-per-order_id rule as the SQL / warehouse silver grain — keep I/O out of this function."
  - label: "run() — orchestrator door"
    code: "def run(start: str, end: str, dry_run: bool = False) -> dict:\n    metrics = {\"start\": start, \"end\": end, \"status\": \"dry_run\" if dry_run else \"ok\"}\n    print(metrics)\n    return metrics\n\nprint(run(\"2026-09-01\", \"2026-09-02\", dry_run=True))"
    note: "Orchestrators pass --start/--end. This local lab calls run() — no Airflow, no credentials."
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
  - question: "In extract → transform → load, where do retries belong?"
    options:
      - "Around transform KeyError"
      - "Around extract/load I/O that can time out — not around a missing order_id"
      - "Around print()"
      - "Nowhere — never retry"
    answer: 1
    explanation: "I/O is transient. A broken row contract is not."
  - question: "The builder’s publish step should be…"
    options:
      - "Append-only with no key"
      - "Idempotent: same window replayed does not duplicate gold"
      - "A screenshot of a notebook"
      - "A DROP of the raw landing"
    answer: 1
    explanation: "Staging then MERGE/replace. Retries will happen."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

This is the **Python ETL builder** — one job that stitches pieces you already met: [DataFrame contracts](/training/python/python-dataframe-contracts), [idempotent writers](/training/python/python-idempotent-writers), and [orchestration hooks](/training/python/python-orchestration-hooks). Shared story: **Orders → late events → daily revenue mart**.

Practice the stdlib shape in the **local practice lab** on this page (`#lab`, Pyodide, `/data` CSV/JSON). pandas / warehouse I/O stays **copy-to-repo** in the samples below — not a live kernel and not a pandas wheel. Warehouse SQL still owns the mart; this package owns **extract + rules + the job door**.

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

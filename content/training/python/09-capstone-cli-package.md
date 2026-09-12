---
slug: python-capstone-cli-package
track: python
title: "Capstone — CLI entrypoint, tests, and package"
description: "Ship a tiny DE package: pyproject, python -m entrypoint with --start/--end, and pytest for the orders daily mart helpers."
level: advanced
order: 9
durationMinutes: 40
topics: [python]
objectives:
  - "Structure a shareable package with a CLI entrypoint"
  - "Accept backfill dates and a dry-run flag"
  - "Test grain and late-event helpers without a cluster"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "CLI entrypoint"
    code: "def main(argv=None):\n    p = argparse.ArgumentParser(prog=\"orders-mart\")\n    p.add_argument(\"--start\", required=True)\n    p.add_argument(\"--end\", required=True)\n    p.add_argument(\"--dry-run\", action=\"store_true\")\n    args = p.parse_args(argv)\n    run(args.start, args.end, dry_run=args.dry_run)\n    return 0\n\nif __name__ == \"__main__\":\n    raise SystemExit(main())"
    note: "Orchestrators call this. Notebooks do not hide the flags."
  - label: "pyproject sketch"
    code: "[project]\nname = \"company-orders-mart\"\nversion = \"0.1.0\"\nrequires-python = \">=3.11\"\n[project.scripts]\norders-mart = \"company_orders_mart.cli:main\""
    note: "Install the wheel in Jobs / CI. Stop copy-pasting transforms."
quiz:
  - question: "Why accept --start and --end on the capstone CLI?"
    options:
      - "Aesthetics"
      - "Backfills and reprocessing windows for late orders"
      - "To skip tests"
      - "To embed warehouse passwords"
    answer: 1
    explanation: "The shared story needs re-runs. Date windows are the interface."
  - question: "Package + tests mainly prevent…"
    options:
      - "Photon from running"
      - "Notebook copy-paste drift and untested grain bugs"
      - "Unity Catalog grants"
      - "Git branching"
    answer: 1
    explanation: "A wheel with pytest is how the CLI stays honest across Jobs."
  - question: "A CLI entrypoint should fail loud when…"
    options:
      - "The user passes --help"
      - "A required env var or window argument is missing"
      - "Logging is INFO"
      - "The package version contains a dot"
    answer: 1
    explanation: "Bad invocation is an error, not a silent empty load."
  - question: "Capstone tests should cover…"
    options:
      - "Only the README screenshots"
      - "Happy path plus one None-amount row and one retry-safe second run"
      - "Prod credentials"
      - "The vendor’s Spark source"
    answer: 1
    explanation: "The contract is None-handling and idempotence — not a pretty GIF."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

Optional Python capstone for the same story: **Orders → late events → daily revenue mart**. Assemble extract → transform → load first in [Build an ETL job](/training/python/python-etl-pipeline-builder). The warehouse SQL still owns the mart; this package owns **rules + the job door**.

## Layout

```
src/company_orders_mart/
  __init__.py
  cli.py
  grain.py
  late.py
tests/test_grain.py
pyproject.toml
```

## Rules you can test offline

```python
def latest_by_order(rows):
    """Keep the row with max (updated_at, ingested_at) per order_id."""
    best = {}
    for r in rows:
        key = r["order_id"]
        prev = best.get(key)
        if prev is None or (r["updated_at"], r["ingested_at"]) > (
            prev["updated_at"],
            prev["ingested_at"],
        ):
            best[key] = r
    return list(best.values())


def daily_revenue(rows):
    """Gold grain: event_date -> sum(amount) for status == paid."""
    out = {}
    for r in rows:
        if r.get("status") != "paid":
            continue
        day = r["event_date"]
        out[day] = out.get(day, 0) + r["amount"]
    return out
```

```python
def test_late_event_wins():
    rows = [
        {"order_id": "o1", "updated_at": 1, "ingested_at": 1, "amount": 10, "status": "paid", "event_date": "2026-09-01"},
        {"order_id": "o1", "updated_at": 2, "ingested_at": 2, "amount": 8, "status": "paid", "event_date": "2026-09-01"},
    ]
    latest = latest_by_order(rows)
    assert daily_revenue(latest) == {"2026-09-01": 8}
```

The Spark/Snowflake writer stays thin: call these policies, then MERGE/overwrite.

## CLI

Orchestration hooks from earlier in the track become the capstone door: `--start`, `--end`, `--dry-run`, exit code 0/1, JSON logs (`job`, `dt`, `rows`).

## Exercises

1. Add `--overlap-days` (default 2) and validate `YYYY-MM-DD`.
2. Write a test where a late refund changes `status` from `paid` to `refunded` and gold drops that day to 0.
3. Pin the package version in a fictional Databricks Job library list.

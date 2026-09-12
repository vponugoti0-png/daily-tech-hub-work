---
slug: python-orchestration-hooks
track: python
title: "Orchestration hooks & job entrypoints"
description: "CLI entrypoints, exit codes, and heartbeat patterns that play well with Airflow, Dagster, or Databricks Jobs."
level: intermediate
order: 6
durationMinutes: 30
topics: [python, general]
objectives:
  - "Build a clean `python -m` entrypoint"
  - "Use exit codes and structured logs"
  - "Support backfill date ranges"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "run(start, end, dry_run)"
    code: "def run(start: str, end: str, dry_run: bool = False) -> dict:\n    metrics = {\"start\": start, \"end\": end, \"status\": \"dry_run\" if dry_run else \"ok\"}\n    print(metrics)\n    return metrics\n\nprint(run(\"2026-09-01\", \"2026-09-02\", dry_run=True))"
    note: "Date windows are the job interface. Run this in the local lab — argparse is the CLI twin in the lesson body."
  - label: "JSON log line"
    code: "import json\nprint(json.dumps({\"job\": \"orders_etl\", \"dt\": \"2026-09-12\", \"status\": \"ok\", \"rows\": 5}))"
    note: "Dashboards parse one object per line. Do not log a DSN or the full row payload."
  - label: "Validate a partition"
    code: "import re\n\ndef assert_day(day: str) -> str:\n    if not re.fullmatch(r\"\\d{4}-\\d{2}-\\d{2}\", day):\n        raise ValueError(f\"expected YYYY-MM-DD, got {day!r}\")\n    return day\n\nprint(assert_day(\"2026-09-12\"))"
    note: "Refuse a junk --partition before extract. Same habit as a landing stem contract."
quiz:
  - question: "Why accept `--start` and `--end` on a batch job?"
    options:
      - "Only for aesthetics"
      - "To enable backfills and reprocessing windows"
      - "To disable logging"
      - "To skip schema checks"
    answer: 1
  - question: "Why keep extract/transform/load behind a main() the orchestrator calls?"
    options:
      - "So imports do not start a load"
      - "Because Python forbids functions"
      - "To hide secrets in import order"
      - "So pytest cannot import the module"
    answer: 0
    explanation: "Importing a module should not write gold. Hooks call main()."
  - question: "A good exit code convention is…"
    options:
      - "Always 0 so the DAG stays green"
      - "0 on success, non-zero on contract / load failure so the orchestrator retries or pages"
      - "Print “oops” and exit 0"
      - "Exit 0 after swallowing Exception"
    answer: 1
    explanation: "Orchestrators key off the process code. Green-on-failure hides incidents."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Orchestration hooks & job entrypoints

Practice `run(start, end, dry_run=…)` in the **local practice lab** on this page. The argparse CLI below is what Airflow / Dagster / Databricks Jobs call in a repo.

```python
import argparse, sys

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("--start", required=True)
    p.add_argument("--end", required=True)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args(argv)
    run(args.start, args.end, dry_run=args.dry_run)
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

Log JSON lines with `job`, `dt`, `status`, `rows` so dashboards parse them.

## Exercises

### Exercise 1
Add a `--partition` flag and validate YYYY-MM-DD format.

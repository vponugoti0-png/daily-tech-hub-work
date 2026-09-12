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
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Job entrypoint"
    code: "def main() -> int:\n    cfg = load_settings()\n    start, end = next_window(cfg.watermark)\n    run(start, end)\n    return 0\n\nif __name__ == \"__main__\":\n    raise SystemExit(main())"
    note: "Orchestrators call a function. Import side effects are a foot-gun."
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

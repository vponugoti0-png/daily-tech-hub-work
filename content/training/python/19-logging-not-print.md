---
slug: python-logging-not-print
track: python
title: "logging — not print — for ETL jobs"
description: "Structured logs are how Jobs, Tasks, and Airflow show rows_in / rows_out. print goes to a notebook and dies. Copyable examples — no Python lab."
level: beginner
order: -1
durationMinutes: 25
topics: [python]
objectives:
  - "Log at INFO for window metrics and WARNING/ERROR for contract breaks"
  - "Include start, end, rows_in, rows_out — not a dump of every row"
  - "Keep secrets and raw PII out of log lines"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Job-shaped logger"
    code: "import logging\n\nlog = logging.getLogger(\"aurora.orders_etl\")\n\ndef run(start: str, end: str, extract, transform, load) -> dict:\n    raw = extract(start, end)\n    clean = transform(raw)\n    metrics = {\"start\": start, \"end\": end, \"rows_in\": len(raw), \"rows_out\": len(clean)}\n    log.info(\"transform_ok %s\", metrics)\n    load(clean)\n    log.info(\"load_ok %s\", metrics)\n    return metrics"
    note: "getLogger(name) so Databricks / Airflow can route it. Copy into your repo — no Python runtime lab."
  - label: "Configure once at the edge"
    code: "import logging\n\nlogging.basicConfig(\n    level=logging.INFO,\n    format=\"%(asctime)s %(levelname)s %(name)s %(message)s\",\n)\n# In a notebook: logging.getLogger(\"aurora\").setLevel(logging.INFO)\n# Do not basicConfig inside transform_orders."
    note: "Libraries log. Apps configure. A transform that calls basicConfig fights the orchestrator."
  - label: "What not to log"
    code: "# Bad: log.info(\"row=%s\", row)           # dumps email / tokens\n# Bad: log.info(\"dsn=%s\", DATABASE_URL)  # secrets\n# Bad: print(clean)                      # 50k rows in a notebook\n\nlog.warning(\"quarantined %s rows\", n_bad)"
    note: "Metrics and counts. If you need a sample, log one order_id, not the payload."
quiz:
  - question: "Why prefer logging.getLogger('aurora.orders_etl') over print?"
    options:
      - "print is illegal in Python 3"
      - "Orchestrators can set level, format, and destination; print is a notebook leftover"
      - "logging cannot format strings"
      - "print cannot show integers"
    answer: 1
    explanation: "Jobs capture logs. print is easy to miss, hard to filter, and has no level."
  - question: "Which line belongs at INFO after a successful transform?"
    options:
      - "The full list of row dicts"
      - "start, end, rows_in, rows_out"
      - "The database password"
      - "Every email on aurora_customers"
    answer: 1
    explanation: "Window metrics are how you debug incrementals. Payloads and secrets do not."
  - question: "basicConfig inside paid_only is a problem because…"
    options:
      - "basicConfig is deprecated"
      - "A library function should not own process-wide logging config"
      - "INFO cannot be used in functions"
      - "getLogger requires it"
    answer: 1
    explanation: "Configure once in the CLI / notebook entrypoint. Transforms just log."
---

Logs are the **observability** of a batch job. If the only signal is a green checkbox, you will not know `rows_out` collapsed to zero.

**Copy the examples.** There is **no Python runtime lab** (same team hold as the ETL builder).

## INFO is a metric

```python
log.info("transform_ok %s", {"start": start, "end": end, "rows_in": n_in, "rows_out": n_out})
```

`WARNING` for quarantine counts. `ERROR` then raise for contract breaks.

## print is a leftover

Notebooks teach `print(df.head())`. Jobs need `getLogger`. The next reader is a person at 2am, not you in the cell.

## Exercises

1. Add `log.info` metrics to a `run(start, end)` sketch.
2. Rewrite a `print(row)` debugging line as `log.debug("order_id=%s", row["order_id"])`.
3. Write one sentence for a PR template: “no secrets, no full row payloads in INFO.”

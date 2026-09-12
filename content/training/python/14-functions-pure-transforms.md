---
slug: python-functions-pure-transforms
track: python
title: "Functions — pure transforms, I/O at the edges"
description: "Name extract, transform, and load as functions. Transforms take data in and return data out — no hidden file, SQL, or print side effects."
level: beginner
order: -6
durationMinutes: 25
topics: [python]
objectives:
  - "Split extract / transform / load so only the edges talk to systems"
  - "Return a new structure from transform instead of mutating a global list"
  - "Keep print/logging out of the function that implements the grain"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Pure status filter"
    code: "def paid_only(rows: list[dict]) -> list[dict]:\n    return [r for r in rows if r.get(\"status\") == \"paid\"]\n\nraw = [{\"order_id\": 1, \"status\": \"paid\"}, {\"order_id\": 2, \"status\": \"pending\"}]\nprint(paid_only(raw))"
    note: "Same input → same output. No file, no SQL, no global. Run it in the local practice lab."
  - label: "I/O stays in extract / load"
    code: "def extract_orders(read_rows, start: str, end: str) -> list[dict]:\n    return list(read_rows(start, end))\n\ndef load_staging(write_rows, rows: list[dict]) -> int:\n    write_rows(rows)\n    return len(rows)"
    note: "Pass the reader/writer in. Tests can fake them. Do not import a warehouse client inside paid_only."
  - label: "Do not mutate the caller's list"
    code: "def with_event_date(rows: list[dict], key=\"order_date\") -> list[dict]:\n    return [{**r, \"event_date\": r[key]} for r in rows]\n\n# Bad: for r in rows: r[\"event_date\"] = r[key]  # surprises the caller"
    note: "In-place updates make retries and tests lie. Return a new list of dicts."
quiz:
  - question: "Where should SQL / file I/O live?"
    options:
      - "Inside every helper so notebooks stay linear"
      - "Only in extract and load; transforms stay pure and testable"
      - "Only in print statements"
      - "Hardcoded at module import"
    answer: 1
    explanation: "Transforms should be pytest-able without a warehouse. The [ETL builder](/training/python/python-etl-pipeline-builder) wires the same split."
  - question: "A transform that appends to a module-level ROWS = [] is risky because…"
    options:
      - "Lists cannot hold dicts"
      - "A retry or a second test sees leftover rows"
      - "Python forbids globals"
      - "None cannot append"
    answer: 1
    explanation: "Hidden mutable state is why jobs double-count on retry. Return values instead."
  - question: "Why pass read_rows into extract_orders instead of importing snowflake.connector inside the function?"
    options:
      - "Imports are illegal in functions"
      - "Tests and dry-runs can inject a fake reader"
      - "It makes the function slower"
      - "Connectors cannot live in extract"
    answer: 1
    explanation: "Dependency injection is a test seam. Production still passes the real reader."
---

Functions are how ETL stays reviewable. **Copy the examples** — there is no in-browser Python runtime.

## Three verbs

| Function | Talks to | Returns |
|----------|----------|---------|
| `extract_*` | SQL, files, APIs | rows |
| `transform_*` | nothing | rows |
| `load_*` | staging / warehouse | counts |

If `paid_only` opens a socket, it is not `paid_only`.

## Return, do not mutate

```python
def paid_only(rows: list[dict]) -> list[dict]:
    return [r for r in rows if r["status"] == "paid"]
```

The caller still has `raw`. A retry can call you again.

## Exercises

1. Write `cancelled_dropped(rows)` that returns a new list.
2. Sketch `extract_orders(read_rows, start, end)` that does not import a driver.
3. Explain why `print` inside `paid_only` makes a unit test noisy (logging belongs later).

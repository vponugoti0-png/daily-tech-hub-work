---
slug: python-exceptions-retries
track: python
title: "Exceptions and retry-shaped handling"
description: "Fail loud on contract breaks. Retry only transient I/O. Do not swallow Exception and return []. Practice in the local Pyodide lab."
level: beginner
order: -4
durationMinutes: 25
topics: [python]
objectives:
  - "Raise ValueError / TypeError on grain and schema breaks"
  - "Catch a narrow exception around extract I/O, not around transform"
  - "Retry transient failures with a budget — not an infinite while True"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Loud contract vs transient I/O"
    code: "class TransientExtractError(Exception):\n    pass\n\ndef extract_with_budget(read_rows, start: str, end: str, attempts=3):\n    last = None\n    for i in range(attempts):\n        try:\n            return read_rows(start, end)\n        except TransientExtractError as exc:\n            last = exc\n    raise TransientExtractError(f\"extract failed after {attempts} tries\") from last"
    note: "Do not catch Exception. Do not retry ValueError from a bad schema. Copy into your repo."
  - label: "Do not swallow"
    code: "def transform_orders(rows: list[dict]) -> list[dict]:\n    out = []\n    for row in rows:\n        if \"order_id\" not in row:\n            raise ValueError(f\"row missing order_id: {row!r}\")\n        out.append(row)\n    return out\n\n# Bad: except Exception: return []"
    note: "An empty list looks like a successful empty window. Gold will under-count and nobody pages."
  - label: "Keep the reason"
    code: "quarantine = []\n\ndef split_or_raise(row: dict):\n    try:\n        amount = row[\"amount\"]\n        if amount is None:\n            raise ValueError(\"amount is None\")\n        return {\"ok\": row}\n    except (KeyError, ValueError, TypeError) as exc:\n        quarantine.append({\"row\": row, \"reason\": str(exc)})\n        return None"
    note: "If you skip a row, persist the reason. Silent continue is the same as coerce-to-zero."
quiz:
  - question: "Which failure should you retry?"
    options:
      - "ValueError: missing order_id"
      - "A timeout talking to the warehouse (narrow, budgeted)"
      - "TypeError: amount is a dict"
      - "Any Exception, forever"
    answer: 1
    explanation: "Retries are for flaky I/O. Schema bugs will fail the same way on try 99."
  - question: "except Exception: return [] after extract is dangerous because…"
    options:
      - "Lists cannot be empty"
      - "Callers cannot tell a real empty window from a crash"
      - "Python forbids Exception"
      - "Retries become faster"
    answer: 1
    explanation: "Empty success is how incrementals go quiet. Raise, or return a Result with ok=False."
  - question: "Why catch TransientExtractError instead of Exception in the retry loop?"
    options:
      - "Custom exceptions are required by PEP 8"
      - "KeyboardInterrupt, MemoryError, and schema bugs should not look like a blip"
      - "It makes retries infinite"
      - "ValueError cannot be raised"
    answer: 1
    explanation: "Narrow catches keep fail-loud behavior for contracts. Broad catches hide pages."
---

Exceptions are how jobs **page**. Retries are how they survive blips. Mixing the two is how gold goes quiet.

**Copy the examples.** No Python runtime lab.

## Raise on contracts

Missing `order_id`, `amount` of the wrong type, a stem that does not match — these are `ValueError` / `TypeError`. They should fail the task.

## Retry only I/O

```python
for i in range(3):
    try:
        return read_rows(start, end)
    except TransientExtractError:
        if i == 2:
            raise
```

Sleep/backoff lives in the orchestrator (Airflow, Jobs) more often than in your library. If you sleep in-process, cap it.

## Exercises

1. Write `transform_orders` that raises on a missing `order_id`.
2. Sketch a 3-attempt extract that only retries `TransientExtractError`.
3. Explain why `except Exception: pass` in a Databricks notebook is a worse incident than a red X.

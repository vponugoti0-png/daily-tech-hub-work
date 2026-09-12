---
slug: python-datetimes-watermarks
track: python
title: "datetimes and incremental watermarks"
description: "Store UTC, compare aware datetimes, and treat the high-watermark as a half-open window — not a string you glue. Copyable only."
level: beginner
order: -3
durationMinutes: 25
topics: [python]
objectives:
  - "Parse and compare timezone-aware datetimes (UTC) at extract boundaries"
  - "Build a half-open [start, end) watermark window"
  - "Refuse to format a user string into SQL — bind a datetime parameter"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "UTC parse + half-open window"
    code: "from datetime import datetime, timedelta, timezone\n\ndef next_window(watermark: datetime, hours=24) -> tuple[datetime, datetime]:\n    if watermark.tzinfo is None:\n        raise ValueError(\"watermark must be timezone-aware\")\n    start = watermark\n    end = watermark + timedelta(hours=hours)\n    return start, end\n\nwm = datetime(2026, 9, 12, tzinfo=timezone.utc)\nprint(next_window(wm))"
    note: "Naive datetimes are a foot-gun across DST. Copy into a REPL — no Python lab on this site."
  - label: "Filter rows in Python (small samples)"
    code: "def in_window(rows, start, end, key=\"updated_at\"):\n    out = []\n    for r in rows:\n        ts = r[key]\n        if ts.tzinfo is None:\n            raise ValueError(\"row timestamp is naive\")\n        if start <= ts < end:\n            out.append(r)\n    return out"
    note: "Production should push this filter to SQL/Spark. The Python shape documents the grain."
  - label: "Bind, do not glue"
    code: "SQL = \"\"\"\nSELECT order_id, updated_at\nFROM raw.orders\nWHERE updated_at >= %(start)s AND updated_at < %(end)s\n\"\"\"\n\n# cursor.execute(SQL, {\"start\": start, \"end\": end})\n# Bad: f\"WHERE updated_at >= '{start}'\""
    note: "Same rule as the SQL dates lesson. The engine receives values, not SQL text."
quiz:
  - question: "A watermark stored as the string 2026-09-12 00:00:00 with no timezone is risky because…"
    options:
      - "Strings cannot be compared"
      - "DST and warehouse calendars will shift the window without anyone noticing"
      - "datetime cannot parse it"
      - "UTC is illegal"
    answer: 1
    explanation: "Aware UTC (or an explicit warehouse TZ) is the contract. Naive local time is a late-data bug."
  - question: "Why prefer updated_at >= start AND updated_at < end?"
    options:
      - "It is shorter to type"
      - "Half-open windows do not double-count the boundary on the next run"
      - "BETWEEN is illegal"
      - "It converts None to 0"
    answer: 1
    explanation: "If both runs include the end instant, you duplicate. Half-open is the incremental default."
  - question: "f\"WHERE d = '{user_date}'\" is a problem because…"
    options:
      - "f-strings are slower than +"
      - "A user string can change the statement — bind a typed parameter"
      - "datetime cannot be formatted"
      - "SQL cannot compare dates"
    answer: 1
    explanation: "Injection is a string-construction bug. Bind parameters. This is awareness, not a payload catalog."
---

Watermarks are how incrementals **resume**. They are datetimes, not filenames you hope are sorted.

**Copy the examples.** No Python runtime lab.

## Aware UTC

```python
from datetime import datetime, timezone
watermark = datetime(2026, 9, 12, tzinfo=timezone.utc)
```

If you get a naive value from a driver, attach the warehouse timezone **explicitly** — do not assume laptop local.

## Half-open

`[start, end)` so the next run can start at `end`. Same habit as SQL `>=` / `< next`.

## Exercises

1. Write `next_window` that rejects naive watermarks.
2. Filter a tiny list of dicts with `start <= ts < end`.
3. Rewrite a glued `f-string` WHERE as a bound `%(start)s` parameter.

---
slug: python-pathlib-extracts
track: python
title: "pathlib extracts — land files on purpose"
description: "Treat incoming files as a landing contract: Path, glob, suffix, and stem. Do not concatenate cwd strings. Practice in the local Pyodide lab."
level: beginner
order: -5
durationMinutes: 25
topics: [python]
objectives:
  - "Build landing paths with pathlib.Path instead of string joins"
  - "Glob only the suffix you mean (*.json, *.parquet)"
  - "Refuse to read a file whose stem fails a date/id pattern"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Landing glob"
    code: "from pathlib import Path\n\nLANDING = Path(\"/data/landing/orders\")\n\ndef list_order_files(day: str) -> list[Path]:\n    folder = LANDING / day\n    return sorted(folder.glob(\"*.json\"))\n\n# list_order_files(\"2026-09-12\")"
    note: "Path / part is the join. glob is an allow-list. The lab seeds /data/landing/orders."
  - label: "Stem contract"
    code: "from pathlib import Path\n\ndef assert_orders_stem(path: Path) -> str:\n    # orders_2026-09-12.json\n    stem = path.stem  # orders_2026-09-12\n    prefix, _, day = stem.partition(\"_\")\n    if prefix != \"orders\" or len(day) != 10:\n        raise ValueError(f\"unexpected landing name: {path.name}\")\n    return day"
    note: "Autoloader / COPY have the same idea: only files that match the pattern. A random .json is not an incremental."
  - label: "Read bytes at the edge"
    code: "def extract_json_file(path: Path, loads) -> list[dict]:\n    text = path.read_text(encoding=\"utf-8\")\n    payload = loads(text)\n    if not isinstance(payload, list):\n        raise TypeError(\"orders file must be a JSON array\")\n    return payload"
    note: "Pass json.loads in so tests can inject. Do not json.load a 20GB file — chunk in the next lesson."
quiz:
  - question: "Why prefer Path(landing) / day / filename over landing + '/' + day?"
    options:
      - "Path is faster than strings"
      - "Joins stay OS-safe and readable; you can .glob / .stem without re-parsing slashes"
      - "Strings cannot hold dates"
      - "pathlib writes to Snowflake"
    answer: 1
    explanation: "String concat is how // and \\ bugs land. Path is the contract."
  - question: "folder.glob('*') on a landing directory is risky because…"
    options:
      - "glob is deprecated"
      - "It picks up _SUCCESS, .crc, and leftover files that are not the grain"
      - "Path cannot glob"
      - "It always reads parquet as JSON"
    answer: 1
    explanation: "Name the suffix. Spark/Autoloader listings have the same leftover-file problem."
  - question: "A file named notes.json lands in /data/landing/orders/2026-09-12. What should extract do?"
    options:
      - "Parse it as orders"
      - "Reject the stem — it is not orders_YYYY-MM-DD"
      - "Rename it in place"
      - "print the path and continue"
    answer: 1
    explanation: "Landing is a contract. Unexpected names go to quarantine or an alert, not into gold."
---

Extract starts on **disk** (or object storage that looks like disk). `pathlib` is how you name the landing without inventing a mini-parser.

Run the landing glob in the **local practice lab** — the lab seeds `/data/landing/orders`.

## Path is the join

```python
from pathlib import Path
LANDING = Path("/data/landing/orders")
files = sorted((LANDING / "2026-09-12").glob("*.json"))
```

`Path.read_text` / `read_bytes` belong in `extract_*`, not in `transform_*`.

## Stem is a key

`orders_2026-09-12.json` has a date you can parse. `notes.json` does not. Fail loud.

## Exercises

1. Write `list_order_files(day)` that only returns `*.json`.
2. Write `assert_orders_stem` for `orders_YYYY-MM-DD.json`.
3. Explain why you would not `Path.cwd() / user_input` without an allow-list (path traversal is a string-construction bug — same family as SQL glue).

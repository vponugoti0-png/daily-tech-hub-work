---
slug: python-typing-for-pipelines
track: python
title: "Typing for reliable pipelines"
description: "TypedDicts, Protocols, and gradual typing that make ETL contracts enforceable in CI."
level: intermediate
order: 2
durationMinutes: 35
topics: [python]
objectives:
  - "Model row contracts with TypedDict"
  - "Use Protocols for duck-typed DataFrame APIs"
  - "Catch schema drift in type-checked helpers"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "TypedDict"
    code: "from typing import TypedDict\nfrom datetime import datetime\n\nclass Event(TypedDict):\n    event_id: str\n    ts: datetime"
    note: "Row contract for dict-shaped extracts — static check, not a runtime Spark plan."
  - label: "Protocol"
    code: "from typing import Protocol, Sequence\n\nclass FrameLike(Protocol):\n    columns: Sequence[str]"
    note: "Duck-typed DataFrame surface so helpers stay pandas/Spark portable."
  - label: "Required keys helper"
    code: "def missing_keys(row: Event, required: tuple[str, ...] = (\"event_id\", \"ts\")) -> list[str]:\n    return [k for k in required if k not in row]"
    note: "Pair the TypedDict with a tiny runtime guard in CI tests."
quiz:
  - question: "TypedDict is best used for…"
    options:
      - "Runtime Spark Catalyst plans"
      - "Documenting and statically checking dict-shaped row contracts"
      - "Replacing all DataFrames"
      - "GPU kernels"
    answer: 1
---

# Typing for reliable pipelines

Types won't stop bad data at the warehouse door, but they **shrink the blast radius** of API mistakes and make reviews faster.

## TypedDict row contracts

```python
from typing import TypedDict
from datetime import datetime

class RawEvent(TypedDict):
    event_id: str
    user_id: str
    ts: datetime
    payload: dict
```

## Protocols for frame-like objects

```python
from typing import Protocol, Sequence

class HasColumns(Protocol):
    @property
    def columns(self) -> Sequence[str]: ...

def require(frame: HasColumns, cols: Sequence[str]) -> None:
    missing = set(cols) - set(map(str, frame.columns))
    if missing:
        raise ValueError(sorted(missing))
```

## Gradual adoption

1. Annotate public transform signatures first.
2. Add `mypy`/`pyright` in CI on `src/transforms`.
3. Keep runtime asserts for data — types don't validate parquet.

## Exercises

### Exercise 1
Define a `TypedDict` for a SCD2 dimension row (`natural_key`, `valid_from`, `valid_to`, `is_current`).

### Exercise 2
Write a Protocol that requires `.select(*cols)` and use it in a helper signature.

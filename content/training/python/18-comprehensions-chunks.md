---
slug: python-comprehensions-chunks
track: python
title: "Comprehensions and chunked extracts"
description: "Use list/dict comprehensions for small transforms. Use generators to stream chunks so a 20GB extract never becomes one list. Copyable only."
level: beginner
order: -2
durationMinutes: 25
topics: [python]
objectives:
  - "Write a list comprehension that filters and projects a row contract"
  - "Yield chunks from extract instead of materializing every row"
  - "Know when a comprehension is hiding a grain bug (nested loops / fan-out)"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Project + filter"
    code: "rows = [\n    {\"order_id\": 1, \"status\": \"paid\", \"amount\": 10},\n    {\"order_id\": 2, \"status\": \"pending\", \"amount\": 99},\n]\npaid = [\n    {\"order_id\": r[\"order_id\"], \"amount\": r[\"amount\"]}\n    for r in rows\n    if r[\"status\"] == \"paid\"\n]\nprint(paid)"
    note: "One row in, one row out. Run this in the local practice lab. A nested comprehension over items×orders is a fan-out."
  - label: "Chunk generator"
    code: "def extract_chunks(read_chunk, start: str, end: str, size=50_000):\n    offset = 0\n    while True:\n        batch = read_chunk(start, end, offset, size)\n        if not batch:\n            return\n        yield batch\n        offset += len(batch)\n\n# for chunk in extract_chunks(...): transform(chunk)"
    note: "yield keeps RAM flat. list(extract_chunks(...)) undoes the point. Same idea as pandas chunksize / Spark partitions."
  - label: "Do not fan out in a comprehension"
    code: "# Bad: [ (o, i) for o in orders for i in items if i[\"order_id\"] == o[\"order_id\"] ]\n# That is a join explode. Aggregate items first, or iterate one grain.\n\ndef order_ids(orders):\n    return {o[\"order_id\"] for o in orders}"
    note: "A set comprehension is a key set — good for leftovers. A double-for comprehension is often an accidental join."
quiz:
  - question: "Why yield chunks instead of returning one giant list?"
    options:
      - "Generators are required by PEP 8"
      - "A 20GB extract should never be one Python list"
      - "list cannot hold dicts"
      - "yield makes SQL faster"
    answer: 1
    explanation: "Memory is the point. The [performance](/training/python/python-performance-de) lesson says the same: chunk or push down."
  - question: "A double-for comprehension over orders×items is risky because…"
    options:
      - "Python forbids nested fors"
      - "You fan out order grain and will double-count amount if you SUM later"
      - "Comprehensions cannot filter"
      - "items cannot be dicts"
    answer: 1
    explanation: "Same fan-out as a SQL join to a many-side table. Aggregate or keep one grain."
  - question: "list(extract_chunks(...)) after you wrote a generator…"
    options:
      - "Is required to run it"
      - "Pulls every chunk into RAM and defeats the design"
      - "Retries automatically"
      - "Binds SQL parameters"
    answer: 1
    explanation: "Iterate and load each chunk (or write staging per chunk). Do not reassemble the lake."
---

Comprehensions are **small** transforms. Generators are **large** extracts. Mixing them — `[row for chunk in extract() for row in chunk]` — is how RAM comes back.

**Edit and Run** in the local practice lab — not a live cloud kernel.

## One grain per comprehension

```python
paid = [
    {"order_id": r["order_id"], "amount": r["amount"]}
    for r in rows
    if r["status"] == "paid"
]
```

If you need items, write an items loop, or aggregate first.

## yield

```python
def extract_chunks(...):
    ...
    yield batch
```

The [ETL builder](/training/python/python-etl-pipeline-builder) uses `chunksize=` for the same reason.

## Exercises

1. Write a comprehension that keeps `status == "paid"` and projects `order_id`, `amount`.
2. Sketch `extract_chunks` that yields until `read_chunk` returns empty.
3. Explain why a set of `order_id`s is safer leftover tracking than a nested join comprehension.

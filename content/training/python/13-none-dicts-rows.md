---
slug: python-none-dicts-rows
track: python
title: "None, dicts, and pipeline rows"
description: "Treat each extract row as a dict with a named key set. None is unknown — it is not 0, not '', and not a license to .get() away a required column."
level: beginner
order: -7
durationMinutes: 25
topics: [python]
objectives:
  - "Model one pipeline row as a dict whose keys are the contract"
  - "Distinguish missing keys from keys present with value None"
  - "Refuse to coerce None amount to 0 unless a product owner named that default"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Row dict + required keys"
    code: "REQUIRED = (\"order_id\", \"status\", \"amount\")\n\ndef assert_row(row: dict) -> dict:\n    missing = [k for k in REQUIRED if k not in row]\n    if missing:\n        raise ValueError(f\"missing keys: {missing}\")\n    return row\n\nrow = {\"order_id\": 1001, \"status\": \"paid\", \"amount\": 42.5, \"promo_code\": None}\nassert_row(row)"
    note: "promo_code may be None. order_id may not be absent. Run this in the local practice lab on this page."
  - label: "None vs missing vs default"
    code: "def promo_or_none(row: dict):\n    if \"promo_code\" not in row:\n        raise KeyError(\"promo_code not in contract\")\n    return row[\"promo_code\"]  # may be None\n\n# Bad: row.get(\"amount\", 0) hides a landing bug\n# Bad: amount or 0  # also treats 0 as missing"
    note: "get(key, 0) is a silent default. Required measures should raise."
  - label: "Count unknown promos"
    code: "rows = [\n    {\"order_id\": 1, \"promo_code\": \"FALL26\"},\n    {\"order_id\": 2, \"promo_code\": None},\n]\nunknown = sum(1 for r in rows if r[\"promo_code\"] is None)\nprint(unknown)  # 1"
    note: "is None, not == None in reviews. Truthiness (if not promo) also treats '' as unknown — say which you mean."
  - label: "Paid rows only"
    code: "rows = [\n    {\"order_id\": 1, \"status\": \"paid\", \"amount\": 10},\n    {\"order_id\": 2, \"status\": \"pending\", \"amount\": None},\n]\npaid = [r for r in rows if r[\"status\"] == \"paid\" and r[\"amount\"] is not None]\nprint(paid)"
    note: "Filter on status and keep unknown amounts out of gold. Run it in the local lab."
  - label: "Promo ref vs None"
    code: "if \"promo_code\" not in row:\n    raise KeyError(\"promo_code missing\")\ncode = row[\"promo_code\"]  # may be None\nknown = code is not None"
    note: "Missing key ≠ None. Run the promo lookup sample in the local lab."
quiz:
  - question: "A bronze dict has amount: None. What should transform do by default?"
    options:
      - "Replace with 0 so SUM works"
      - "Keep None or quarantine the row — do not invent revenue"
      - "Delete the key"
      - "Convert to the string 'None'"
    answer: 1
    explanation: "None is unknown. Zero-filling hides a landing bug and lies in gold."
  - question: "row.get('order_id', 0) on a required key is risky because…"
    options:
      - "get is slower than []"
      - "A missing key becomes 0 and looks like a real id"
      - "dicts cannot store ints"
      - "None cannot live in a dict"
    answer: 1
    explanation: "Defaults hide contract breaks. Raise, or send the row to a quarantine list with a reason."
  - question: "if row['promo_code']: skip treats which values as false?"
    options:
      - "Only None"
      - "None, '', 0, False — probably more than you meant"
      - "Only missing keys"
      - "Only the string 'NULL'"
    answer: 1
    explanation: "Truthiness is not a NULL test. Use `is None` when you mean unknown."
  - question: "A landing JSON has the key promo_code with value null. After json.loads, Python sees…"
    options:
      - "The string 'null'"
      - "None — treat it as unknown, not a missing key"
      - "A missing key so .get is required"
      - "0"
    answer: 1
    explanation: "JSON null becomes None. The key is present. That is different from a file that omitted the field."
  - question: "Why is `amount or 0` a gold bug?"
    options:
      - "or is slow"
      - "It turns None and 0 into 0, so you cannot tell unknown from a real zero"
      - "Dicts cannot store 0"
      - "JSON forbids 0"
    answer: 1
    explanation: "Truthiness collapses None and 0. Use `is None` when you mean unknown."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

True-zero Python for pipeline rows. **Edit and Run** in the local practice lab on this page — not a live cloud kernel. DuckDB labs stay on the SQL / Databricks / Snowflake tracks.

## A row is a contract

```python
REQUIRED = ("order_id", "customer_id", "status", "amount")

def assert_row(row: dict) -> dict:
    missing = [k for k in REQUIRED if k not in row]
    if missing:
        raise ValueError(f"missing keys: {missing}")
    return row
```

`promo_code` can be present and `None`. That is different from a landing that omitted the key.

## None is unknown

Do not `amount or 0`. Do not `float(amount or 0)`. If the warehouse would use `IS NULL`, Python should use `is None`.

## Exercises

1. Write `assert_row` that rejects a missing `order_id` but allows `promo_code is None`.
2. Count rows where `amount is None` in a short list of dicts.
3. Explain why `.get("amount", 0)` is a gold-revenue bug.

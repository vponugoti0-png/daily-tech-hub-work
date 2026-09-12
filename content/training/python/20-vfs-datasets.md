---
slug: python-vfs-datasets
track: python
title: "Practice data files in the local lab"
description: "Read seeded JSON / JSONL files from the in-browser VFS: customers, shipments, events, and landing leftovers. Same-origin only — no network, no shell."
level: beginner
order: 20
durationMinutes: 25
topics: [python]
objectives:
  - "Load JSON and JSONL from /data on the lab VFS"
  - "Reject landing leftovers whose stem is not orders_YYYY-MM-DD"
  - "Keep secrets and urllib out of the sample"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Read customers.json"
    code: "import json\nfrom pathlib import Path\n\nrows = json.loads(Path(\"/data/customers/customers.json\").read_text())\nactive = [r for r in rows if r[\"status\"] == \"active\"]\nprint(len(active), [r[\"customer_id\"] for r in active])"
    note: "Same-origin VFS. Run it in the local practice lab on this page."
  - label: "Shipments extract"
    code: "import json\nfrom pathlib import Path\n\nfor row in json.loads(Path(\"/data/shipments/shipments.json\").read_text()):\n    print(row[\"order_id\"], row[\"carrier\"], row[\"status\"])"
    note: "One file, one contract. Do not glob '*' and hope."
  - label: "JSONL events"
    code: "import json\nfrom pathlib import Path\n\npaid = []\nfor line in Path(\"/data/events/events.jsonl\").read_text().splitlines():\n    if not line.strip():\n        continue\n    event = json.loads(line)\n    if event[\"event_type\"] == \"paid\":\n        paid.append(event[\"order_id\"])\nprint(paid)"
    note: "One object per line. json.loads on the whole file will fail."
quiz:
  - question: "Why not json.loads the entire events.jsonl file?"
    options:
      - "JSONL is faster that way"
      - "The file is one object per line — the whole file is not one JSON value"
      - "Pathlib cannot read files"
      - "The lab requires Spark"
    answer: 1
    explanation: "Split lines, skip blanks, loads each object."
  - question: "notes.json in the landing folder is…"
    options:
      - "A valid orders extract"
      - "A leftover — reject stems that are not orders_YYYY-MM-DD"
      - "A secret manager"
      - "A Unity Catalog volume"
    answer: 1
    explanation: "glob('*.json') is greedy. Assert the stem."
  - question: "This lab will refuse…"
    options:
      - "print() of a customer_id"
      - "import urllib.request or a JS bridge"
      - "pathlib.Path.read_text on /data/..."
      - "A list comprehension"
    answer: 1
    explanation: "No network, no shell, no js module. Stdlib files on the VFS only."
---

The **local practice lab** on this page seeds files under `/data`. Edit the sample and **Run**. Not a cloud kernel.

## What is on disk

| Path | What it is |
|------|------------|
| `/data/landing/orders/YYYY-MM-DD/orders_*.json` | Daily landing |
| `/data/landing/orders/2026-09-12/notes.json` | Leftover — reject it |
| `/data/customers/customers.json` | Small dim |
| `/data/shipments/shipments.json` | Shipment status |
| `/data/events/events.jsonl` | Event stream |
| `/data/tickets/tickets.json` | Support tickets |
| `/data/config/job.json` | Start/end/env — no password |

## Exercises

1. Count active customers from `/data/customers/customers.json`.
2. List leftover landing files for `2026-09-12` whose stem is not `orders_2026-09-12`.
3. Collect `order_id` for `event_type == 'paid'` from the JSONL file.

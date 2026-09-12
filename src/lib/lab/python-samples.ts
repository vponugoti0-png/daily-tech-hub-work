import type { LabSample } from "./samples";

export const PYTHON_LAB_ENTRY_SLUG = "python-none-dicts-rows";

export const PYTHON_LAB_SLUGS = [
  "python-none-dicts-rows",
  "python-functions-pure-transforms",
  "python-pathlib-extracts",
  "python-exceptions-retries",
  "python-datetimes-watermarks",
  "python-comprehensions-chunks",
  "python-logging-not-print",
  "python-dataframe-contracts",
] as const;

export type PythonLabSlug = (typeof PYTHON_LAB_SLUGS)[number];

const PYTHON_SAMPLES: LabSample[] = [
  {
    id: "py-assert-row",
    label: "Row dict + required keys",
    sql: `REQUIRED = ("order_id", "status", "amount")

def assert_row(row: dict) -> dict:
    missing = [k for k in REQUIRED if k not in row]
    if missing:
        raise ValueError(f"missing keys: {missing}")
    return row

row = {"order_id": 1001, "status": "paid", "amount": 42.5, "promo_code": None}
assert_row(row)`,
    note: "promo_code may be None. order_id may not be absent. Stdlib only — no pandas.",
  },
  {
    id: "py-unknown-promos",
    label: "Count unknown promos",
    sql: `rows = [
    {"order_id": 1, "promo_code": "FALL26"},
    {"order_id": 2, "promo_code": None},
]
sum(1 for r in rows if r["promo_code"] is None)`,
    note: "is None, not == None. Truthiness also treats '' as unknown.",
  },
  {
    id: "py-paid-only",
    label: "Pure status filter",
    sql: `def paid_only(rows: list[dict]) -> list[dict]:
    return [r for r in rows if r.get("status") == "paid"]

raw = [{"order_id": 1, "status": "paid"}, {"order_id": 2, "status": "pending"}]
paid_only(raw)`,
    note: "Same input → same output. No file, no SQL, no global.",
  },
  {
    id: "py-event-date",
    label: "Return a new list",
    sql: `def with_event_date(rows: list[dict], key="order_date") -> list[dict]:
    return [{**r, "event_date": r[key]} for r in rows]

with_event_date([{"order_id": 1, "order_date": "2026-09-12"}])`,
    note: "In-place updates make retries and tests lie.",
  },
  {
    id: "py-landing-glob",
    label: "Landing glob",
    sql: `from pathlib import Path

LANDING = Path("/data/landing/orders")

def list_order_files(day: str) -> list[str]:
    folder = LANDING / day
    return [p.name for p in sorted(folder.glob("*.json"))]

list_order_files("2026-09-12")`,
    note: "The lab seeds /data/landing/orders/2026-09-12/. Path / part is the join.",
  },
  {
    id: "py-stem-contract",
    label: "Stem contract",
    sql: `from pathlib import Path

def assert_orders_stem(path: Path) -> str:
    stem = path.stem
    prefix, _, day = stem.partition("_")
    if prefix != "orders" or len(day) != 10:
        raise ValueError(f"unexpected landing name: {path.name}")
    return day

assert_orders_stem(Path("/data/landing/orders/2026-09-12/orders_2026-09-12.json"))`,
    note: "Only files that match the pattern. A random .json is not an incremental.",
  },
  {
    id: "py-loud-transform",
    label: "Do not swallow",
    sql: `def transform_orders(rows: list[dict]) -> list[dict]:
    out = []
    for row in rows:
        if "order_id" not in row:
            raise ValueError(f"row missing order_id: {row!r}")
        out.append(row)
    return out

transform_orders([{"order_id": 1, "amount": 10}, {"order_id": 2, "amount": None}])`,
    note: "An empty list looks like a successful empty window. Fail loud on missing keys.",
  },
  {
    id: "py-watermark",
    label: "UTC half-open window",
    sql: `from datetime import datetime, timedelta, timezone

def next_window(watermark: datetime, hours=24):
    if watermark.tzinfo is None:
        raise ValueError("watermark must be timezone-aware")
    return watermark, watermark + timedelta(hours=hours)

wm = datetime(2026, 9, 12, tzinfo=timezone.utc)
start, end = next_window(wm)
{"start": start.isoformat(), "end": end.isoformat()}`,
    note: "Naive datetimes are a foot-gun across DST. Production should push the filter to SQL.",
  },
  {
    id: "py-comprehension",
    label: "Project + filter",
    sql: `rows = [
    {"order_id": 1, "status": "paid", "amount": 10},
    {"order_id": 2, "status": "pending", "amount": 99},
]
[{"order_id": r["order_id"], "amount": r["amount"]} for r in rows if r["status"] == "paid"]`,
    note: "One row in, one row out. A nested comprehension over items×orders is a fan-out.",
  },
  {
    id: "py-logging-metrics",
    label: "Job-shaped metrics",
    sql: `import logging
logging.basicConfig(level=logging.INFO)

def transform(raw):
    return [r for r in raw if r.get("status") == "paid"]

raw = [{"order_id": 1, "status": "paid"}, {"order_id": 2, "status": "pending"}]
clean = transform(raw)
{"rows_in": len(raw), "rows_out": len(clean)}`,
    note: "Log counts, not every row. print is a notebook leftover.",
  },
  {
    id: "py-missing-columns",
    label: "Assert columns (dict rows)",
    sql: `REQUIRED = ("event_id", "user_id", "ts")

def missing_keys(row: dict, required=REQUIRED) -> list[str]:
    return [k for k in required if k not in row]

missing_keys({"event_id": "e1", "ts": "2026-09-12"})`,
    note: "Fail loud at the boundary. This lab uses dict rows — no pandas runtime.",
  },
];

const BY_LESSON: Record<PythonLabSlug, string[]> = {
  "python-none-dicts-rows": ["py-assert-row", "py-unknown-promos", "py-missing-columns"],
  "python-functions-pure-transforms": ["py-paid-only", "py-event-date", "py-comprehension"],
  "python-pathlib-extracts": ["py-landing-glob", "py-stem-contract", "py-assert-row"],
  "python-exceptions-retries": ["py-loud-transform", "py-assert-row", "py-unknown-promos"],
  "python-datetimes-watermarks": ["py-watermark", "py-event-date", "py-paid-only"],
  "python-comprehensions-chunks": ["py-comprehension", "py-paid-only", "py-unknown-promos"],
  "python-logging-not-print": ["py-logging-metrics", "py-paid-only", "py-missing-columns"],
  "python-dataframe-contracts": ["py-missing-columns", "py-assert-row", "py-event-date"],
};

export function isPythonLabLesson(track: string, slug: string): boolean {
  return track === "python" && (PYTHON_LAB_SLUGS as readonly string[]).includes(slug);
}

export function pythonSamplesForLesson(slug: string): LabSample[] {
  const ids = (BY_LESSON as Record<string, string[] | undefined>)[slug] ?? ["py-assert-row"];
  return ids
    .map((id) => PYTHON_SAMPLES.find((s) => s.id === id))
    .filter((s): s is LabSample => Boolean(s));
}

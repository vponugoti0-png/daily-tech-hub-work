/** Wave A1 extras for Python / SQL / Databricks / Snowflake. */

const q = (question, options, answer, explanation) => ({
  question,
  options,
  answer,
  explanation,
});

const cs = (label, code, note) => ({ label, code, note });

export const TOOL_EXTRAS = {
  // --- Python ---
  "python-none-dicts-rows": {
    cheatSheet: [
      cs(
        "Promo ref vs None",
        "if \"promo_code\" not in row:\n    raise KeyError(\"promo_code missing\")\ncode = row[\"promo_code\"]  # may be None\nknown = code is not None",
        "Missing key ≠ None. Run the promo lookup sample in the local lab.",
      ),
    ],
    quiz: [
      q(
        "A landing JSON has the key promo_code with value null. After json.loads, Python sees…",
        [
          "The string 'null'",
          "None — treat it as unknown, not a missing key",
          "A missing key so .get is required",
          "0",
        ],
        1,
        "JSON null becomes None. The key is present. That is different from a file that omitted the field.",
      ),
      q(
        "Why is `amount or 0` a gold bug?",
        [
          "or is slow",
          "It turns None and 0 into 0, so you cannot tell unknown from a real zero",
          "Dicts cannot store 0",
          "JSON forbids 0",
        ],
        1,
        "Truthiness collapses None and 0. Use `is None` when you mean unknown.",
      ),
    ],
  },
  "python-functions-pure-transforms": {
    cheatSheet: [
      cs(
        "Edges vs core",
        "def transform(rows: list[dict]) -> list[dict]:\n    return [{**r, \"event_date\": r[\"order_date\"]} for r in rows]\n# I/O (pathlib, json, SQL) lives in extract/load — not here.",
        "Same input → same output. No file, no global.",
      ),
    ],
    quiz: [
      q(
        "A transform that writes a JSON file inside the map function is risky because…",
        [
          "JSON is illegal in Python",
          "Retries and tests cannot replay a pure function — side effects lie",
          "pathlib is banned",
          "Dicts cannot be serialized",
        ],
        1,
        "Keep I/O at extract/load. A retry would double-write.",
      ),
      q(
        "How do you add a column without mutating the caller’s list?",
        [
          "row['event_date'] = row['order_date'] in place",
          "Return [{**r, 'event_date': r['order_date']} for r in rows]",
          "Delete the input list",
          "Use a global dict",
        ],
        1,
        "New dicts. In-place updates make the next test see yesterday’s mutation.",
      ),
    ],
  },
  "python-pathlib-extracts": {
    cheatSheet: [
      cs(
        "Reject a bad stem",
        "prefix, _, day = path.stem.partition(\"_\")\nif prefix != \"orders\" or len(day) != 10:\n    raise ValueError(path.name)",
        "glob('*.json') also picks up notes.json. The lab seeds that trap.",
      ),
    ],
    quiz: [
      q(
        "Why not glob('*.json') and trust every file in a landing folder?",
        [
          "JSON files cannot be read twice",
          "Notes and sidecar files share the suffix — reject stems that are not orders_YYYY-MM-DD",
          "pathlib cannot glob",
          "Warehouses forbid JSON",
        ],
        1,
        "The local lab seeds notes.json next to orders_*.json on purpose.",
      ),
      q(
        "A second day folder (2026-09-11) appears under /data/landing/orders. Your extract should…",
        [
          "Hardcode only 2026-09-12",
          "Take the day as an argument and read that folder — watermarks pick the day",
          "Read /etc/passwd",
          "Concatenate every folder blindly into gold",
        ],
        1,
        "Day is a parameter. Hardcoded dates are a notebook habit, not a job.",
      ),
    ],
  },
  "python-exceptions-retries": {
    cheatSheet: [
      cs(
        "Retry timeouts only",
        "try:\n    return extract()\nexcept TimeoutError:\n    retry()\n# KeyError / ValueError on a missing order_id: fail loud, do not retry.",
        "Retries are for transient I/O. Contract breaks are not transient.",
      ),
    ],
    quiz: [
      q(
        "extract() raises KeyError('order_id'). Should the job retry?",
        [
          "Yes, three times",
          "No — a missing contract key will fail the same way on retry",
          "Yes, until gold looks full",
          "Swallow it and return []",
        ],
        1,
        "Empty success is a lie. Raise on contract breaks; retry only timeouts.",
      ),
      q(
        "Why is `except Exception: pass` a pipeline smell?",
        [
          "It is slower than a bare except",
          "It turns a broken landing into a successful empty window",
          "Python forbids Exception",
          "It prints too much",
        ],
        1,
        "On-call wants a loud failure, not a quiet zero-row gold table.",
      ),
    ],
  },
  "python-datetimes-watermarks": {
    cheatSheet: [
      cs(
        "Half-open UTC window",
        "start, end = watermark, watermark + timedelta(hours=24)\n# next run starts at end\nif start.tzinfo is None:\n    raise ValueError(\"aware only\")",
        "Naive datetimes lie across DST. Overlaps double-load.",
      ),
    ],
    quiz: [
      q(
        "The next incremental should start at…",
        [
          "The previous start minus one day, always",
          "The previous end — [start, end) so rows are not double-counted",
          "Midnight local time with no timezone",
          "A random UUID",
        ],
        1,
        "Half-open windows chain. Overlap is a duplicate-load bug.",
      ),
      q(
        "Why reject a naive datetime as a watermark?",
        [
          "datetime is deprecated",
          "Without tzinfo you cannot know if the warehouse stored UTC or local",
          "UTC is illegal",
          "timedelta cannot add days",
        ],
        1,
        "Naive clocks are a DST foot-gun. The lab sample raises on tzinfo is None.",
      ),
    ],
  },
  "python-comprehensions-chunks": {
    cheatSheet: [
      cs(
        "Chunk then yield",
        "def extract_chunks(rows, size=500):\n    i = 0\n    while i < len(rows):\n        yield rows[i : i + size]\n        i += size",
        "list(extract_chunks(...)) pulls everything back into RAM.",
      ),
    ],
    quiz: [
      q(
        "A nested comprehension over orders × items is risky because…",
        [
          "Comprehensions cannot nest",
          "It fans out to item grain — SUM(order.amount) would lie",
          "Python forbids two for-clauses",
          "It is always faster than a loop",
        ],
        1,
        "One row in, one row out unless you named the item grain on purpose.",
      ),
      q(
        "Why yield batches instead of returning one giant list?",
        [
          "yield is required by pytest",
          "RAM stays flat on a real extract; the loader can commit per chunk",
          "DuckDB cannot read lists",
          "JSON forbids arrays",
        ],
        1,
        "Chunked extract is how jobs survive a 10M-row landing.",
      ),
    ],
  },
  "python-logging-not-print": {
    cheatSheet: [
      cs(
        "Metric, not payload",
        "log.info(\"transform_ok rows_in=%s rows_out=%s\", n_in, n_out)\n# Never: log.info(\"row=%s dsn=%s\", row, dsn)",
        "INFO is a counter. Payloads and DSNs belong in a secret manager, not stdout.",
      ),
    ],
    quiz: [
      q(
        "print(row) in a scheduled job is a problem because…",
        [
          "print is slower than logging",
          "It dumps PII into logs and has no level, logger name, or metric shape",
          "print cannot show ints",
          "Orchestrators forbid stdout",
        ],
        1,
        "Use logging.getLogger('aurora.orders_etl') and log counts, not rows.",
      ),
      q(
        "Which log line is job-shaped?",
        [
          "print(password)",
          "log.info(\"load_ok start=%s end=%s rows_out=%s\", start, end, n)",
          "log.info(\"%s\", full_dataframe)",
          "log.debug(os.environ)",
        ],
        1,
        "Window + counts. Not secrets, not the payload.",
      ),
    ],
  },
  "python-dataframe-contracts": {
    quiz: [
      q(
        "A DataFrame contract should name…",
        [
          "Only the plot color",
          "Required columns, types, and the grain (e.g. one row per order_id)",
          "The author’s favorite IDE",
          "A random UUID per run",
        ],
        1,
        "Grain + columns + types. Everything else is decoration.",
      ),
      q(
        "Why fail when an unexpected column arrives in bronze?",
        [
          "Extra columns are always PII",
          "Silent schema drift can change joins and metrics without a review",
          "Spark cannot add columns",
          "Contracts forbid VARCHAR",
        ],
        1,
        "Allow-list or explicitly pass-through. Do not let a new raw field reshape gold.",
      ),
    ],
  },
  "python-typing-for-pipelines": {
    cheatSheet: [
      cs(
        "Typed row",
        "from typing import TypedDict, NotRequired\nclass OrderRow(TypedDict):\n    order_id: int\n    status: str\n    amount: float | None\n    promo_code: NotRequired[str | None]",
        "amount may be None. order_id may not. Types document the contract.",
      ),
    ],
    quiz: [
      q(
        "TypedDict helps pipeline reviews because…",
        [
          "It makes Python as fast as C",
          "Callers see required keys vs optional / None without reading the whole function",
          "It replaces unit tests",
          "It stores data in the warehouse",
        ],
        1,
        "Types are a contract comment the checker can see. Still test the None path.",
      ),
      q(
        "amount: float with no | None is a lie when…",
        [
          "You never land data",
          "Bronze can send JSON null for amount",
          "float is deprecated",
          "DuckDB uses INTEGER only",
        ],
        1,
        "If the warehouse would use NULL, the type should allow None.",
      ),
    ],
  },
  "python-testing-spark-logic": {
    cheatSheet: [
      cs(
        "Pure rule + tiny fixture",
        "def is_late(event_ts, watermark) -> bool:\n    return event_ts < watermark\n\ndef test_late_row():\n    assert is_late(t0, t1) is True",
        "No cluster for the rule. Pin Spark later with 2-row fixtures.",
      ),
    ],
    quiz: [
      q(
        "Why extract a watermark policy out of a Spark job?",
        [
          "Spark cannot compare timestamps",
          "pytest can cover the rule in milliseconds without a cluster",
          "Pure functions are illegal in Databricks",
          "Jobs cannot call functions",
        ],
        1,
        "I/O stays in the job. Rules belong in tests you run on every PR.",
      ),
      q(
        "A useful Spark unit fixture is…",
        [
          "The entire prod lake",
          "Two rows that differ only on the column under test",
          "A screenshot of a notebook",
          "print(df.show()) with no assert",
        ],
        1,
        "Assert on a row set. show() is not a test.",
      ),
    ],
  },
  "python-idempotent-writers": {
    quiz: [
      q(
        "An idempotent load means…",
        [
          "Running it twice duplicates gold",
          "Re-running the same window leaves gold in the same state",
          "You never use MERGE",
          "You delete the table every hour",
        ],
        1,
        "Retries must be safe. MERGE on a key or partition replace — not append-only blindly.",
      ),
      q(
        "Why include a batch_id or window start in a staging table?",
        [
          "For pretty dashboards only",
          "So a retry can delete/replace that window instead of inserting a second copy",
          "Spark requires it",
          "To store passwords",
        ],
        1,
        "Window identity is how you make a replay land on the same rows.",
      ),
    ],
  },
  "python-config-and-secrets": {
    cheatSheet: [
      cs(
        "Env, not notebooks",
        "settings = Settings(\n    warehouse=os.environ[\"WH\"],\n    database=os.environ[\"DB\"],\n    dry_run=os.environ.get(\"DRY_RUN\", \"0\") == \"1\",\n)\n# Password: secret manager / CI inject — never commit.",
        "12-factor. Staging and prod are different env files, not if/else in code.",
      ),
    ],
    quiz: [
      q(
        "A notebook cell with TOKEN = 'dapi…' is…",
        [
          "Fine if the notebook is in a private repo",
          "A committed secret — move it to a secret scope / CI inject",
          "Required by Spark",
          "Safer than env vars",
        ],
        1,
        "Repos get cloned. Secret managers get injected at runtime.",
      ),
      q(
        "dry_run as a typed setting helps because…",
        [
          "It prints the password",
          "Jobs can preview writes in staging without a code change",
          "It disables logging",
          "It is required by JSON",
        ],
        1,
        "Flags belong in env. Do not fork the job to skip a MERGE.",
      ),
    ],
  },
  "python-orchestration-hooks": {
    cheatSheet: [
      cs(
        "Job entrypoint",
        "def main() -> int:\n    cfg = load_settings()\n    start, end = next_window(cfg.watermark)\n    run(start, end)\n    return 0\n\nif __name__ == \"__main__\":\n    raise SystemExit(main())",
        "Orchestrators call a function. Import side effects are a foot-gun.",
      ),
    ],
    quiz: [
      q(
        "Why keep extract/transform/load behind a main() the orchestrator calls?",
        [
          "So imports do not start a load",
          "Because Python forbids functions",
          "To hide secrets in import order",
          "So pytest cannot import the module",
        ],
        0,
        "Importing a module should not write gold. Hooks call main().",
      ),
      q(
        "A good exit code convention is…",
        [
          "Always 0 so the DAG stays green",
          "0 on success, non-zero on contract / load failure so the orchestrator retries or pages",
          "Print “oops” and exit 0",
          "Exit 0 after swallowing Exception",
        ],
        1,
        "Orchestrators key off the process code. Green-on-failure hides incidents.",
      ),
    ],
  },
  "python-performance-de": {
    quiz: [
      q(
        "First performance habit for a Python extract?",
        [
          "Load the whole landing into a list of dicts, twice",
          "Project columns you need, chunk, and avoid per-row warehouse round-trips",
          "Turn off logging forever",
          "Use eval() on each row",
        ],
        1,
        "Less data, fewer round-trips. Micro-optimizing a loop is later.",
      ),
      q(
        "Why is row-by-row INSERT from Python usually a smell?",
        [
          "SQL cannot insert",
          "Each row is a network round-trip — copy/bulk/chunk instead",
          "Python cannot loop",
          "Warehouses forbid INSERT",
        ],
        1,
        "Bulk load or a warehouse MERGE. Chatty writers die at 100k rows.",
      ),
    ],
  },
  "python-packaging-de-libs": {
    cheatSheet: [
      cs(
        "Installable contract",
        "# pyproject.toml\n[project]\nname = \"aurora-orders\"\nversion = \"0.1.0\"\n# pin pytest; keep secrets out of the package data",
        "Shared rules live in a package. Copy-pasted notebook cells drift.",
      ),
    ],
    quiz: [
      q(
        "Why package a watermark helper instead of pasting it into every notebook?",
        [
          "Packages are slower",
          "One tested version, one import — notebooks drift",
          "pip forbids DE code",
          "Spark cannot import",
        ],
        1,
        "Shared libraries are how you stop four slightly different watermark functions.",
      ),
      q(
        "What should never ship inside the wheel?",
        [
          "The TypedDict for OrderRow",
          "A .env with warehouse passwords",
          "pytest tests (dev extra is fine)",
          "A README that names the grain",
        ],
        1,
        "Secrets are env/CI, not package data.",
      ),
    ],
  },
  "python-capstone-cli-package": {
    quiz: [
      q(
        "A CLI entrypoint should fail loud when…",
        [
          "The user passes --help",
          "A required env var or window argument is missing",
          "Logging is INFO",
          "The package version contains a dot",
        ],
        1,
        "Bad invocation is an error, not a silent empty load.",
      ),
      q(
        "Capstone tests should cover…",
        [
          "Only the README screenshots",
          "Happy path plus one None-amount row and one retry-safe second run",
          "Prod credentials",
          "The vendor’s Spark source",
        ],
        1,
        "The contract is None-handling and idempotence — not a pretty GIF.",
      ),
    ],
  },
  "python-etl-pipeline-builder": {
    quiz: [
      q(
        "In extract → transform → load, where do retries belong?",
        [
          "Around transform KeyError",
          "Around extract/load I/O that can time out — not around a missing order_id",
          "Around print()",
          "Nowhere — never retry",
        ],
        1,
        "I/O is transient. A broken row contract is not.",
      ),
      q(
        "The builder’s publish step should be…",
        [
          "Append-only with no key",
          "Idempotent: same window replayed does not duplicate gold",
          "A screenshot of a notebook",
          "A DROP of the raw landing",
        ],
        1,
        "Staging then MERGE/replace. Retries will happen.",
      ),
    ],
  },

  // --- SQL ---
  "sql-select-filter-nulls": {
    cheatSheet: [
      cs(
        "North + EMEA paid",
        "SELECT o.order_id, c.region, o.amount\nFROM aurora_orders o\nJOIN aurora_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid' AND c.region IN ('north', 'emea')\nORDER BY o.amount DESC;",
        "Wave A1 extra customers. Run it in the local lab — not a live warehouse.",
      ),
    ],
    quiz: [
      q(
        "WHERE amount != 0 drops which rows you might have wanted?",
        [
          "Only zeros",
          "Zeros and also NULLs — NULL compared with != is unknown, not true",
          "Only VIP promos",
          "Nothing — != is NULL-safe",
        ],
        1,
        "NULL is unknown. Use IS NOT NULL if you mean “has an amount,” then compare.",
      ),
      q(
        "A SELECT for a daily mart should prefer…",
        [
          "LIMIT 1000 and hope",
          "A date window or watermark predicate, then prove completeness",
          "SELECT DISTINCT amount",
          "ORDER BY RANDOM()",
        ],
        1,
        "LIMIT is a sample cap. Pipelines filter on load time or a high-watermark.",
      ),
    ],
  },
  "sql-dml-write-path": {
    cheatSheet: [
      cs(
        "Preview a refund write",
        "SELECT r.refund_id, r.order_id, o.status, r.amount\nFROM aurora_refunds r\nJOIN aurora_orders o ON o.order_id = r.order_id;",
        "The local lab is read-only. Preview the set a warehouse UPDATE would hit.",
      ),
    ],
    quiz: [
      q(
        "Before UPDATE aurora_orders SET status = 'paid' WHERE status = 'pending', you should…",
        [
          "Run it in prod first",
          "SELECT the same WHERE to see the rows — the lab’s DML preview habit",
          "Disable backups",
          "Skip WHERE so it is faster",
        ],
        1,
        "Preview the match set. Writes without a WHERE are a classic incident.",
      ),
      q(
        "Why is the local lab read-only for DML lessons?",
        [
          "DuckDB cannot UPDATE",
          "So you practice the preview SELECT; real writes belong in a warehouse you can roll back",
          "UPDATE is deprecated",
          "SQL forbids writes",
        ],
        1,
        "Same-origin SELECT/WITH only. Copy the write to your account after you trust the set.",
      ),
    ],
  },
  "sql-aggregates-group-having": {
    cheatSheet: [
      cs(
        "SKU mix (item grain)",
        "SELECT p.product_name, SUM(i.qty * i.unit_price) AS ext_amount\nFROM aurora_order_items i\nJOIN aurora_products p ON p.sku = i.sku\nGROUP BY p.product_name;",
        "Never SUM(order.amount) after joining items.",
      ),
    ],
    quiz: [
      q(
        "HAVING SUM(amount) >= 20 filters…",
        [
          "Rows before the group",
          "Groups after aggregation",
          "NULLs out of COUNT(*)",
          "The catalog name",
        ],
        1,
        "WHERE is rows. HAVING is groups. Do not put status = 'paid' only in HAVING if it is a row filter.",
      ),
      q(
        "You joined aurora_order_items then SUM(o.amount). The revenue is wrong because…",
        [
          "SUM cannot take a column",
          "Order amount repeats once per item — you fan out the grain",
          "DuckDB forbids joins",
          "amount is always NULL",
        ],
        1,
        "Item grain needs qty * unit_price. Order grain stays on aurora_orders.",
      ),
    ],
  },
  "sql-patterns-aliases-case": {
    cheatSheet: [
      cs(
        "IN / LIKE on new regions",
        "SELECT order_id, promo_code, amount\nFROM aurora_orders\nWHERE promo_code LIKE 'E%'\n   OR promo_code IN ('VIP', 'FLASH', 'EMEA26');",
        "EMEA26 is a Wave A1 promo. LIKE 'E%' is a pattern, not a regex lesson.",
      ),
    ],
    quiz: [
      q(
        "CASE in a SELECT is…",
        [
          "A stored procedure",
          "An expression that returns a column — keep buckets in one SELECT so reviewers see the grain",
          "A write that updates gold",
          "Illegal in DuckDB",
        ],
        1,
        "CASE is a column. It does not persist a constraint.",
      ),
      q(
        "Prefer IN ('paid','pending') over OR-chains because…",
        [
          "OR is deprecated",
          "Reviewers can see the set; a long OR chain hides a missing parenthesis with AND",
          "IN ignores NULLs differently in a good way always",
          "IN is required by ANSI for status",
        ],
        1,
        "Readability and fewer AND/OR surprises. Still watch NOT IN + NULL.",
      ),
    ],
  },
  "sql-exists-any-all": {
    cheatSheet: [
      cs(
        "Refunded orders (EXISTS)",
        "SELECT o.order_id, o.status, o.amount\nFROM aurora_orders o\nWHERE EXISTS (\n  SELECT 1 FROM aurora_refunds r WHERE r.order_id = o.order_id\n);",
        "EXISTS is a semi-join. It does not fan out when a refund table grows.",
      ),
    ],
    quiz: [
      q(
        "EXISTS vs JOIN to aurora_refunds when you only need “has a refund”?",
        [
          "JOIN is always safer",
          "EXISTS keeps order grain; a JOIN can duplicate orders if two refunds land",
          "EXISTS deletes the refunds",
          "They always return the same row count",
        ],
        1,
        "Semi-join for existence. Join when you need refund columns — and name that grain.",
      ),
      q(
        "amount > (SELECT AVG(amount) FROM …) is a…",
        [
          "Correlated delete",
          "Scalar subquery comparison — read it before reaching for ANY/ALL",
          "Window function",
          "DDL constraint",
        ],
        1,
        "ANY/ALL are easy to misread. Start with a scalar, then upgrade if you must.",
      ),
    ],
  },
  "sql-ddl-constraints": {
    cheatSheet: [
      cs(
        "Inspect before ALTER",
        "SELECT table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'aurora'\nORDER BY table_name, ordinal_position;",
        "This lab does not run DDL. Copy CREATE/ALTER to a warehouse after you read the contract.",
      ),
    ],
    quiz: [
      q(
        "Why inspect information_schema before ALTER TABLE?",
        [
          "It runs the ALTER for you",
          "You need the current contract — types, nullability — before you change it",
          "information_schema is a secret store",
          "ALTER is illegal",
        ],
        1,
        "DDL is a contract change. Read first, then copy the statement to a warehouse.",
      ),
      q(
        "A UNIQUE constraint on order_id is there to…",
        [
          "Speed up RANDOM()",
          "Protect the grain you named — duplicates fail loud",
          "Store secrets",
          "Replace GROUP BY",
        ],
        1,
        "Constraints are tests the warehouse runs. Do not rely on DISTINCT to hide dupes.",
      ),
    ],
  },
  "sql-dates-injection": {
    cheatSheet: [
      cs(
        "Late paid window",
        "SELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE status = 'paid'\n  AND order_date >= DATE '2026-09-06'\nORDER BY order_date;",
        "Bind dates. Do not glue a form string into this predicate.",
      ),
    ],
    quiz: [
      q(
        "BETWEEN DATE '2026-09-02' AND DATE '2026-09-04' is…",
        [
          "Exclusive on both ends",
          "Inclusive on a DATE column",
          "A string comparison",
          "Illegal in DuckDB",
        ],
        1,
        "BETWEEN on DATE is inclusive. Know the bound before you write a watermark.",
      ),
      q(
        "Why bind a date parameter instead of concatenating the UI string?",
        [
          "Concatenation is faster",
          "Glued strings are injection and dialect bugs — bind a DATE",
          "Parameters are deprecated",
          "Warehouses ignore WHERE",
        ],
        1,
        "Injection-safe filters are a habit, even in internal tools.",
      ),
    ],
  },
  "sql-joins-set-logic-recap": {
    cheatSheet: [
      cs(
        "Refunds × orders",
        "SELECT r.refund_id, r.order_id, o.status, r.amount\nFROM aurora_refunds r\nJOIN aurora_orders o ON o.order_id = r.order_id;",
        "Refund grain. The measure is r.amount — not SUM(o.amount).",
      ),
    ],
    quiz: [
      q(
        "INNER JOIN aurora_order_items then SUM(o.amount) is wrong because…",
        [
          "INNER JOIN drops paid orders",
          "You changed grain to items and repeated the order amount",
          "SUM requires HAVING",
          "aurora_orders has no amount",
        ],
        1,
        "Name the grain. Item measures use qty * unit_price.",
      ),
      q(
        "EXCEPT / anti-join thinking: customers with no paid order is…",
        [
          "A full outer join on amount",
          "NOT EXISTS (SELECT 1 FROM aurora_orders o WHERE … status = 'paid')",
          "COUNT(*) = 0 in the SELECT list without GROUP BY",
          "LIMIT 0",
        ],
        1,
        "Anti-join / NOT EXISTS keeps customer grain.",
      ),
    ],
  },
  "sql-catalog-views-metrics": {
    cheatSheet: [
      cs(
        "Open shipments view",
        "SELECT order_id, carrier, status\nFROM aurora.open_shipments\nORDER BY shipped_date;",
        "A view is a stored SELECT. Marts persist a grain; this view does not.",
      ),
    ],
    quiz: [
      q(
        "metrics.aurora_region_revenue is in this lab a…",
        [
          "Live BI SaaS semantic layer",
          "Local metric-view–style table (dim_* + measure_*) — not a remote catalog",
          "Snowflake Cortex function",
          "Unity Catalog metastore in the cloud",
        ],
        1,
        "Same-origin fixture. Teaching labels, not a remote attach.",
      ),
      q(
        "Learner SQL still cannot ATTACH because…",
        [
          "DuckDB forbids ATTACH for everyone including the seed",
          "The lab guard keeps SELECT/WITH only — no remote catalogs",
          "ATTACH is required for every SELECT",
          "Views need ATTACH",
        ],
        1,
        "Seed may attach in-memory catalogs. Your worksheet cannot.",
      ),
    ],
  },
  "sql-window-functions-de": {
    cheatSheet: [
      cs(
        "Latest order per customer",
        "SELECT * FROM (\n  SELECT o.*, ROW_NUMBER() OVER (\n    PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC\n  ) AS rn\n  FROM aurora_orders o\n) t WHERE rn = 1;",
        "Copy to a warehouse — this lesson is not a lab host. Windows beat a self-join.",
      ),
    ],
    quiz: [
      q(
        "PARTITION BY customer_id means…",
        [
          "A warehouse partition that prunes files",
          "The window restarts for each customer — ranking is per key",
          "A UNION of customers",
          "A secret catalog",
        ],
        1,
        "Window partition ≠ table partition. It is the key the function resets on.",
      ),
      q(
        "LAG(status) OVER (PARTITION BY customer_id ORDER BY order_date) is for…",
        [
          "Deleting the previous load",
          "Change detection — yesterday’s status vs today’s without an explosive self-join",
          "Replacing GROUP BY revenue",
          "Creating a stream",
        ],
        1,
        "LAG is the SCD-friendly previous value.",
      ),
      q(
        "Why not join the table to itself to get “previous order” if a window works?",
        [
          "Self-joins are illegal",
          "Inequality self-joins explode and are harder to review than LAG",
          "Windows cannot see dates",
          "JOIN cannot use customer_id",
        ],
        1,
        "Windows keep grain. Self-joins for previous-row are a last resort.",
      ),
    ],
  },
  "sql-incremental-loads": {
    cheatSheet: [
      cs(
        "Watermark MERGE shape",
        "-- Preview first (lab habit)\nSELECT order_id, order_date, amount\nFROM aurora_orders\nWHERE order_date >= DATE '2026-09-06';\n-- Warehouse: MERGE on order_id for that window, then advance watermark to MAX(order_date).",
        "Idempotent window. Do not advance to a timestamp you cannot re-read.",
      ),
    ],
    quiz: [
      q(
        "Late-arriving 2026-09-01 row after you watermarked 2026-09-06 means…",
        [
          "Ignore it forever",
          "You need a late-data policy: lookback window or a separate late path",
          "The watermark was a UUID",
          "DELETE gold and start over every time",
        ],
        1,
        "Late facts are normal. Name the lookback; do not pretend time is complete.",
      ),
      q(
        "Advancing the watermark to MAX(ts) of an incomplete extract is risky because…",
        [
          "MAX is slow",
          "The next run will skip rows that land in the gap",
          "Warehouses forbid MAX",
          "ts cannot be a DATE",
        ],
        1,
        "Conservative advance. Re-readable. Incomplete batches should not skip ahead.",
      ),
      q(
        "Idempotent incremental MERGE uses…",
        [
          "INSERT only, no key",
          "A business key (order_id) so a replay updates instead of duplicating",
          "RANDOM() as the key",
          "LIMIT 1",
        ],
        1,
        "Keys make retries safe.",
      ),
    ],
  },
  "sql-performance-basics": {
    quiz: [
      q(
        "Filter on order_date early because…",
        [
          "Dates are prettier",
          "Warehouses can prune partitions / micro-partitions and read less data",
          "WHERE is deprecated",
          "ORDER BY is enough",
        ],
        1,
        "Predicate pushdown / pruning. SELECT * plus a late filter is a full scan habit.",
      ),
      q(
        "SELECT * in a production mart extract is risky because…",
        [
          "Stars are illegal in SQL",
          "A new raw column silently changes I/O and maybe grain",
          "* is slower to type",
          "DuckDB cannot expand *",
        ],
        1,
        "List the contract columns. Labs can use *.",
      ),
    ],
  },
  "sql-dimensional-modeling": {
    cheatSheet: [
      cs(
        "Fact vs dim",
        "-- Fact (order grain): aurora_orders.order_id, amount, status, order_date\n-- Dim: aurora_customers.customer_id, region, status, signup_date\n-- Do not bury region only inside a comment — join the dim.",
        "Facts measure. Dims describe. Grain first.",
      ),
    ],
    quiz: [
      q(
        "Putting region on every fact row and also on a customer dim without a key is a smell because…",
        [
          "Regions are illegal",
          "The two copies drift — pick a grain and a key, then join",
          "Dims cannot store region",
          "Facts cannot store dates",
        ],
        1,
        "Conformed attributes live on the dim. Facts store keys + measures.",
      ),
      q(
        "A daily revenue mart (order_date, region, revenue) is…",
        [
          "A transaction fact at item grain",
          "An aggregated fact / gold grain you persist on purpose",
          "A dimension",
          "A stream offset",
        ],
        1,
        "Gold is a named grain, not a random GROUP BY in a dashboard.",
      ),
      q(
        "Why not join items into a customer-count metric?",
        [
          "Joins are slow only",
          "Item grain fans out customers — COUNT(DISTINCT customer_id) is a patch over a grain bug",
          "Customers cannot be counted",
          "SQL forbids DISTINCT",
        ],
        1,
        "Name the grain before the join. DISTINCT is not a model.",
      ),
    ],
  },
  "sql-data-quality": {
    cheatSheet: [
      cs(
        "DQ gate shape",
        "SELECT COUNT(*) AS null_amount\nFROM aurora_orders\nWHERE status = 'paid' AND amount IS NULL;\n-- Gate fails if null_amount > 0 before you MERGE to gold.",
        "Checks are SELECTs with a threshold. Do not skip them on retries.",
      ),
    ],
    quiz: [
      q(
        "A useful uniqueness check on aurora_orders is…",
        [
          "SELECT DISTINCT amount",
          "COUNT(*) vs COUNT(DISTINCT order_id) — they must match at order grain",
          "LIMIT 1",
          "ORDER BY RANDOM()",
        ],
        1,
        "If those counts diverge, you have duplicate keys.",
      ),
      q(
        "When should a DQ gate block the MERGE?",
        [
          "Never — gold should always update",
          "When a named contract breaks (NULL amounts on paid, dup keys, fan-out)",
          "When the dashboard is ugly",
          "Only on weekends",
        ],
        1,
        "Gates protect gold. A stale mart beats a wrong mart.",
      ),
      q(
        "COUNT(promo_code) as a completeness metric means…",
        [
          "How many orders exist",
          "How many rows have a non-NULL promo — not the same as COUNT(*)",
          "How many customers exist",
          "A warehouse credit count",
        ],
        1,
        "COUNT(col) skips NULLs. Say which you mean.",
      ),
    ],
  },
  "sql-ctes-readability": {
    cheatSheet: [
      cs(
        "Named grain CTE",
        "WITH paid AS (\n  SELECT order_id, customer_id, amount\n  FROM aurora_orders\n  WHERE status = 'paid'\n)\nSELECT c.region, SUM(p.amount) AS revenue\nFROM paid p\nJOIN aurora_customers c ON c.customer_id = p.customer_id\nGROUP BY c.region;",
        "One CTE, one grain. Nested mystery SQL is not modular.",
      ),
    ],
    quiz: [
      q(
        "A CTE should usually…",
        [
          "Hide five grains in one alias",
          "Name one grain so the next SELECT can join safely",
          "Replace the need for tests",
          "Run faster than the same subquery always",
        ],
        1,
        "Readability first. Some engines inline CTEs — do not assume a materialize.",
      ),
      q(
        "Why prefer a CTE over a nested 80-line subquery?",
        [
          "CTEs cannot have bugs",
          "Reviewers can test paid vs grouped in isolation",
          "Subqueries are illegal",
          "CTEs disable WHERE",
        ],
        1,
        "Modular SQL is reviewable SQL.",
      ),
      q(
        "WITH x AS (SELECT DISTINCT amount FROM …) is a smell when…",
        [
          "You already named a unique key",
          "You are using DISTINCT to hide a grain bug instead of grouping measures",
          "amount is numeric",
          "The CTE name is short",
        ],
        1,
        "DISTINCT is not a mart. GROUP BY the grain, SUM the measure.",
      ),
    ],
  },
  "sql-semi-structured": {
    cheatSheet: [
      cs(
        "Landing JSON habit",
        "-- Warehouse: parse once into typed columns in silver\n-- Do not: SELECT payload:amount::NUMBER in every gold dashboard\n-- Lab stand-in: keep typed aurora_orders.amount",
        "Semi-structured in bronze; typed contract in silver.",
      ),
    ],
    quiz: [
      q(
        "Why flatten JSON in silver instead of in every gold query?",
        [
          "JSON is illegal in gold",
          "Typed columns are one contract; repeated :path casts drift and hide NULLs",
          "Bronze cannot store JSON",
          "Dashboards cannot join",
        ],
        1,
        "Parse once. Gold reads a table, not a treasure map.",
      ),
      q(
        "A missing JSON key vs a JSON null should…",
        [
          "Both become 0",
          "Be distinguished if the product cares — unknown vs omitted",
          "Crash the warehouse always",
          "Be DISTINCT-ed away",
        ],
        1,
        "Same lesson as Python None vs missing key.",
      ),
    ],
  },
  "sql-deduping-late-data": {
    quiz: [
      q(
        "ROW_NUMBER() … QUALIFY/filter rn = 1 is a dedupe when…",
        [
          "You partition by the business key and order by the recency column you trust",
          "You DISTINCT the whole row blindly",
          "You LIMIT 1 the table",
          "You delete bronze",
        ],
        0,
        "Name the key and the winner rule (latest load_ts).",
      ),
      q(
        "Late data after a daily load should…",
        [
          "Be dropped so gold stays pretty",
          "Have a written policy: lookback MERGE or a late-arrivals table",
          "Force a full reload every time by default",
          "Be inserted with a new random order_id",
        ],
        1,
        "Late is expected. A policy beats surprise duplicates.",
      ),
    ],
  },
  "sql-shared-capstone-checklist": {
    quiz: [
      q(
        "A shared orders → daily revenue mart must name…",
        [
          "Only the dashboard color",
          "Order grain in staging, date+region grain in gold, and the DQ gates between them",
          "A random warehouse size",
          "The author’s nickname",
        ],
        1,
        "Checklist = grain + gates + publish. Same story on SQL, DBX, and SF builders.",
      ),
      q(
        "Why share one checklist across tools?",
        [
          "So you can skip practice on two tracks",
          "The contract is the same; only the engine verbs change (MERGE / Dynamic Table / Job)",
          "Unity Catalog equals Snowflake ACCOUNTADMIN",
          "Labs are live warehouses",
        ],
        1,
        "Portable DE habits. Chrome differs; grain does not.",
      ),
    ],
  },
  "sql-slowly-changing-dimensions": {
    quiz: [
      q(
        "SCD2 keeps history by…",
        [
          "Overwriting the dim row in place with no dates",
          "Closing the old row (valid_to) and inserting a new current row",
          "Deleting the customer",
          "Using DISTINCT region",
        ],
        1,
        "Effective dating. Facts point at the version that was true on the event date.",
      ),
      q(
        "A fact’s customer_id should join to…",
        [
          "Whatever row happens to be current, even for last year’s order",
          "The dim version valid on the fact’s order_date (or a durable natural key + dates)",
          "A random surrogate",
          "The warehouse name",
        ],
        1,
        "Point-in-time. Current-only joins rewrite history.",
      ),
    ],
  },
  "sql-explain-plan-lab": {
    quiz: [
      q(
        "You read an explain plan to…",
        [
          "Change the catalog color",
          "See scans, joins, and whether a date filter can prune",
          "Skip WHERE clauses",
          "Disable DQ gates",
        ],
        1,
        "Plans are a habit, not a vendor trophy. Filter early, project less.",
      ),
      q(
        "A plan that shows a full table scan plus a late FILTER on order_date suggests…",
        [
          "Perfect pruning",
          "The predicate may not be pushable / typed as DATE — fix the filter shape",
          "You should SELECT *",
          "You should add LIMIT 1 in prod",
        ],
        1,
        "Pruning fails when the column is wrapped or typed as text.",
      ),
    ],
  },
  "sql-staging-mart-etl": {
    quiz: [
      q(
        "DQ gates sit…",
        [
          "After the CEO dashboard",
          "After staging, before MERGE to current / gold",
          "Only in a slide deck",
          "Inside DISTINCT",
        ],
        1,
        "Bad staging must not become gold.",
      ),
      q(
        "orders_daily grain is…",
        [
          "One row per item sku",
          "The mart grain you named (typically date + region) — not order_id",
          "One row per customer email",
          "The stream offset",
        ],
        1,
        "Builders decide the gold grain in writing. Then persist it.",
      ),
    ],
  },
};

export const WAREHOUSE_EXTRAS = {};

export const DATABRICKS_LAB_ENTRY_SLUG = "dbx-workspace-cluster-basics";
export const SNOWFLAKE_LAB_ENTRY_SLUG = "sf-day0-objects";
export const SQL_LAB_ENTRY_SLUG = "sql-select-filter-nulls";
export const PYTHON_LAB_ENTRY_SLUG = "python-none-dicts-rows";
export const GIT_LAB_ENTRY_SLUG = "git-rebase-vs-merge";

export const DATABRICKS_LAB_SLUGS = [
  "dbx-workspace-cluster-basics",
  "dbx-lakehouse-fundamentals",
  "dbx-delta-lake-basics",
  "dbx-spark-sql-performance",
  "dbx-sql-warehouses",
  "dbx-spark-select-nulls",
  "dbx-delta-write-preview",
  "dbx-gold-aggregates",
  "dbx-silver-patterns-case",
  "dbx-semi-joins-leftovers",
  "dbx-delta-table-contracts",
  "dbx-dates-partition-filters",
  "dbx-unity-catalog",
  "dbx-catalog-views-metrics",
] as const;

export const SNOWFLAKE_LAB_SLUGS = [
  "sf-day0-objects",
  "sf-architecture",
  "sf-time-travel-clones",
  "sf-dynamic-tables",
  "sf-performance-cost",
  "sf-select-filter-nulls",
  "sf-dml-write-path",
  "sf-aggregates-group-having",
  "sf-patterns-aliases-case",
  "sf-exists-semi-joins",
  "sf-ddl-constraints",
  "sf-dates-injection",
  "sf-catalog-views-metrics",
] as const;

export const SQL_LAB_SLUGS = [
  "sql-select-filter-nulls",
  "sql-dml-write-path",
  "sql-aggregates-group-having",
  "sql-patterns-aliases-case",
  "sql-exists-any-all",
  "sql-ddl-constraints",
  "sql-dates-injection",
  "sql-joins-set-logic-recap",
  "sql-catalog-views-metrics",
] as const;

export const PYTHON_LAB_SLUGS = [
  "python-none-dicts-rows",
  "python-functions-pure-transforms",
  "python-pathlib-extracts",
  "python-exceptions-retries",
  "python-datetimes-watermarks",
  "python-comprehensions-chunks",
  "python-logging-not-print",
] as const;

export const GIT_LAB_SLUGS = [
  "git-rebase-vs-merge",
  "git-commit-hygiene",
  "git-bisect-and-blame",
  "git-branching-dbt-sql",
  "git-pr-templates-data-diffs",
] as const;

export type DatabricksLabSlug = (typeof DATABRICKS_LAB_SLUGS)[number];
export type SnowflakeLabSlug = (typeof SNOWFLAKE_LAB_SLUGS)[number];
export type SqlLabSlug = (typeof SQL_LAB_SLUGS)[number];
export type PythonLabSlug = (typeof PYTHON_LAB_SLUGS)[number];
export type GitLabSlug = (typeof GIT_LAB_SLUGS)[number];

/** stepIndex written after a successful local lab run (does not complete the lesson). */
export const LAB_STEP_INDEX = 1;

export interface LabSample {
  id: string;
  label: string;
  sql?: string;
  /** Python (or other) source. SQL samples use `sql`. */
  code?: string;
  note?: string;
}

export function sampleSource(sample: LabSample): string {
  return sample.code ?? sample.sql ?? "";
}

export function isDatabricksLabLesson(track: string, slug: string): boolean {
  return track === "databricks" && (DATABRICKS_LAB_SLUGS as readonly string[]).includes(slug);
}

export function isSnowflakeLabLesson(track: string, slug: string): boolean {
  return track === "snowflake" && (SNOWFLAKE_LAB_SLUGS as readonly string[]).includes(slug);
}

export function isSqlLabLesson(track: string, slug: string): boolean {
  return track === "sql" && (SQL_LAB_SLUGS as readonly string[]).includes(slug);
}

export function isPythonLabLesson(track: string, slug: string): boolean {
  return track === "python" && (PYTHON_LAB_SLUGS as readonly string[]).includes(slug);
}

export function isGitPlayLesson(track: string, slug: string): boolean {
  return track === "git" && (GIT_LAB_SLUGS as readonly string[]).includes(slug);
}

export function isLabLesson(track: string, slug: string): boolean {
  return (
    isDatabricksLabLesson(track, slug) ||
    isSnowflakeLabLesson(track, slug) ||
    isSqlLabLesson(track, slug) ||
    isPythonLabLesson(track, slug)
  );
}

/** DuckDB SQL labs or the in-browser Git Play Lab (outline / deriveSteps). */
export function isPracticeLesson(track: string, slug: string): boolean {
  return isLabLesson(track, slug) || isGitPlayLesson(track, slug);
}

export function labEntrySlug(track: string): string | undefined {
  if (track === "databricks") return DATABRICKS_LAB_ENTRY_SLUG;
  if (track === "snowflake") return SNOWFLAKE_LAB_ENTRY_SLUG;
  if (track === "sql") return SQL_LAB_ENTRY_SLUG;
  if (track === "python") return PYTHON_LAB_ENTRY_SLUG;
  if (track === "git") return GIT_LAB_ENTRY_SLUG;
  return undefined;
}

/** In-page Practice CTA (not a header nav item). */
export function practiceLabHref(track: string): string | undefined {
  const slug = labEntrySlug(track);
  return slug ? `/training/${track}/${slug}#lab` : undefined;
}

export function practiceLabCtaLabel(track: string): string | undefined {
  if (track === "sql") return "Practice · SQL lab";
  if (track === "databricks") return "Practice · Databricks lab";
  if (track === "snowflake") return "Practice · Snowflake lab";
  if (track === "python") return "Practice · Python lab";
  if (track === "git") return "Practice · Git Play Lab";
  return undefined;
}

const SHARED: LabSample[] = [
  {
    id: "catalog-objects",
    label: "Catalog objects (day-0)",
    sql: `SELECT catalog, schema, table_name, layer
FROM workspace_objects
ORDER BY layer, table_name;`,
    note: "Three-level names live in Unity Catalog. A notebook path is not a table.",
  },
  {
    id: "medallion-counts",
    label: "Medallion row counts",
    sql: `SELECT layer, COUNT(*) AS row_count
FROM (
  SELECT 'bronze' AS layer FROM bronze_orders
  UNION ALL
  SELECT 'silver' FROM silver_orders
  UNION ALL
  SELECT 'gold' FROM gold_daily_orders
) t
GROUP BY layer
ORDER BY layer;`,
    note: "Bronze is raw landings; silver is cleaned; gold is the mart grain.",
  },
  {
    id: "silver-quality",
    label: "Silver quality by status",
    sql: `SELECT status, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount
FROM silver_orders
GROUP BY status
ORDER BY n DESC;`,
    note: "Corrupt bronze rows never make it to silver in this sample set.",
  },
  {
    id: "gold-revenue",
    label: "Gold daily revenue",
    sql: `SELECT order_date, region, orders, revenue
FROM gold_daily_orders
ORDER BY order_date, region;`,
    note: "Warehouses serve gold — keep ETL off the BI warehouse.",
  },
  {
    id: "partition-filter",
    label: "Partition-style date filter",
    sql: `SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount
FROM silver_orders
WHERE order_date >= DATE '2026-09-02'
GROUP BY region
ORDER BY n DESC;`,
    note: "Filter on partition-like columns early — same habit as Spark SQL.",
  },
  {
    id: "upsert-shape",
    label: "Upsert-shaped join (Delta idea)",
    sql: `SELECT
  COALESCE(u.order_id, t.order_id) AS order_id,
  COALESCE(u.region, t.region) AS region,
  COALESCE(u.status, t.status) AS status,
  COALESCE(u.amount, t.amount) AS amount
FROM silver_orders t
FULL OUTER JOIN bronze_orders u ON t.order_id = u.order_id
ORDER BY order_id;`,
    note: "DuckDB stand-in for MERGE INTO … WHEN MATCHED / NOT MATCHED. Spark SQL / Delta syntax differs.",
  },
  {
    id: "sf-account-map",
    label: "Databases & schemas (day-0)",
    sql: `SELECT database, schema, object_name, object_type
FROM sf_account_objects
ORDER BY database, schema, object_name;`,
    note: "Snowflake nesting is database.schema.table — not the warehouse name.",
  },
  {
    id: "sf-warehouses",
    label: "Virtual warehouses",
    sql: `SELECT name, size, auto_suspend_sec, status
FROM sf_warehouses
ORDER BY name;`,
    note: "Warehouses are compute. Auto-suspend stops credit burn when idle.",
  },
  {
    id: "sf-orders-customers",
    label: "SAMPLE orders × customers",
    sql: `SELECT o.order_id, c.region, o.order_date, o.amount
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
ORDER BY o.order_date, o.order_id;`,
    note: "Tiny SAMPLE-style join. Not a live Snowflake account.",
  },
  {
    id: "sf-time-travel",
    label: "Time-travel stand-in",
    sql: `SELECT order_id, amount, as_of_version
FROM sf_orders_history
WHERE as_of_version = 1
ORDER BY order_id;`,
    note: "DuckDB stand-in for SELECT … AT (TIMESTAMP => …). Snowflake Time Travel syntax differs.",
  },
  {
    id: "sf-daily-mart",
    label: "Daily revenue mart",
    sql: `SELECT o.order_date, c.region, COUNT(*) AS orders, ROUND(SUM(o.amount), 2) AS revenue
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
GROUP BY o.order_date, c.region
ORDER BY o.order_date, c.region;`,
    note: "Dynamic Table / mart-shaped grain — still just a local SELECT.",
  },
  {
    id: "sf-prune-filter",
    label: "Date filter (pruning habit)",
    sql: `SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount
FROM (
  SELECT o.amount, o.order_date, c.region
  FROM sf_orders o
  JOIN sf_customers c ON c.customer_id = o.customer_id
) t
WHERE order_date >= DATE '2026-09-02'
GROUP BY region
ORDER BY n DESC;`,
    note: "Filter early — same habit as reading a Snowflake query profile.",
  },
  {
    id: "aurora-paid-select",
    label: "Paid orders (SELECT + LIMIT)",
    sql: `SELECT o.order_id, c.region, o.status, o.amount, o.promo_code
FROM aurora_orders o
JOIN aurora_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
ORDER BY o.amount DESC
LIMIT 5;`,
    note: "Projection + filter + LIMIT. aurora_lane SKUs live on the items table — this sample stays at order grain.",
  },
  {
    id: "aurora-distinct-nulls",
    label: "DISTINCT promos & NULL gaps",
    sql: `SELECT
  COUNT(*) AS order_cnt,
  COUNT(promo_code) AS promo_present,
  COUNT(*) - COUNT(promo_code) AS promo_nulls
FROM aurora_orders
WHERE order_date >= DATE '2026-09-01';`,
    note: "COUNT(col) skips NULLs. COUNT(*) counts rows. DISTINCT is a later sample — do not DISTINCT a fact before you know the grain.",
  },
  {
    id: "aurora-null-promo",
    label: "Unmatched promo (IS NULL)",
    sql: `SELECT order_id, status, amount, promo_code
FROM aurora_orders
WHERE promo_code IS NULL
ORDER BY order_id;`,
    note: "IS NULL is a predicate, not a value. promo_code = NULL never matches.",
  },
  {
    id: "aurora-agg-revenue",
    label: "Region revenue + HAVING",
    sql: `SELECT c.region, COUNT(*) AS paid_orders, ROUND(SUM(o.amount), 2) AS revenue
FROM aurora_orders o
JOIN aurora_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.region
HAVING SUM(o.amount) >= 20
ORDER BY revenue DESC;`,
    note: "WHERE filters rows before the group. HAVING filters groups. Do not SUM(o.amount) after joining items.",
  },
  {
    id: "aurora-like-in",
    label: "LIKE / IN / BETWEEN",
    sql: `SELECT order_id, promo_code, amount
FROM aurora_orders
WHERE promo_code LIKE 'F%'
   OR promo_code IN ('VIP', 'FLASH')
   OR amount BETWEEN 15 AND 50
ORDER BY order_id;`,
    note: "LIKE is for patterns. IN is a set. BETWEEN is inclusive. Prefer these over OR-chains of equality.",
  },
  {
    id: "aurora-case-bucket",
    label: "CASE size buckets",
    sql: `SELECT
  order_id,
  amount,
  CASE
    WHEN amount >= 80 THEN 'large'
    WHEN amount >= 20 THEN 'mid'
    ELSE 'small'
  END AS size_bucket
FROM aurora_orders
WHERE status <> 'cancelled'
ORDER BY amount DESC;`,
    note: "CASE is an expression, not a stored procedure. Keep buckets in one SELECT so reviewers can see the grain.",
  },
  {
    id: "aurora-exists-paid",
    label: "Customers with a paid order (EXISTS)",
    sql: `SELECT c.customer_id, c.region, c.email
FROM aurora_customers c
WHERE EXISTS (
  SELECT 1
  FROM aurora_orders o
  WHERE o.customer_id = c.customer_id
    AND o.status = 'paid'
)
ORDER BY c.customer_id;`,
    note: "EXISTS is a semi-join. It does not fan out customers when a buyer has many paid orders.",
  },
  {
    id: "aurora-any-threshold",
    label: "ANY / ALL stand-in",
    sql: `SELECT o.order_id, o.amount, c.region
FROM aurora_orders o
JOIN aurora_customers c ON c.customer_id = o.customer_id
WHERE o.amount > (
  SELECT AVG(amount) FROM aurora_orders WHERE status = 'paid'
)
ORDER BY o.amount DESC;`,
    note: "DuckDB stand-in for amount > ANY (SELECT …). Compare to a scalar subquery first — ANY/ALL are easy to misread in review.",
  },
  {
    id: "aurora-join-lane",
    label: "Items × Aurora Lane",
    sql: `SELECT o.order_id, p.product_name, i.qty, i.unit_price
FROM aurora_orders o
INNER JOIN aurora_order_items i ON i.order_id = o.order_id
INNER JOIN aurora_products p ON p.sku = i.sku
WHERE p.sku = 'SKU-LANE'
ORDER BY o.order_id;`,
    note: "Item grain. Sum unit_price * qty here — never SUM(order.amount) after this join.",
  },
  {
    id: "aurora-dml-preview",
    label: "Rows a write would touch",
    sql: `SELECT order_id, status, amount, order_date
FROM aurora_orders
WHERE status = 'pending' AND order_date <= DATE '2026-09-02'
ORDER BY order_id;`,
    note: "The local lab is read-only. Preview the set an UPDATE/DELETE would hit before you run it in a warehouse.",
  },
  {
    id: "aurora-schema",
    label: "Inspect aurora_* columns",
    sql: `SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'main' AND table_name LIKE 'aurora%'
ORDER BY table_name, ordinal_position;`,
    note: "Read the contract before ALTER/DROP. This lab does not run DDL — inspect, then copy CREATE/ALTER into your warehouse.",
  },
  {
    id: "aurora-date-window",
    label: "Inclusive date window",
    sql: `SELECT order_id, order_date, status, amount
FROM aurora_orders
WHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-04'
ORDER BY order_date, order_id;`,
    note: "BETWEEN on a DATE column is inclusive. Do not glue a user string into this predicate — bind a date parameter in app SQL.",
  },
  {
    id: "dbx-bronze-nulls",
    label: "Bronze NULL / corrupt landings",
    sql: `SELECT order_id, order_date, region, status, amount
FROM bronze_orders
WHERE amount IS NULL OR status = 'corrupt'
ORDER BY order_id;`,
    note: "amount = NULL matches zero rows. Silver in this seed drops corrupt bronze — that is the quality contract.",
  },
  {
    id: "dbx-silver-limit",
    label: "Silver peek (LIMIT)",
    sql: `SELECT order_id, order_date, region, status, amount
FROM silver_orders
WHERE status <> 'returned'
ORDER BY order_date DESC, order_id DESC
LIMIT 5;`,
    note: "LIMIT is a notebook sample. Jobs filter on a date partition or Autoloader checkpoint.",
  },
  {
    id: "dbx-gold-having",
    label: "Silver regions over a floor",
    sql: `SELECT region, COUNT(*) AS n, ROUND(SUM(amount), 2) AS amount
FROM silver_orders
WHERE status = 'ok'
GROUP BY region
HAVING SUM(amount) >= 40
ORDER BY amount DESC;`,
    note: "WHERE filters rows. HAVING filters groups. Gold should be this grain, persisted.",
  },
  {
    id: "dbx-case-status",
    label: "CASE status buckets",
    sql: `SELECT
  order_id,
  status,
  amount,
  CASE
    WHEN status = 'ok' AND amount >= 80 THEN 'large_ok'
    WHEN status = 'ok' THEN 'ok'
    WHEN status = 'returned' THEN 'returned'
    ELSE 'other'
  END AS status_bucket
FROM silver_orders
ORDER BY amount DESC;`,
    note: "CASE is a column expression for silver cleaning — not a Delta constraint.",
  },
  {
    id: "dbx-exists-ok",
    label: "Leftover bronze keys",
    sql: `SELECT b.order_id, b.status, b.amount
FROM bronze_orders b
WHERE NOT EXISTS (
  SELECT 1 FROM silver_orders s
  WHERE s.order_id = b.order_id
)
ORDER BY b.order_id;`,
    note: "Anti-join. This seed’s leftover is the corrupt bronze row that never made silver.",
  },
  {
    id: "dbx-schema",
    label: "Inspect bronze/silver/gold columns",
    sql: `SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'main'
  AND table_name IN ('bronze_orders', 'silver_orders', 'gold_daily_orders')
ORDER BY table_name, ordinal_position;`,
    note: "Read the contract first. This lab does not run CREATE TABLE USING DELTA.",
  },
  {
    id: "dbx-date-window",
    label: "Inclusive silver date window",
    sql: `SELECT order_id, order_date, region, amount
FROM silver_orders
WHERE order_date BETWEEN DATE '2026-09-02' AND DATE '2026-09-03'
ORDER BY order_date, order_id;`,
    note: "BETWEEN on DATE is inclusive. Put order_date in WHERE so Spark can prune.",
  },
  {
    id: "dbx-like-region",
    label: "LIKE / IN on silver",
    sql: `SELECT order_id, region, status, amount
FROM silver_orders
WHERE region LIKE 'w%'
   OR status IN ('ok', 'returned')
   OR amount BETWEEN 15 AND 50
ORDER BY order_id;`,
    note: "% is any suffix. BETWEEN is inclusive. Prefer IN over a long OR chain.",
  },
  {
    id: "sf-null-promo",
    label: "NULL-aware promo gap",
    sql: `SELECT
  COUNT(*) AS orders,
  COUNT(promo_code) AS with_promo,
  COUNT(*) - COUNT(promo_code) AS missing_promo
FROM sf_orders;`,
    note: "COUNT(col) skips NULLs. promo_code = NULL is never TRUE.",
  },
  {
    id: "sf-paid-limit",
    label: "Paid SAMPLE orders (LIMIT)",
    sql: `SELECT o.order_id, c.region, o.status, o.amount, o.promo_code
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
ORDER BY o.amount DESC
LIMIT 5;`,
    note: "LIMIT is a worksheet sample. Tasks / Dynamic Tables use a stream or a date window.",
  },
  {
    id: "sf-agg-having",
    label: "Paid revenue + HAVING",
    sql: `SELECT c.region, COUNT(*) AS paid_orders, ROUND(SUM(o.amount), 2) AS revenue
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.region
HAVING SUM(o.amount) >= 20
ORDER BY revenue DESC;`,
    note: "WHERE filters rows before the group. HAVING filters groups.",
  },
  {
    id: "sf-case-bucket",
    label: "CASE size buckets",
    sql: `SELECT
  order_id,
  amount,
  CASE
    WHEN amount >= 80 THEN 'large'
    WHEN amount >= 20 THEN 'mid'
    ELSE 'small'
  END AS size_bucket
FROM sf_orders
WHERE status <> 'pending'
ORDER BY amount DESC;`,
    note: "CASE is an expression, not a stored procedure.",
  },
  {
    id: "sf-exists-buyers",
    label: "Customers with no orders",
    sql: `SELECT c.customer_id, c.region, c.status
FROM sf_customers c
WHERE NOT EXISTS (
  SELECT 1 FROM sf_orders o
  WHERE o.customer_id = c.customer_id
)
ORDER BY c.customer_id;`,
    note: "Anti-join. This seed’s leftover is the churned west customer.",
  },
  {
    id: "sf-schema",
    label: "Inspect sf_* columns",
    sql: `SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'main' AND table_name LIKE 'sf_%'
ORDER BY table_name, ordinal_position;`,
    note: "Read the contract before ALTER/DROP. This lab does not run DDL.",
  },
  {
    id: "sf-date-window",
    label: "Inclusive SAMPLE date window",
    sql: `SELECT order_id, order_date, status, amount
FROM sf_orders
WHERE order_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-02'
ORDER BY order_date, order_id;`,
    note: "BETWEEN on DATE is inclusive. Bind dates in app SQL — do not glue a form string.",
  },
  {
    id: "sf-like-promo",
    label: "LIKE / IN / BETWEEN on SAMPLE",
    sql: `SELECT order_id, promo_code, amount
FROM sf_orders
WHERE promo_code LIKE 'F%'
   OR promo_code IN ('VIP', 'FLASH')
   OR amount BETWEEN 15 AND 50
ORDER BY order_id;`,
    note: "LIKE is for patterns. IN is a set. BETWEEN is inclusive.",
  },
  {
    id: "sf-dml-preview",
    label: "Rows a write would touch",
    sql: `SELECT order_id, status, amount, order_date
FROM sf_orders
WHERE status = 'pending' AND order_date <= DATE '2026-09-02'
ORDER BY order_id;`,
    note: "The local lab is read-only. Preview the set a MERGE would hit before you run it in an account.",
  },
  {
    id: "lab-catalogs",
    label: "Local catalogs (same-origin)",
    sql: `SELECT catalog, schema, object_name, object_type
FROM lab_catalog_objects
ORDER BY catalog, schema, object_name;`,
    note: "Same-origin DuckDB inventory. No remote catalog, no cloud attach. Unity Catalog / Snowflake account names are teaching labels on local objects.",
  },
  {
    id: "lab-schemas",
    label: "Local schemas",
    sql: `SELECT catalog_name, schema_name
FROM information_schema.schemata
WHERE schema_name IN ('bronze', 'silver', 'gold', 'metrics', 'aurora', 'analytics', 'main')
ORDER BY catalog_name, schema_name;`,
    note: "Schemas group tables. The local catalog is in-browser memory — not a remote Unity or Snowflake catalog.",
  },
  {
    id: "lab-views",
    label: "Local views",
    sql: `SELECT table_schema, table_name
FROM information_schema.views
WHERE table_schema IN ('silver', 'gold', 'aurora', 'analytics')
ORDER BY table_schema, table_name;`,
    note: "Views are stored SELECTs. This lab still will not run CREATE VIEW — inspect, then copy DDL to a warehouse.",
  },
  {
    id: "lab-current-catalog",
    label: "Current catalog + schema",
    sql: `SELECT current_catalog() AS catalog, current_schema() AS schema;`,
    note: "Three-level names are catalog.schema.table. Here the catalog is the in-memory DuckDB database.",
  },
  {
    id: "dbx-qualified-silver",
    label: "silver.orders (schema.table)",
    sql: `SELECT order_id, region, status, amount
FROM silver.orders
WHERE status = 'ok'
ORDER BY order_id;`,
    note: "Unqualified silver_orders still works. schema.table is the Unity Catalog habit without a remote catalog.",
  },
  {
    id: "dbx-ok-view",
    label: "silver.ok_orders view",
    sql: `SELECT order_id, region, amount
FROM silver.ok_orders
ORDER BY order_id;`,
    note: "A view over ok silver rows. Gold should read a contract, not re-filter bronze in every notebook.",
  },
  {
    id: "dbx-metric-view",
    label: "Metric-style gold (stand-in)",
    sql: `SELECT dim_order_date, dim_region, measure_order_count, measure_revenue
FROM metrics.orders_daily
ORDER BY dim_order_date, dim_region;`,
    note: "DuckDB table stand-in for a Unity Catalog Metric View. dim_* vs measure_* are named — not a live UC object.",
  },
  {
    id: "sf-qualified-orders",
    label: "analytics.orders (schema.table)",
    sql: `SELECT order_id, status, amount, promo_code
FROM analytics.orders
WHERE status = 'paid'
ORDER BY amount DESC;`,
    note: "database.schema.table in an account. This lab uses schema.table on the local catalog — the warehouse name is still compute.",
  },
  {
    id: "sf-paid-view",
    label: "analytics.paid_orders view",
    sql: `SELECT order_id, amount, promo_code
FROM analytics.paid_orders
ORDER BY order_id;`,
    note: "A view is a stored SELECT. Dynamic Tables persist a grain; this view does not.",
  },
  {
    id: "sf-metric-view",
    label: "Metric-style daily revenue",
    sql: `SELECT dim_order_date, dim_region, measure_order_count, measure_revenue
FROM metrics.sf_daily_revenue
ORDER BY dim_order_date, dim_region;`,
    note: "Stand-in for a Snowflake semantic / metric view. Local table — not Cortex and not a live account object.",
  },
  {
    id: "aurora-qualified-orders",
    label: "aurora.orders (schema.table)",
    sql: `SELECT order_id, status, amount, promo_code
FROM aurora.orders
WHERE status = 'paid'
ORDER BY amount DESC
LIMIT 5;`,
    note: "Same grain as aurora_orders in main. Qualify the schema when more than one contract shares a name.",
  },
  {
    id: "aurora-paid-view",
    label: "aurora.paid_orders view",
    sql: `SELECT order_id, amount, promo_code
FROM aurora.paid_orders
ORDER BY order_id;`,
    note: "A view over paid orders. Marts persist this grain; do not treat a view as a load contract.",
  },
  {
    id: "aurora-metric-view",
    label: "Metric-style region revenue",
    sql: `SELECT dim_region, measure_paid_orders, measure_revenue
FROM metrics.aurora_region_revenue
ORDER BY measure_revenue DESC;`,
    note: "Metric-view–style table: dimensions + measures. Not a BI semantic layer SaaS — just a local fixture.",
  },
  {
    id: "aurora-north-paid",
    label: "North + EMEA paid orders",
    sql: `SELECT o.order_id, c.region, o.amount, o.promo_code
FROM aurora_orders o
JOIN aurora_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid' AND c.region IN ('north', 'emea')
ORDER BY o.amount DESC;`,
    note: "Wave A1 extra customers live in north / emea. IN is a set — not an OR chain of equality.",
  },
  {
    id: "aurora-refunds-join",
    label: "Refunds × orders",
    sql: `SELECT r.refund_id, r.order_id, o.status, r.amount, r.reason
FROM aurora_refunds r
JOIN aurora_orders o ON o.order_id = r.order_id
ORDER BY r.refund_id;`,
    note: "Refund grain. Do not SUM(o.amount) here — the measure is r.amount.",
  },
  {
    id: "aurora-open-shipments",
    label: "Open shipments view",
    sql: `SELECT order_id, shipped_date, carrier, status
FROM aurora.open_shipments
ORDER BY shipped_date, order_id;`,
    note: "A view over in_transit / returned shipments. Not a load contract — marts persist this grain.",
  },
  {
    id: "aurora-sku-mix",
    label: "SKU mix (item grain)",
    sql: `SELECT p.category, p.product_name, SUM(i.qty) AS units, ROUND(SUM(i.qty * i.unit_price), 2) AS ext_amount
FROM aurora_order_items i
JOIN aurora_products p ON p.sku = i.sku
GROUP BY p.category, p.product_name
ORDER BY ext_amount DESC;`,
    note: "Dock and Notebook SKUs landed in Wave A1. Stay at item grain — never SUM(order.amount) after this join.",
  },
  {
    id: "aurora-window-latest",
    label: "Latest order per customer",
    sql: `SELECT customer_id, order_id, order_date, status, amount
FROM (
  SELECT
    customer_id,
    order_id,
    order_date,
    status,
    amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn
  FROM aurora_orders
) t
WHERE rn = 1
ORDER BY customer_id;`,
    note: "Window, not a self-join. rn = 1 is the current row for SCD-style change detection.",
  },
  {
    id: "aurora-late-window",
    label: "Late-arriving paid window",
    sql: `SELECT order_id, order_date, status, amount
FROM aurora_orders
WHERE status = 'paid'
  AND order_date >= DATE '2026-09-06'
ORDER BY order_date, order_id;`,
    note: "A watermark-shaped filter. Production incrementals use this habit — not LIMIT.",
  },
  {
    id: "dbx-events-quality",
    label: "Bronze event leftovers",
    sql: `SELECT b.event_id, b.order_id, b.event_type
FROM bronze_events b
WHERE NOT EXISTS (
  SELECT 1 FROM silver_events s
  WHERE s.event_id = b.event_id
)
ORDER BY b.event_id;`,
    note: "Anti-join on the event stream. Corrupt landings stay bronze-only — same contract as orders.",
  },
  {
    id: "dbx-returns-gold",
    label: "Gold daily returns",
    sql: `SELECT order_date, region, returned_orders, returned_amount
FROM gold_returns_daily
ORDER BY order_date, region;`,
    note: "Returned silver rows roll up here. Do not mix this grain with gold_daily_orders revenue.",
  },
  {
    id: "dbx-north-ok",
    label: "North silver (new landings)",
    sql: `SELECT order_id, order_date, region, status, amount
FROM silver_orders
WHERE region = 'north' AND status = 'ok'
ORDER BY order_date, order_id;`,
    note: "Wave A1 added north / latam bronze. Filter the partition-like column early.",
  },
  {
    id: "dbx-validated-events",
    label: "silver.validated_events view",
    sql: `SELECT event_id, order_id, event_ts
FROM silver.validated_events
ORDER BY event_ts;`,
    note: "A view over validated silver events. Gold should read a contract, not re-filter bronze in every notebook.",
  },
  {
    id: "dbx-metric-returns",
    label: "Metric-style returns",
    sql: `SELECT dim_order_date, dim_region, measure_return_count, measure_returned_amount
FROM metrics.returns_daily
ORDER BY dim_order_date, dim_region;`,
    note: "Stand-in for a Unity Catalog Metric View on returns. dim_* vs measure_* are named — not a live UC object.",
  },
  {
    id: "sf-line-items",
    label: "SAMPLE line items × orders",
    sql: `SELECT o.order_id, o.status, i.sku, i.qty, i.unit_price
FROM sf_orders o
JOIN sf_line_items i ON i.order_id = o.order_id
ORDER BY o.order_id, i.sku;`,
    note: "Item grain. Sum qty * unit_price here — never SUM(o.amount) after this join.",
  },
  {
    id: "sf-north-paid",
    label: "North / LATAM SAMPLE paid",
    sql: `SELECT o.order_id, c.region, o.amount, o.promo_code
FROM sf_orders o
JOIN sf_customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid' AND c.region IN ('north', 'latam')
ORDER BY o.amount DESC;`,
    note: "Wave A1 extra SAMPLE customers. Warehouse name is still compute — this is schema.table on the local catalog.",
  },
  {
    id: "sf-history-delta",
    label: "Time-travel amount delta",
    sql: `SELECT
  v1.order_id,
  v1.amount AS amount_v1,
  v2.amount AS amount_v2,
  ROUND(v2.amount - v1.amount, 2) AS delta
FROM sf_orders_history v1
JOIN sf_orders_history v2
  ON v1.order_id = v2.order_id
WHERE v1.as_of_version = 1 AND v2.as_of_version = 2
ORDER BY v1.order_id;`,
    note: "DuckDB stand-in for comparing AT (TIMESTAMP) versions. Snowflake Time Travel syntax differs.",
  },
  {
    id: "sf-qualified-items",
    label: "analytics.line_items",
    sql: `SELECT order_id, sku, qty, unit_price
FROM analytics.line_items
WHERE sku LIKE 'SKU-%'
ORDER BY order_id, sku;`,
    note: "database.schema.table in an account. This lab uses schema.table — the warehouse name is still compute.",
  },
];

const BY_LESSON: Record<DatabricksLabSlug | SnowflakeLabSlug | SqlLabSlug, string[]> = {
  "dbx-workspace-cluster-basics": ["catalog-objects", "medallion-counts", "dbx-schema", "lab-catalogs", "dbx-events-quality"],
  "dbx-lakehouse-fundamentals": ["medallion-counts", "silver-quality", "gold-revenue", "dbx-gold-having", "dbx-returns-gold"],
  "dbx-delta-lake-basics": ["upsert-shape", "silver-quality", "medallion-counts", "dbx-bronze-nulls", "dbx-events-quality"],
  "dbx-spark-sql-performance": ["partition-filter", "gold-revenue", "silver-quality", "dbx-date-window", "dbx-north-ok"],
  "dbx-sql-warehouses": ["gold-revenue", "partition-filter", "medallion-counts", "dbx-gold-having", "dbx-returns-gold"],
  "dbx-spark-select-nulls": ["dbx-silver-limit", "dbx-bronze-nulls", "silver-quality", "dbx-north-ok"],
  "dbx-delta-write-preview": ["upsert-shape", "dbx-bronze-nulls", "dbx-exists-ok", "dbx-events-quality"],
  "dbx-gold-aggregates": ["gold-revenue", "dbx-gold-having", "silver-quality", "dbx-metric-view", "dbx-returns-gold"],
  "dbx-silver-patterns-case": ["dbx-like-region", "dbx-case-status", "dbx-silver-limit", "dbx-north-ok"],
  "dbx-semi-joins-leftovers": ["dbx-exists-ok", "upsert-shape", "medallion-counts", "dbx-events-quality"],
  "dbx-delta-table-contracts": ["dbx-schema", "catalog-objects", "medallion-counts", "lab-schemas", "dbx-validated-events"],
  "dbx-dates-partition-filters": ["partition-filter", "dbx-date-window", "gold-revenue", "dbx-north-ok"],
  "dbx-unity-catalog": ["lab-catalogs", "lab-current-catalog", "dbx-qualified-silver", "dbx-metric-view", "dbx-metric-returns"],
  "dbx-catalog-views-metrics": ["lab-catalogs", "lab-schemas", "lab-views", "dbx-ok-view", "dbx-metric-view", "dbx-validated-events", "dbx-metric-returns"],
  "sf-day0-objects": ["sf-account-map", "sf-warehouses", "sf-schema", "lab-catalogs", "sf-qualified-items"],
  "sf-architecture": ["sf-warehouses", "sf-account-map", "sf-orders-customers", "sf-line-items"],
  "sf-time-travel-clones": ["sf-time-travel", "sf-orders-customers", "sf-date-window", "sf-history-delta"],
  "sf-dynamic-tables": ["sf-daily-mart", "sf-orders-customers", "sf-agg-having", "sf-metric-view", "sf-line-items"],
  "sf-performance-cost": ["sf-prune-filter", "sf-warehouses", "sf-daily-mart", "sf-north-paid"],
  "sf-select-filter-nulls": ["sf-paid-limit", "sf-null-promo", "sf-orders-customers", "sf-north-paid"],
  "sf-dml-write-path": ["sf-dml-preview", "sf-null-promo", "sf-paid-limit", "sf-line-items"],
  "sf-aggregates-group-having": ["sf-daily-mart", "sf-agg-having", "sf-null-promo", "sf-north-paid"],
  "sf-patterns-aliases-case": ["sf-like-promo", "sf-case-bucket", "sf-paid-limit", "sf-north-paid"],
  "sf-exists-semi-joins": ["sf-exists-buyers", "sf-orders-customers", "sf-paid-limit", "sf-line-items"],
  "sf-ddl-constraints": ["sf-schema", "sf-account-map", "sf-paid-limit", "lab-schemas", "sf-qualified-items"],
  "sf-dates-injection": ["sf-date-window", "sf-time-travel", "sf-like-promo", "sf-history-delta"],
  "sf-catalog-views-metrics": ["lab-catalogs", "lab-schemas", "lab-views", "sf-paid-view", "sf-metric-view", "sf-qualified-items"],
  "sql-select-filter-nulls": ["aurora-paid-select", "aurora-distinct-nulls", "aurora-null-promo", "aurora-north-paid"],
  "sql-dml-write-path": ["aurora-dml-preview", "aurora-null-promo", "aurora-paid-select", "aurora-refunds-join"],
  "sql-aggregates-group-having": ["aurora-agg-revenue", "aurora-distinct-nulls", "aurora-paid-select", "aurora-sku-mix"],
  "sql-patterns-aliases-case": ["aurora-like-in", "aurora-case-bucket", "aurora-paid-select", "aurora-north-paid"],
  "sql-exists-any-all": ["aurora-exists-paid", "aurora-any-threshold", "aurora-join-lane", "aurora-refunds-join"],
  "sql-ddl-constraints": ["aurora-schema", "aurora-paid-select", "lab-schemas", "aurora-qualified-orders", "aurora-open-shipments"],
  "sql-dates-injection": ["aurora-date-window", "aurora-like-in", "aurora-paid-select", "aurora-late-window"],
  "sql-joins-set-logic-recap": ["aurora-join-lane", "aurora-exists-paid", "aurora-paid-select", "aurora-refunds-join", "aurora-sku-mix", "aurora-window-latest"],
  "sql-catalog-views-metrics": ["lab-catalogs", "lab-schemas", "lab-views", "aurora-paid-view", "aurora-metric-view", "aurora-open-shipments"],
};

const PYTHON_SAMPLES: LabSample[] = [
  {
    id: "py-unknown-promos",
    label: "Count unknown promos",
    code: `rows = [
    {"order_id": 1, "promo_code": "FALL26"},
    {"order_id": 2, "promo_code": None},
]
unknown = sum(1 for r in rows if r["promo_code"] is None)
print(unknown)`,
    note: "is None, not == None. Truthiness (if not promo) also treats '' as unknown.",
  },
  {
    id: "py-assert-row",
    label: "Row dict + required keys",
    code: `REQUIRED = ("order_id", "status", "amount")

def assert_row(row: dict) -> dict:
    missing = [k for k in REQUIRED if k not in row]
    if missing:
        raise ValueError(f"missing keys: {missing}")
    return row

row = {"order_id": 1001, "status": "paid", "amount": 42.5, "promo_code": None}
print(assert_row(row))`,
    note: "promo_code may be None. order_id may not be absent.",
  },
  {
    id: "py-paid-only",
    label: "Pure status filter",
    code: `def paid_only(rows: list[dict]) -> list[dict]:
    return [r for r in rows if r.get("status") == "paid"]

raw = [{"order_id": 1, "status": "paid"}, {"order_id": 2, "status": "pending"}]
print(paid_only(raw))`,
    note: "Same input → same output. No file, no SQL, no global.",
  },
  {
    id: "py-no-mutate",
    label: "Do not mutate the caller",
    code: `def with_event_date(rows: list[dict], key="order_date") -> list[dict]:
    return [{**r, "event_date": r[key]} for r in rows]

raw = [{"order_id": 1, "order_date": "2026-09-12"}]
print(with_event_date(raw))
print("caller unchanged", raw)`,
    note: "In-place updates make retries and tests lie. Return a new list of dicts.",
  },
  {
    id: "py-landing-glob",
    label: "Landing glob (seeded VFS)",
    code: `from pathlib import Path

LANDING = Path("/data/landing/orders")

def list_order_files(day: str) -> list[Path]:
    folder = LANDING / day
    return sorted(folder.glob("*.json"))

def assert_orders_stem(path: Path) -> str:
    prefix, _, day = path.stem.partition("_")
    if prefix != "orders" or len(day) != 10:
        raise ValueError(f"unexpected landing name: {path.name}")
    return day

for path in list_order_files("2026-09-12"):
    try:
        print(path.name, "->", assert_orders_stem(path))
    except ValueError as exc:
        print(path.name, "rejected:", exc)`,
    note: "This lab seeds /data/landing/orders. glob('*.json') also picks up notes.json — reject the stem.",
  },
  {
    id: "py-loud-transform",
    label: "Fail loud on a missing key",
    code: `def transform_orders(rows: list[dict]) -> list[dict]:
    out = []
    for row in rows:
        if "order_id" not in row:
            raise ValueError(f"row missing order_id: {row!r}")
        out.append(row)
    return out

print(transform_orders([{"order_id": 1, "amount": 10}]))`,
    note: "An empty list looks like a successful empty window. Raise on contract breaks.",
  },
  {
    id: "py-watermark",
    label: "UTC half-open window",
    code: `from datetime import datetime, timedelta, timezone

def next_window(watermark: datetime, hours=24) -> tuple[datetime, datetime]:
    if watermark.tzinfo is None:
        raise ValueError("watermark must be timezone-aware")
    return watermark, watermark + timedelta(hours=hours)

wm = datetime(2026, 9, 12, tzinfo=timezone.utc)
print(next_window(wm))`,
    note: "Naive datetimes are a foot-gun across DST. [start, end) so the next run starts at end.",
  },
  {
    id: "py-project-filter",
    label: "Project + filter",
    code: `rows = [
    {"order_id": 1, "status": "paid", "amount": 10},
    {"order_id": 2, "status": "pending", "amount": 99},
]
paid = [
    {"order_id": r["order_id"], "amount": r["amount"]}
    for r in rows
    if r["status"] == "paid"
]
print(paid)`,
    note: "One row in, one row out. A nested comprehension over items×orders is a fan-out.",
  },
  {
    id: "py-chunk-ids",
    label: "Chunk then yield",
    code: `def extract_chunks(rows, size=2):
    offset = 0
    while offset < len(rows):
        batch = rows[offset : offset + size]
        yield batch
        offset += len(batch)

rows = [{"order_id": n} for n in range(1, 6)]
for chunk in extract_chunks(rows):
    print([r["order_id"] for r in chunk])`,
    note: "yield keeps RAM flat. list(extract_chunks(...)) undoes the point.",
  },
  {
    id: "py-job-log",
    label: "Job-shaped logger",
    code: `import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
log = logging.getLogger("aurora.orders_etl")

def run(start: str, end: str, extract, transform, load) -> dict:
    raw = extract(start, end)
    clean = transform(raw)
    metrics = {"start": start, "end": end, "rows_in": len(raw), "rows_out": len(clean)}
    log.info("transform_ok %s", metrics)
    load(clean)
    log.info("load_ok %s", metrics)
    return metrics

print(run("2026-09-01", "2026-09-02", lambda *_: [{"order_id": 1}], lambda rows: rows, lambda *_: None))`,
    note: "INFO is a metric. Do not log the full row payload or a DSN.",
  },
  {
    id: "py-parse-landing",
    label: "Parse a landing JSON file",
    code: `import json
from pathlib import Path

path = Path("/data/landing/orders/2026-09-11/orders_2026-09-11.json")
rows = json.loads(path.read_text())
paid = [r for r in rows if r.get("status") == "paid" and r.get("amount") is not None]
print(len(rows), "landed;", len(paid), "paid")
print(paid[0] if paid else "none")`,
    note: "json + pathlib only. amount is None stays out of gold — do not coerce to 0.",
  },
  {
    id: "py-retry-shape",
    label: "Retry-shaped extract",
    code: `def extract_with_retry(fn, attempts=3):
    last = None
    for n in range(1, attempts + 1):
        try:
            return fn()
        except TimeoutError as exc:
            last = exc
            print(f"retry {n}/{attempts}")
    raise last

calls = {"n": 0}

def flaky():
    calls["n"] += 1
    if calls["n"] < 2:
        raise TimeoutError("landing timeout")
    return [{"order_id": 1001, "status": "paid"}]

print(extract_with_retry(flaky))`,
    note: "Retry timeouts. Do not retry a KeyError on a missing contract key — that is not transient.",
  },
  {
    id: "py-window-overlap",
    label: "Reject overlapping windows",
    code: `from datetime import datetime, timezone

def assert_half_open(start: datetime, end: datetime, prev_end: datetime | None) -> None:
    if start.tzinfo is None or end.tzinfo is None:
        raise ValueError("windows must be timezone-aware")
    if end <= start:
        raise ValueError("end must be after start")
    if prev_end is not None and start < prev_end:
        raise ValueError("window overlaps previous watermark")

start = datetime(2026, 9, 12, tzinfo=timezone.utc)
end = datetime(2026, 9, 13, tzinfo=timezone.utc)
assert_half_open(start, end, datetime(2026, 9, 12, tzinfo=timezone.utc))
print("ok", start, end)`,
    note: "[start, end) so the next run starts at end. Overlap double-loads gold.",
  },
  {
    id: "py-returns-landing",
    label: "Returns landing glob",
    code: `from pathlib import Path

RETURNS = Path("/data/landing/returns")

def list_return_files(day: str) -> list[Path]:
    return sorted((RETURNS / day).glob("returns_*.json"))

for path in list_return_files("2026-09-12"):
    print(path.name)`,
    note: "Separate landing from orders. glob('*.json') on a mixed folder is how notes.json sneaks in.",
  },
  {
    id: "py-promo-lookup",
    label: "Promo ref lookup",
    code: `import json
from pathlib import Path

promos = {row["code"]: row for row in json.loads(Path("/data/ref/promos.json").read_text())}

def attach_promo(row: dict) -> dict:
    code = row.get("promo_code")
    if code is None:
        return {**row, "promo_known": False}
    if code not in promos:
        raise ValueError(f"unknown promo: {code}")
    return {**row, "promo_known": True, "promo_pct": promos[code]["pct"]}

print(attach_promo({"order_id": 1, "promo_code": "FALL26"}))
print(attach_promo({"order_id": 2, "promo_code": None}))`,
    note: "None promo is unknown, not an error. A code missing from the ref file is a contract break.",
  },
  {
    id: "py-chunk-landing",
    label: "Chunk parsed landing rows",
    code: `import json
from pathlib import Path

def chunks(rows, size=2):
    offset = 0
    while offset < len(rows):
        batch = rows[offset : offset + size]
        yield batch
        offset += len(batch)

rows = json.loads(Path("/data/landing/orders/2026-09-13/orders_2026-09-13.json").read_text())
for batch in chunks(rows):
    print([r["order_id"] for r in batch])`,
    note: "yield keeps RAM flat on a real extract. list(chunks(...)) undoes the point.",
  },
];

const PYTHON_BY_LESSON: Record<PythonLabSlug, string[]> = {
  "python-none-dicts-rows": ["py-unknown-promos", "py-assert-row", "py-paid-only", "py-promo-lookup"],
  "python-functions-pure-transforms": ["py-paid-only", "py-no-mutate", "py-assert-row", "py-promo-lookup"],
  "python-pathlib-extracts": ["py-landing-glob", "py-assert-row", "py-parse-landing", "py-returns-landing"],
  "python-exceptions-retries": ["py-loud-transform", "py-assert-row", "py-unknown-promos", "py-retry-shape"],
  "python-datetimes-watermarks": ["py-watermark", "py-project-filter", "py-window-overlap"],
  "python-comprehensions-chunks": ["py-project-filter", "py-chunk-ids", "py-paid-only", "py-chunk-landing"],
  "python-logging-not-print": ["py-job-log", "py-paid-only", "py-parse-landing"],
};

export function samplesForLesson(slug: string): LabSample[] {
  const pythonIds = (PYTHON_BY_LESSON as Record<string, string[] | undefined>)[slug];
  if (pythonIds) {
    return pythonIds
      .map((id) => PYTHON_SAMPLES.find((s) => s.id === id))
      .filter((s): s is LabSample => Boolean(s));
  }
  const ids = (BY_LESSON as Record<string, string[] | undefined>)[slug] ?? [
    "medallion-counts",
    "gold-revenue",
  ];
  return ids
    .map((id) => SHARED.find((s) => s.id === id))
    .filter((s): s is LabSample => Boolean(s));
}

export { LAB_SEED_SQL } from "./seed";

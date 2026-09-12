export const DATABRICKS_LAB_ENTRY_SLUG = "dbx-workspace-cluster-basics";
export const SNOWFLAKE_LAB_ENTRY_SLUG = "sf-day0-objects";
export const SQL_LAB_ENTRY_SLUG = "sql-select-filter-nulls";

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

export type DatabricksLabSlug = (typeof DATABRICKS_LAB_SLUGS)[number];
export type SnowflakeLabSlug = (typeof SNOWFLAKE_LAB_SLUGS)[number];
export type SqlLabSlug = (typeof SQL_LAB_SLUGS)[number];

/** stepIndex written after a successful local lab run (does not complete the lesson). */
export const LAB_STEP_INDEX = 1;

export interface LabSample {
  id: string;
  label: string;
  sql: string;
  note?: string;
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

export function isLabLesson(track: string, slug: string): boolean {
  return (
    isDatabricksLabLesson(track, slug) ||
    isSnowflakeLabLesson(track, slug) ||
    isSqlLabLesson(track, slug)
  );
}

export function labEntrySlug(track: string): string | undefined {
  if (track === "databricks") return DATABRICKS_LAB_ENTRY_SLUG;
  if (track === "snowflake") return SNOWFLAKE_LAB_ENTRY_SLUG;
  if (track === "sql") return SQL_LAB_ENTRY_SLUG;
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
];

const BY_LESSON: Record<DatabricksLabSlug | SnowflakeLabSlug | SqlLabSlug, string[]> = {
  "dbx-workspace-cluster-basics": ["catalog-objects", "medallion-counts", "dbx-schema", "lab-catalogs"],
  "dbx-lakehouse-fundamentals": ["medallion-counts", "silver-quality", "gold-revenue", "dbx-gold-having"],
  "dbx-delta-lake-basics": ["upsert-shape", "silver-quality", "medallion-counts", "dbx-bronze-nulls"],
  "dbx-spark-sql-performance": ["partition-filter", "gold-revenue", "silver-quality", "dbx-date-window"],
  "dbx-sql-warehouses": ["gold-revenue", "partition-filter", "medallion-counts", "dbx-gold-having"],
  "dbx-spark-select-nulls": ["dbx-silver-limit", "dbx-bronze-nulls", "silver-quality"],
  "dbx-delta-write-preview": ["upsert-shape", "dbx-bronze-nulls", "dbx-exists-ok"],
  "dbx-gold-aggregates": ["gold-revenue", "dbx-gold-having", "silver-quality", "dbx-metric-view"],
  "dbx-silver-patterns-case": ["dbx-like-region", "dbx-case-status", "dbx-silver-limit"],
  "dbx-semi-joins-leftovers": ["dbx-exists-ok", "upsert-shape", "medallion-counts"],
  "dbx-delta-table-contracts": ["dbx-schema", "catalog-objects", "medallion-counts", "lab-schemas"],
  "dbx-dates-partition-filters": ["partition-filter", "dbx-date-window", "gold-revenue"],
  "dbx-unity-catalog": ["lab-catalogs", "lab-current-catalog", "dbx-qualified-silver", "dbx-metric-view"],
  "dbx-catalog-views-metrics": ["lab-catalogs", "lab-schemas", "lab-views", "dbx-ok-view", "dbx-metric-view"],
  "sf-day0-objects": ["sf-account-map", "sf-warehouses", "sf-schema", "lab-catalogs"],
  "sf-architecture": ["sf-warehouses", "sf-account-map", "sf-orders-customers"],
  "sf-time-travel-clones": ["sf-time-travel", "sf-orders-customers", "sf-date-window"],
  "sf-dynamic-tables": ["sf-daily-mart", "sf-orders-customers", "sf-agg-having", "sf-metric-view"],
  "sf-performance-cost": ["sf-prune-filter", "sf-warehouses", "sf-daily-mart"],
  "sf-select-filter-nulls": ["sf-paid-limit", "sf-null-promo", "sf-orders-customers"],
  "sf-dml-write-path": ["sf-dml-preview", "sf-null-promo", "sf-paid-limit"],
  "sf-aggregates-group-having": ["sf-daily-mart", "sf-agg-having", "sf-null-promo"],
  "sf-patterns-aliases-case": ["sf-like-promo", "sf-case-bucket", "sf-paid-limit"],
  "sf-exists-semi-joins": ["sf-exists-buyers", "sf-orders-customers", "sf-paid-limit"],
  "sf-ddl-constraints": ["sf-schema", "sf-account-map", "sf-paid-limit", "lab-schemas"],
  "sf-dates-injection": ["sf-date-window", "sf-time-travel", "sf-like-promo"],
  "sf-catalog-views-metrics": ["lab-catalogs", "lab-schemas", "lab-views", "sf-paid-view", "sf-metric-view"],
  "sql-select-filter-nulls": ["aurora-paid-select", "aurora-distinct-nulls", "aurora-null-promo"],
  "sql-dml-write-path": ["aurora-dml-preview", "aurora-null-promo", "aurora-paid-select"],
  "sql-aggregates-group-having": ["aurora-agg-revenue", "aurora-distinct-nulls", "aurora-paid-select"],
  "sql-patterns-aliases-case": ["aurora-like-in", "aurora-case-bucket", "aurora-paid-select"],
  "sql-exists-any-all": ["aurora-exists-paid", "aurora-any-threshold", "aurora-join-lane"],
  "sql-ddl-constraints": ["aurora-schema", "aurora-paid-select", "lab-schemas", "aurora-qualified-orders"],
  "sql-dates-injection": ["aurora-date-window", "aurora-like-in", "aurora-paid-select"],
  "sql-joins-set-logic-recap": ["aurora-join-lane", "aurora-exists-paid", "aurora-paid-select"],
  "sql-catalog-views-metrics": ["lab-catalogs", "lab-schemas", "lab-views", "aurora-paid-view", "aurora-metric-view"],
};

export function samplesForLesson(slug: string): LabSample[] {
  const ids = (BY_LESSON as Record<string, string[] | undefined>)[slug] ?? [
    "medallion-counts",
    "gold-revenue",
  ];
  return ids
    .map((id) => SHARED.find((s) => s.id === id))
    .filter((s): s is LabSample => Boolean(s));
}

export { LAB_SEED_SQL } from "./seed";

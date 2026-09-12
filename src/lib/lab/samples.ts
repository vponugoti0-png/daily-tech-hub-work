export const DATABRICKS_LAB_ENTRY_SLUG = "dbx-workspace-cluster-basics";
export const SNOWFLAKE_LAB_ENTRY_SLUG = "sf-day0-objects";

export const DATABRICKS_LAB_SLUGS = [
  "dbx-workspace-cluster-basics",
  "dbx-lakehouse-fundamentals",
  "dbx-delta-lake-basics",
  "dbx-spark-sql-performance",
  "dbx-sql-warehouses",
] as const;

export const SNOWFLAKE_LAB_SLUGS = [
  "sf-day0-objects",
  "sf-architecture",
  "sf-time-travel-clones",
  "sf-dynamic-tables",
  "sf-performance-cost",
] as const;

export type DatabricksLabSlug = (typeof DATABRICKS_LAB_SLUGS)[number];
export type SnowflakeLabSlug = (typeof SNOWFLAKE_LAB_SLUGS)[number];

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

export function isLabLesson(track: string, slug: string): boolean {
  return isDatabricksLabLesson(track, slug) || isSnowflakeLabLesson(track, slug);
}

export function labEntrySlug(track: string): string | undefined {
  if (track === "databricks") return DATABRICKS_LAB_ENTRY_SLUG;
  if (track === "snowflake") return SNOWFLAKE_LAB_ENTRY_SLUG;
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
];

const BY_LESSON: Record<DatabricksLabSlug | SnowflakeLabSlug, string[]> = {
  "dbx-workspace-cluster-basics": ["catalog-objects", "medallion-counts"],
  "dbx-lakehouse-fundamentals": ["medallion-counts", "silver-quality", "gold-revenue"],
  "dbx-delta-lake-basics": ["upsert-shape", "silver-quality", "medallion-counts"],
  "dbx-spark-sql-performance": ["partition-filter", "gold-revenue", "silver-quality"],
  "dbx-sql-warehouses": ["gold-revenue", "partition-filter", "medallion-counts"],
  "sf-day0-objects": ["sf-account-map", "sf-warehouses"],
  "sf-architecture": ["sf-warehouses", "sf-account-map", "sf-orders-customers"],
  "sf-time-travel-clones": ["sf-time-travel", "sf-orders-customers"],
  "sf-dynamic-tables": ["sf-daily-mart", "sf-orders-customers"],
  "sf-performance-cost": ["sf-prune-filter", "sf-warehouses", "sf-daily-mart"],
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

/** Seed tables for the in-browser lab (DuckDB). Databricks/Delta dialect is not required. */
export const LAB_SEED_SQL = `
CREATE OR REPLACE TABLE workspace_objects AS
SELECT * FROM (VALUES
  ('main', 'bronze', 'orders_raw', 'bronze'),
  ('main', 'silver', 'orders', 'silver'),
  ('main', 'gold', 'orders_daily', 'gold'),
  ('main', 'gold', 'revenue_by_region', 'gold')
) AS t(catalog, schema, table_name, layer);

CREATE OR REPLACE TABLE bronze_orders AS
SELECT * FROM (VALUES
  (1, DATE '2026-09-01', 'west', 'ok', 12.50),
  (2, DATE '2026-09-01', 'east', 'ok', 40.00),
  (3, DATE '2026-09-02', 'west', 'corrupt', NULL),
  (4, DATE '2026-09-02', 'east', 'ok', 18.25),
  (5, DATE '2026-09-03', 'west', 'ok', 99.00),
  (6, DATE '2026-09-03', 'east', 'returned', 15.00)
) AS t(order_id, order_date, region, status, amount);

CREATE OR REPLACE TABLE silver_orders AS
SELECT order_id, order_date, region, status, amount
FROM bronze_orders
WHERE status <> 'corrupt';

CREATE OR REPLACE TABLE gold_daily_orders AS
SELECT
  order_date,
  region,
  COUNT(*) AS orders,
  ROUND(SUM(amount), 2) AS revenue
FROM silver_orders
GROUP BY order_date, region;

CREATE OR REPLACE TABLE sf_account_objects AS
SELECT * FROM (VALUES
  ('analytics', 'raw', 'orders', 'table'),
  ('analytics', 'analytics', 'orders_daily', 'table'),
  ('analytics', 'marts', 'revenue_by_region', 'table'),
  ('sandbox', 'public', 'scratch', 'table')
) AS t(database, schema, object_name, object_type);

CREATE OR REPLACE TABLE sf_warehouses AS
SELECT * FROM (VALUES
  ('learn_wh', 'XSMALL', 60, 'suspended'),
  ('etl_wh', 'SMALL', 60, 'suspended'),
  ('bi_wh', 'MEDIUM', 300, 'running')
) AS t(name, size, auto_suspend_sec, status);

CREATE OR REPLACE TABLE sf_customers AS
SELECT * FROM (VALUES
  (1, 'west', 'active'),
  (2, 'east', 'active'),
  (3, 'west', 'churned')
) AS t(customer_id, region, status);

CREATE OR REPLACE TABLE sf_orders AS
SELECT * FROM (VALUES
  (101, 1, DATE '2026-09-01', 12.50, 2),
  (102, 2, DATE '2026-09-01', 40.00, 2),
  (103, 1, DATE '2026-09-02', 18.25, 2),
  (104, 2, DATE '2026-09-03', 99.00, 2)
) AS t(order_id, customer_id, order_date, amount, as_of_version);

CREATE OR REPLACE TABLE sf_orders_history AS
SELECT * FROM (VALUES
  (101, 1, DATE '2026-09-01', 10.00, 1),
  (101, 1, DATE '2026-09-01', 12.50, 2),
  (102, 2, DATE '2026-09-01', 40.00, 1),
  (102, 2, DATE '2026-09-01', 40.00, 2)
) AS t(order_id, customer_id, order_date, amount, as_of_version);
`;

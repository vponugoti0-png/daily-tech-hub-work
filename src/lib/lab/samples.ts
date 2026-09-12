export const DATABRICKS_LAB_ENTRY_SLUG = "dbx-workspace-cluster-basics";

export const DATABRICKS_LAB_SLUGS = [
  "dbx-workspace-cluster-basics",
  "dbx-lakehouse-fundamentals",
  "dbx-delta-lake-basics",
  "dbx-spark-sql-performance",
  "dbx-sql-warehouses",
] as const;

export type DatabricksLabSlug = (typeof DATABRICKS_LAB_SLUGS)[number];

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
];

const BY_LESSON: Record<DatabricksLabSlug, string[]> = {
  "dbx-workspace-cluster-basics": ["catalog-objects", "medallion-counts"],
  "dbx-lakehouse-fundamentals": ["medallion-counts", "silver-quality", "gold-revenue"],
  "dbx-delta-lake-basics": ["upsert-shape", "silver-quality", "medallion-counts"],
  "dbx-spark-sql-performance": ["partition-filter", "gold-revenue", "silver-quality"],
  "dbx-sql-warehouses": ["gold-revenue", "partition-filter", "medallion-counts"],
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
`;

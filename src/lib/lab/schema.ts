/**
 * Static seed catalog for the Local practice lab schema sidebar.
 * Mirrors `seed.ts` so the sidebar is visible before DuckDB-WASM boots.
 * Not a live warehouse / Unity Catalog / Snowflake account.
 */

export type LabDialect = "sql" | "databricks" | "snowflake";

export interface LabSchemaColumn {
  name: string;
  type: string;
}

export interface LabSchemaTable {
  /** Unqualified or schema.table display name. */
  name: string;
  schema: string;
  kind: "table" | "view";
  columns: LabSchemaColumn[];
  dialects: LabDialect[];
}

const AURORA_CUSTOMER_COLS: LabSchemaColumn[] = [
  { name: "customer_id", type: "INTEGER" },
  { name: "region", type: "VARCHAR" },
  { name: "status", type: "VARCHAR" },
  { name: "email", type: "VARCHAR" },
  { name: "signup_date", type: "DATE" },
];

const AURORA_ORDER_COLS: LabSchemaColumn[] = [
  { name: "order_id", type: "INTEGER" },
  { name: "customer_id", type: "INTEGER" },
  { name: "order_date", type: "DATE" },
  { name: "status", type: "VARCHAR" },
  { name: "amount", type: "DECIMAL" },
  { name: "promo_code", type: "VARCHAR" },
];

const AURORA_ITEM_COLS: LabSchemaColumn[] = [
  { name: "order_id", type: "INTEGER" },
  { name: "sku", type: "VARCHAR" },
  { name: "qty", type: "INTEGER" },
  { name: "unit_price", type: "DECIMAL" },
];

const AURORA_PRODUCT_COLS: LabSchemaColumn[] = [
  { name: "sku", type: "VARCHAR" },
  { name: "category", type: "VARCHAR" },
  { name: "product_name", type: "VARCHAR" },
];

const MEDALLION_ORDER_COLS: LabSchemaColumn[] = [
  { name: "order_id", type: "INTEGER" },
  { name: "order_date", type: "DATE" },
  { name: "region", type: "VARCHAR" },
  { name: "status", type: "VARCHAR" },
  { name: "amount", type: "DECIMAL" },
];

const GOLD_DAILY_COLS: LabSchemaColumn[] = [
  { name: "order_date", type: "DATE" },
  { name: "region", type: "VARCHAR" },
  { name: "orders", type: "INTEGER" },
  { name: "revenue", type: "DECIMAL" },
];

const SF_CUSTOMER_COLS: LabSchemaColumn[] = [
  { name: "customer_id", type: "INTEGER" },
  { name: "region", type: "VARCHAR" },
  { name: "status", type: "VARCHAR" },
];

const SF_ORDER_COLS: LabSchemaColumn[] = [
  { name: "order_id", type: "INTEGER" },
  { name: "customer_id", type: "INTEGER" },
  { name: "order_date", type: "DATE" },
  { name: "amount", type: "DECIMAL" },
  { name: "as_of_version", type: "INTEGER" },
  { name: "status", type: "VARCHAR" },
  { name: "promo_code", type: "VARCHAR" },
];

const METRIC_DAILY_COLS: LabSchemaColumn[] = [
  { name: "dim_order_date", type: "VARCHAR" },
  { name: "dim_region", type: "VARCHAR" },
  { name: "measure_order_count", type: "INTEGER" },
  { name: "measure_revenue", type: "DECIMAL" },
];

/** Seed tables / views shown in the SQL · DBX · SF schema sidebar. */
export const LAB_SEED_SCHEMA: LabSchemaTable[] = [
  {
    name: "aurora_orders",
    schema: "main",
    kind: "table",
    columns: AURORA_ORDER_COLS,
    dialects: ["sql"],
  },
  {
    name: "aurora_customers",
    schema: "main",
    kind: "table",
    columns: AURORA_CUSTOMER_COLS,
    dialects: ["sql"],
  },
  {
    name: "aurora_order_items",
    schema: "main",
    kind: "table",
    columns: AURORA_ITEM_COLS,
    dialects: ["sql"],
  },
  {
    name: "aurora_products",
    schema: "main",
    kind: "table",
    columns: AURORA_PRODUCT_COLS,
    dialects: ["sql"],
  },
  {
    name: "aurora_shipments",
    schema: "main",
    kind: "table",
    columns: [
      { name: "order_id", type: "INTEGER" },
      { name: "ship_date", type: "DATE" },
      { name: "carrier", type: "VARCHAR" },
      { name: "status", type: "VARCHAR" },
    ],
    dialects: ["sql"],
  },
  {
    name: "aurora_events",
    schema: "main",
    kind: "table",
    columns: [
      { name: "event_id", type: "INTEGER" },
      { name: "order_id", type: "INTEGER" },
      { name: "event_ts", type: "TIMESTAMP" },
      { name: "event_type", type: "VARCHAR" },
    ],
    dialects: ["sql"],
  },
  {
    name: "aurora_support_tickets",
    schema: "main",
    kind: "table",
    columns: [
      { name: "ticket_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "opened_at", type: "DATE" },
      { name: "severity", type: "VARCHAR" },
      { name: "status", type: "VARCHAR" },
      { name: "reason", type: "VARCHAR" },
    ],
    dialects: ["sql"],
  },
  {
    name: "aurora_refunds",
    schema: "main",
    kind: "table",
    columns: [
      { name: "refund_id", type: "INTEGER" },
      { name: "order_id", type: "INTEGER" },
      { name: "refund_date", type: "DATE" },
      { name: "amount", type: "DECIMAL" },
      { name: "reason", type: "VARCHAR" },
    ],
    dialects: ["sql"],
  },
  {
    name: "aurora.orders",
    schema: "aurora",
    kind: "table",
    columns: AURORA_ORDER_COLS,
    dialects: ["sql"],
  },
  {
    name: "aurora.paid_orders",
    schema: "aurora",
    kind: "view",
    columns: AURORA_ORDER_COLS,
    dialects: ["sql"],
  },
  {
    name: "metrics.aurora_region_revenue",
    schema: "metrics",
    kind: "table",
    columns: [
      { name: "dim_region", type: "VARCHAR" },
      { name: "measure_paid_orders", type: "INTEGER" },
      { name: "measure_revenue", type: "DECIMAL" },
    ],
    dialects: ["sql"],
  },
  {
    name: "bronze_orders",
    schema: "main",
    kind: "table",
    columns: MEDALLION_ORDER_COLS,
    dialects: ["databricks"],
  },
  {
    name: "silver_orders",
    schema: "main",
    kind: "table",
    columns: MEDALLION_ORDER_COLS,
    dialects: ["databricks"],
  },
  {
    name: "gold_daily_orders",
    schema: "main",
    kind: "table",
    columns: GOLD_DAILY_COLS,
    dialects: ["databricks"],
  },
  {
    name: "workspace_objects",
    schema: "main",
    kind: "table",
    columns: [
      { name: "catalog", type: "VARCHAR" },
      { name: "schema", type: "VARCHAR" },
      { name: "table_name", type: "VARCHAR" },
      { name: "layer", type: "VARCHAR" },
    ],
    dialects: ["databricks"],
  },
  {
    name: "bronze.orders",
    schema: "bronze",
    kind: "table",
    columns: MEDALLION_ORDER_COLS,
    dialects: ["databricks"],
  },
  {
    name: "silver.orders",
    schema: "silver",
    kind: "table",
    columns: MEDALLION_ORDER_COLS,
    dialects: ["databricks"],
  },
  {
    name: "silver.ok_orders",
    schema: "silver",
    kind: "view",
    columns: MEDALLION_ORDER_COLS,
    dialects: ["databricks"],
  },
  {
    name: "gold.orders_daily",
    schema: "gold",
    kind: "table",
    columns: GOLD_DAILY_COLS,
    dialects: ["databricks"],
  },
  {
    name: "metrics.orders_daily",
    schema: "metrics",
    kind: "table",
    columns: METRIC_DAILY_COLS,
    dialects: ["databricks"],
  },
  {
    name: "dbx_notebook_cells",
    schema: "main",
    kind: "table",
    columns: [
      { name: "cell_id", type: "INTEGER" },
      { name: "notebook_path", type: "VARCHAR" },
      { name: "cell_type", type: "VARCHAR" },
      { name: "cell_name", type: "VARCHAR" },
      { name: "runs_in_job", type: "INTEGER" },
    ],
    dialects: ["databricks"],
  },
  {
    name: "dbx_job_params",
    schema: "main",
    kind: "table",
    columns: [
      { name: "job_name", type: "VARCHAR" },
      { name: "param_name", type: "VARCHAR" },
      { name: "param_value", type: "VARCHAR" },
    ],
    dialects: ["databricks"],
  },
  {
    name: "bronze_events",
    schema: "main",
    kind: "table",
    columns: [
      { name: "event_id", type: "INTEGER" },
      { name: "order_id", type: "INTEGER" },
      { name: "event_type", type: "VARCHAR" },
      { name: "event_ts", type: "TIMESTAMP" },
    ],
    dialects: ["databricks"],
  },
  {
    name: "silver_events",
    schema: "main",
    kind: "table",
    columns: [
      { name: "event_id", type: "INTEGER" },
      { name: "order_id", type: "INTEGER" },
      { name: "event_type", type: "VARCHAR" },
      { name: "event_ts", type: "TIMESTAMP" },
    ],
    dialects: ["databricks"],
  },
  {
    name: "gold_returns_daily",
    schema: "main",
    kind: "table",
    columns: [
      { name: "order_date", type: "DATE" },
      { name: "region", type: "VARCHAR" },
      { name: "returned_orders", type: "INTEGER" },
      { name: "returned_amount", type: "DECIMAL" },
    ],
    dialects: ["databricks"],
  },
  {
    name: "sf_orders",
    schema: "main",
    kind: "table",
    columns: SF_ORDER_COLS,
    dialects: ["snowflake"],
  },
  {
    name: "sf_customers",
    schema: "main",
    kind: "table",
    columns: SF_CUSTOMER_COLS,
    dialects: ["snowflake"],
  },
  {
    name: "sf_account_objects",
    schema: "main",
    kind: "table",
    columns: [
      { name: "database", type: "VARCHAR" },
      { name: "schema", type: "VARCHAR" },
      { name: "object_name", type: "VARCHAR" },
      { name: "object_type", type: "VARCHAR" },
    ],
    dialects: ["snowflake"],
  },
  {
    name: "sf_warehouses",
    schema: "main",
    kind: "table",
    columns: [
      { name: "name", type: "VARCHAR" },
      { name: "size", type: "VARCHAR" },
      { name: "auto_suspend_sec", type: "INTEGER" },
      { name: "status", type: "VARCHAR" },
    ],
    dialects: ["snowflake"],
  },
  {
    name: "sf_orders_history",
    schema: "main",
    kind: "table",
    columns: [
      { name: "order_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "order_date", type: "DATE" },
      { name: "amount", type: "DECIMAL" },
      { name: "as_of_version", type: "INTEGER" },
    ],
    dialects: ["snowflake"],
  },
  {
    name: "sf_copy_history",
    schema: "main",
    kind: "table",
    columns: [
      { name: "stage_path", type: "VARCHAR" },
      { name: "rows_loaded", type: "INTEGER" },
      { name: "status", type: "VARCHAR" },
      { name: "load_date", type: "DATE" },
    ],
    dialects: ["snowflake"],
  },
  {
    name: "sf_line_items",
    schema: "main",
    kind: "table",
    columns: [
      { name: "order_id", type: "INTEGER" },
      { name: "sku", type: "VARCHAR" },
      { name: "qty", type: "INTEGER" },
      { name: "unit_price", type: "DECIMAL" },
    ],
    dialects: ["snowflake"],
  },
  {
    name: "analytics.orders",
    schema: "analytics",
    kind: "table",
    columns: SF_ORDER_COLS,
    dialects: ["snowflake"],
  },
  {
    name: "analytics.paid_orders",
    schema: "analytics",
    kind: "view",
    columns: SF_ORDER_COLS,
    dialects: ["snowflake"],
  },
  {
    name: "metrics.sf_daily_revenue",
    schema: "metrics",
    kind: "table",
    columns: METRIC_DAILY_COLS,
    dialects: ["snowflake"],
  },
  {
    name: "lab_catalog_objects",
    schema: "main",
    kind: "table",
    columns: [
      { name: "catalog", type: "VARCHAR" },
      { name: "schema", type: "VARCHAR" },
      { name: "object_name", type: "VARCHAR" },
      { name: "object_type", type: "VARCHAR" },
    ],
    dialects: ["sql", "databricks", "snowflake"],
  },
];

export function dialectForTrack(track: string): LabDialect | null {
  if (track === "sql" || track === "databricks" || track === "snowflake") return track;
  return null;
}

export function schemaForTrack(track: string): LabSchemaTable[] {
  const dialect = dialectForTrack(track);
  if (!dialect) return [];
  return LAB_SEED_SCHEMA.filter((table) => table.dialects.includes(dialect));
}

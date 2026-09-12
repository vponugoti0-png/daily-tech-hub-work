/**
 * Same-origin DuckDB fixtures for the local practice lab.
 * Tiny in-module seed (not a remote catalog, not a /public scrape).
 *
 * Existing unqualified tables in `main` stay put so SQL / DBX / SF labs
 * do not regress. Phase 3 adds schemas, views, a catalog inventory, and
 * metric-view–style tables. Extra in-memory catalogs are optional.
 */

export function seedStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Always-applied seed: main tables + local schemas / views / metric-style tables. */
export const LAB_SEED_SQL = `
CREATE OR REPLACE TABLE workspace_objects AS
SELECT * FROM (VALUES
  ('main', 'bronze', 'orders_raw', 'bronze'),
  ('main', 'silver', 'orders', 'silver'),
  ('main', 'gold', 'orders_daily', 'gold'),
  ('main', 'gold', 'revenue_by_region', 'gold'),
  ('main', 'bronze', 'events_raw', 'bronze'),
  ('main', 'silver', 'events', 'silver'),
  ('main', 'gold', 'returns_daily', 'gold'),
  ('memory', 'bronze', 'orders', 'bronze'),
  ('memory', 'bronze', 'events', 'bronze'),
  ('memory', 'silver', 'orders', 'silver'),
  ('memory', 'silver', 'ok_orders', 'silver_view'),
  ('memory', 'silver', 'events', 'silver'),
  ('memory', 'gold', 'orders_daily', 'gold'),
  ('memory', 'gold', 'daily_revenue', 'gold_view'),
  ('memory', 'gold', 'returns_daily', 'gold'),
  ('memory', 'metrics', 'orders_daily', 'metric_view')
) AS t(catalog, schema, table_name, layer);

CREATE OR REPLACE TABLE bronze_orders AS
SELECT * FROM (VALUES
  (1, DATE '2026-09-01', 'west', 'ok', 12.50),
  (2, DATE '2026-09-01', 'east', 'ok', 40.00),
  (3, DATE '2026-09-02', 'west', 'corrupt', NULL),
  (4, DATE '2026-09-02', 'east', 'ok', 18.25),
  (5, DATE '2026-09-03', 'west', 'ok', 99.00),
  (6, DATE '2026-09-03', 'east', 'returned', 15.00),
  (7, DATE '2026-09-04', 'north', 'ok', 31.00),
  (8, DATE '2026-09-04', 'west', 'ok', 8.75),
  (9, DATE '2026-09-05', 'east', 'ok', 55.40),
  (10, DATE '2026-09-05', 'north', 'returned', 20.00),
  (11, DATE '2026-09-06', 'latam', 'ok', 14.10),
  (12, DATE '2026-09-06', 'west', 'corrupt', NULL),
  (13, DATE '2026-09-07', 'east', 'ok', 72.00),
  (14, DATE '2026-09-08', 'north', 'ok', 19.95)
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
  ('analytics', 'raw', 'line_items', 'table'),
  ('sandbox', 'public', 'scratch', 'table'),
  ('memory', 'analytics', 'orders', 'table'),
  ('memory', 'analytics', 'paid_orders', 'view'),
  ('memory', 'analytics', 'line_items', 'table'),
  ('memory', 'metrics', 'sf_daily_revenue', 'metric_view')
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
  (3, 'west', 'churned'),
  (4, 'north', 'active'),
  (5, 'latam', 'active')
) AS t(customer_id, region, status);

CREATE OR REPLACE TABLE sf_orders AS
SELECT * FROM (VALUES
  (101, 1, DATE '2026-09-01', 12.50, 2, 'paid', 'FALL26'),
  (102, 2, DATE '2026-09-01', 40.00, 2, 'paid', NULL),
  (103, 1, DATE '2026-09-02', 18.25, 2, 'pending', 'FALL26'),
  (104, 2, DATE '2026-09-03', 99.00, 2, 'paid', 'VIP'),
  (105, 4, DATE '2026-09-04', 31.00, 1, 'paid', 'FLASH'),
  (106, 5, DATE '2026-09-05', 14.10, 1, 'pending', NULL),
  (107, 2, DATE '2026-09-06', 55.40, 1, 'paid', 'FALL26'),
  (108, 1, DATE '2026-09-07', 8.75, 1, 'returned', 'WIN25')
) AS t(order_id, customer_id, order_date, amount, as_of_version, status, promo_code);

CREATE OR REPLACE TABLE sf_orders_history AS
SELECT * FROM (VALUES
  (101, 1, DATE '2026-09-01', 10.00, 1),
  (101, 1, DATE '2026-09-01', 12.50, 2),
  (102, 2, DATE '2026-09-01', 40.00, 1),
  (102, 2, DATE '2026-09-01', 40.00, 2),
  (104, 2, DATE '2026-09-03', 90.00, 1),
  (104, 2, DATE '2026-09-03', 99.00, 2)
) AS t(order_id, customer_id, order_date, amount, as_of_version);

CREATE OR REPLACE TABLE sf_line_items AS
SELECT * FROM (VALUES
  (101, 'SKU-LANE', 1, 12.50),
  (102, 'SKU-HUB', 2, 20.00),
  (103, 'SKU-CORE', 1, 18.25),
  (104, 'SKU-HUB', 1, 40.00),
  (104, 'SKU-LANE', 1, 59.00),
  (105, 'SKU-DOCK', 1, 31.00),
  (106, 'SKU-LANE', 1, 14.10),
  (107, 'SKU-CORE', 1, 55.40),
  (108, 'SKU-NOTE', 1, 8.75)
) AS t(order_id, sku, qty, unit_price);

CREATE OR REPLACE TABLE aurora_customers AS
SELECT * FROM (VALUES
  (1, 'west', 'active', 'ada@aurora.dev', DATE '2026-01-04'),
  (2, 'east', 'active', NULL, DATE '2026-02-11'),
  (3, 'west', 'churned', 'kai@aurora.dev', DATE '2025-11-20'),
  (4, 'latam', 'active', 'luz@aurora.dev', DATE '2026-03-01'),
  (5, 'north', 'active', 'rio@aurora.dev', DATE '2026-04-15'),
  (6, 'emea', 'active', NULL, DATE '2026-05-02')
) AS t(customer_id, region, status, email, signup_date);

CREATE OR REPLACE TABLE aurora_orders AS
SELECT * FROM (VALUES
  (1001, 1, DATE '2026-09-01', 'paid', 42.50, 'FALL26'),
  (1002, 2, DATE '2026-09-01', 'paid', 18.00, NULL),
  (1003, 1, DATE '2026-09-02', 'pending', 99.00, 'FALL26'),
  (1004, 3, DATE '2026-09-02', 'cancelled', 12.00, 'WIN25'),
  (1005, 2, DATE '2026-09-03', 'paid', 64.25, 'VIP'),
  (1006, 4, DATE '2026-09-04', 'returned', 22.00, NULL),
  (1007, 1, DATE '2026-09-10', 'paid', 7.50, 'FLASH'),
  (1008, 5, DATE '2026-09-05', 'paid', 31.00, 'FLASH'),
  (1009, 6, DATE '2026-09-05', 'pending', 48.00, NULL),
  (1010, 2, DATE '2026-09-06', 'paid', 15.75, 'FALL26'),
  (1011, 4, DATE '2026-09-07', 'paid', 88.00, 'VIP'),
  (1012, 5, DATE '2026-09-08', 'returned', 31.00, 'FLASH'),
  (1013, 1, DATE '2026-09-09', 'cancelled', 9.00, NULL),
  (1014, 6, DATE '2026-09-10', 'paid', 27.40, 'EMEA26')
) AS t(order_id, customer_id, order_date, status, amount, promo_code);

CREATE OR REPLACE TABLE aurora_order_items AS
SELECT * FROM (VALUES
  (1001, 'SKU-LANE', 2, 12.50),
  (1001, 'SKU-HUB', 1, 17.50),
  (1002, 'SKU-LANE', 1, 18.00),
  (1003, 'SKU-CORE', 1, 99.00),
  (1005, 'SKU-HUB', 1, 40.00),
  (1005, 'SKU-LANE', 1, 24.25),
  (1006, 'SKU-LANE', 2, 11.00),
  (1007, 'SKU-HUB', 1, 7.50),
  (1008, 'SKU-DOCK', 1, 31.00),
  (1009, 'SKU-CORE', 1, 48.00),
  (1010, 'SKU-NOTE', 3, 5.25),
  (1011, 'SKU-HUB', 1, 40.00),
  (1011, 'SKU-LANE', 2, 24.00),
  (1012, 'SKU-DOCK', 1, 31.00),
  (1014, 'SKU-LANE', 1, 27.40)
) AS t(order_id, sku, qty, unit_price);

CREATE OR REPLACE TABLE aurora_products AS
SELECT * FROM (VALUES
  ('SKU-LANE', 'compute', 'Aurora Lane'),
  ('SKU-HUB', 'platform', 'Aurora Hub'),
  ('SKU-CORE', 'compute', 'Aurora Core'),
  ('SKU-DOCK', 'accessories', 'Aurora Dock'),
  ('SKU-NOTE', 'docs', 'Aurora Notebook')
) AS t(sku, category, product_name);

CREATE OR REPLACE TABLE aurora_shipments AS
SELECT * FROM (VALUES
  (1001, DATE '2026-09-02', 'lane-express', 'delivered'),
  (1002, DATE '2026-09-02', 'hub-ground', 'delivered'),
  (1005, DATE '2026-09-04', 'lane-express', 'in_transit'),
  (1006, DATE '2026-09-05', 'hub-ground', 'returned'),
  (1008, DATE '2026-09-06', 'north-air', 'delivered'),
  (1011, DATE '2026-09-08', 'latam-ocean', 'in_transit'),
  (1014, DATE '2026-09-11', 'emea-rail', 'delivered')
) AS t(order_id, shipped_date, carrier, status);

CREATE OR REPLACE TABLE aurora_refunds AS
SELECT * FROM (VALUES
  (9001, 1006, DATE '2026-09-06', 22.00, 'changed_mind'),
  (9002, 1012, DATE '2026-09-09', 31.00, 'damaged'),
  (9003, 1004, DATE '2026-09-03', 12.00, 'cancelled_before_ship')
) AS t(refund_id, order_id, refund_date, amount, reason);

CREATE OR REPLACE TABLE bronze_events AS
SELECT * FROM (VALUES
  (1, 1, 'landed', TIMESTAMP '2026-09-01 08:01:00'),
  (2, 1, 'validated', TIMESTAMP '2026-09-01 08:02:00'),
  (3, 2, 'landed', TIMESTAMP '2026-09-01 08:04:00'),
  (4, 3, 'corrupt', TIMESTAMP '2026-09-02 09:10:00'),
  (5, 5, 'landed', TIMESTAMP '2026-09-03 07:40:00'),
  (6, 5, 'validated', TIMESTAMP '2026-09-03 07:41:00'),
  (7, 7, 'landed', TIMESTAMP '2026-09-04 11:02:00'),
  (8, 12, 'corrupt', TIMESTAMP '2026-09-06 12:00:00'),
  (9, 13, 'landed', TIMESTAMP '2026-09-07 06:15:00'),
  (10, 14, 'validated', TIMESTAMP '2026-09-08 16:22:00')
) AS t(event_id, order_id, event_type, event_ts);

CREATE OR REPLACE TABLE silver_events AS
SELECT event_id, order_id, event_type, event_ts
FROM bronze_events
WHERE event_type <> 'corrupt';

CREATE SCHEMA IF NOT EXISTS bronze;
CREATE SCHEMA IF NOT EXISTS silver;
CREATE SCHEMA IF NOT EXISTS gold;
CREATE SCHEMA IF NOT EXISTS metrics;
CREATE SCHEMA IF NOT EXISTS aurora;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE TABLE gold_returns_daily AS
SELECT
  order_date,
  region,
  COUNT(*) AS returned_orders,
  ROUND(SUM(amount), 2) AS returned_amount
FROM silver_orders
WHERE status = 'returned'
GROUP BY order_date, region;

CREATE OR REPLACE TABLE bronze.orders AS SELECT * FROM bronze_orders;
CREATE OR REPLACE TABLE bronze.events AS SELECT * FROM bronze_events;
CREATE OR REPLACE TABLE silver.orders AS SELECT * FROM silver_orders;
CREATE OR REPLACE TABLE silver.events AS SELECT * FROM silver_events;
CREATE OR REPLACE TABLE gold.orders_daily AS SELECT * FROM gold_daily_orders;
CREATE OR REPLACE TABLE gold.returns_daily AS SELECT * FROM gold_returns_daily;

CREATE OR REPLACE TABLE aurora.customers AS SELECT * FROM aurora_customers;
CREATE OR REPLACE TABLE aurora.orders AS SELECT * FROM aurora_orders;
CREATE OR REPLACE TABLE aurora.order_items AS SELECT * FROM aurora_order_items;
CREATE OR REPLACE TABLE aurora.products AS SELECT * FROM aurora_products;
CREATE OR REPLACE TABLE aurora.shipments AS SELECT * FROM aurora_shipments;
CREATE OR REPLACE TABLE aurora.refunds AS SELECT * FROM aurora_refunds;

CREATE OR REPLACE TABLE analytics.customers AS SELECT * FROM sf_customers;
CREATE OR REPLACE TABLE analytics.orders AS SELECT * FROM sf_orders;
CREATE OR REPLACE TABLE analytics.line_items AS SELECT * FROM sf_line_items;

CREATE OR REPLACE VIEW silver.ok_orders AS
SELECT order_id, order_date, region, status, amount
FROM silver.orders
WHERE status = 'ok';

CREATE OR REPLACE VIEW gold.daily_revenue AS
SELECT order_date, region, orders, revenue
FROM gold.orders_daily;

CREATE OR REPLACE VIEW aurora.paid_orders AS
SELECT order_id, customer_id, order_date, status, amount, promo_code
FROM aurora.orders
WHERE status = 'paid';

CREATE OR REPLACE VIEW analytics.paid_orders AS
SELECT order_id, customer_id, order_date, amount, as_of_version, status, promo_code
FROM analytics.orders
WHERE status = 'paid';

CREATE OR REPLACE VIEW aurora.open_shipments AS
SELECT order_id, shipped_date, carrier, status
FROM aurora.shipments
WHERE status <> 'delivered';

CREATE OR REPLACE VIEW silver.validated_events AS
SELECT event_id, order_id, event_type, event_ts
FROM silver.events
WHERE event_type = 'validated';

CREATE OR REPLACE TABLE metrics.orders_daily AS
SELECT
  CAST(order_date AS VARCHAR) AS dim_order_date,
  region AS dim_region,
  COUNT(*) AS measure_order_count,
  ROUND(SUM(amount), 2) AS measure_revenue
FROM silver.orders
GROUP BY order_date, region;

CREATE OR REPLACE TABLE metrics.aurora_region_revenue AS
SELECT
  c.region AS dim_region,
  COUNT(*) AS measure_paid_orders,
  ROUND(SUM(o.amount), 2) AS measure_revenue
FROM aurora.orders o
JOIN aurora.customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.region;

CREATE OR REPLACE TABLE metrics.sf_daily_revenue AS
SELECT
  CAST(o.order_date AS VARCHAR) AS dim_order_date,
  c.region AS dim_region,
  COUNT(*) AS measure_order_count,
  ROUND(SUM(o.amount), 2) AS measure_revenue
FROM analytics.orders o
JOIN analytics.customers c ON c.customer_id = o.customer_id
GROUP BY o.order_date, c.region;

CREATE OR REPLACE TABLE metrics.returns_daily AS
SELECT
  CAST(order_date AS VARCHAR) AS dim_order_date,
  region AS dim_region,
  returned_orders AS measure_return_count,
  returned_amount AS measure_returned_amount
FROM gold.returns_daily;

CREATE OR REPLACE TABLE lab_catalog_objects AS
SELECT * FROM (VALUES
  ('memory', 'main', 'bronze_orders', 'table'),
  ('memory', 'main', 'silver_orders', 'table'),
  ('memory', 'main', 'gold_daily_orders', 'table'),
  ('memory', 'main', 'bronze_events', 'table'),
  ('memory', 'main', 'silver_events', 'table'),
  ('memory', 'main', 'aurora_shipments', 'table'),
  ('memory', 'main', 'aurora_refunds', 'table'),
  ('memory', 'bronze', 'orders', 'table'),
  ('memory', 'bronze', 'events', 'table'),
  ('memory', 'silver', 'orders', 'table'),
  ('memory', 'silver', 'ok_orders', 'view'),
  ('memory', 'silver', 'events', 'table'),
  ('memory', 'silver', 'validated_events', 'view'),
  ('memory', 'gold', 'orders_daily', 'table'),
  ('memory', 'gold', 'daily_revenue', 'view'),
  ('memory', 'gold', 'returns_daily', 'table'),
  ('memory', 'metrics', 'orders_daily', 'metric_view'),
  ('memory', 'metrics', 'returns_daily', 'metric_view'),
  ('memory', 'aurora', 'orders', 'table'),
  ('memory', 'aurora', 'paid_orders', 'view'),
  ('memory', 'aurora', 'shipments', 'table'),
  ('memory', 'aurora', 'refunds', 'table'),
  ('memory', 'aurora', 'open_shipments', 'view'),
  ('memory', 'metrics', 'aurora_region_revenue', 'metric_view'),
  ('memory', 'analytics', 'orders', 'table'),
  ('memory', 'analytics', 'paid_orders', 'view'),
  ('memory', 'analytics', 'line_items', 'table'),
  ('memory', 'metrics', 'sf_daily_revenue', 'metric_view')
) AS t(catalog, schema, object_name, object_type);
`;

/**
 * Extra in-memory catalogs (same-origin ATTACH ':memory:' only).
 * Applied after the core seed; skipped if the engine rejects ATTACH.
 * User SQL still cannot ATTACH (sql-guard) — no remote catalogs.
 */
export const LAB_OPTIONAL_CATALOG_SQL = `
ATTACH ':memory:' AS unity;
ATTACH ':memory:' AS warehouse;

CREATE SCHEMA IF NOT EXISTS unity.bronze;
CREATE SCHEMA IF NOT EXISTS unity.silver;
CREATE SCHEMA IF NOT EXISTS unity.gold;
CREATE SCHEMA IF NOT EXISTS unity.metrics;
CREATE SCHEMA IF NOT EXISTS warehouse.analytics;
CREATE SCHEMA IF NOT EXISTS warehouse.metrics;

CREATE OR REPLACE TABLE unity.bronze.orders AS SELECT * FROM bronze_orders;
CREATE OR REPLACE TABLE unity.bronze.events AS SELECT * FROM bronze_events;
CREATE OR REPLACE TABLE unity.silver.orders AS SELECT * FROM silver_orders;
CREATE OR REPLACE TABLE unity.silver.events AS SELECT * FROM silver_events;
CREATE OR REPLACE TABLE unity.gold.orders_daily AS SELECT * FROM gold_daily_orders;
CREATE OR REPLACE TABLE unity.gold.returns_daily AS SELECT * FROM gold_returns_daily;
CREATE OR REPLACE VIEW unity.silver.ok_orders AS
SELECT * FROM unity.silver.orders WHERE status = 'ok';
CREATE OR REPLACE TABLE unity.metrics.orders_daily AS SELECT * FROM metrics.orders_daily;
CREATE OR REPLACE TABLE unity.metrics.returns_daily AS SELECT * FROM metrics.returns_daily;

CREATE OR REPLACE TABLE warehouse.analytics.orders AS SELECT * FROM sf_orders;
CREATE OR REPLACE TABLE warehouse.analytics.line_items AS SELECT * FROM sf_line_items;
CREATE OR REPLACE VIEW warehouse.analytics.paid_orders AS
SELECT * FROM warehouse.analytics.orders WHERE status = 'paid';
CREATE OR REPLACE TABLE warehouse.metrics.sf_daily_revenue AS SELECT * FROM metrics.sf_daily_revenue;
`;

import { expect, test } from "@playwright/test";

const SQL_CATALOG = "/training/sql/sql-catalog-views-metrics";
const DBX_CATALOG = "/training/databricks/dbx-catalog-views-metrics";
const SF_CATALOG = "/training/snowflake/sf-catalog-views-metrics";
const UC = "/training/databricks/dbx-unity-catalog";
const SELECT = "/training/sql/sql-select-filter-nulls";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Phase 3 richer lab datasets", () => {
  test("SQL catalog lesson: samples load, run → result, guest progress unchanged", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto(`${SQL_CATALOG}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/lab_catalog_objects|metric-view/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(
      table.getByRole("columnheader", { name: /catalog|schema|object_name|object_type/i }).first(),
    ).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["sql:sql-catalog-views-metrics"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);
  });

  test("Databricks catalog lesson runs a view / metric sample", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${DBX_CATALOG}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/lab_catalog_objects|silver.ok_orders|metrics.orders_daily/i).first()).toBeVisible();

    const select = lab.getByLabel("SQL sample");
    await select.selectOption("dbx-metric-view");
    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(
      table.getByRole("columnheader", { name: /dim_order_date|dim_region|measure_revenue/i }).first(),
    ).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
  });

  test("Snowflake catalog lesson runs; Unity Catalog lesson hosts the lab", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SF_CATALOG}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/lab_catalog_objects|analytics.paid_orders|sf_daily_revenue/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();

    await page.goto(`${UC}#lab`);
    await expect(page.locator("#learn")).toHaveText(/Unity Catalog/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("existing SQL SELECT lab still runs aurora_orders (no regression)", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/aurora_orders/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();
  });

  test("Python track stays copy-only — no runtime lab", async ({ page }) => {
    await page.goto("/training/python/python-none-dicts-rows");
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Open local practice lab/i })).toHaveCount(0);
    await expect(page.getByText(/Coming soon · live Run/i).first()).toBeVisible();
  });

  test("search indexes catalog/metrics lessons; no Lab nav", async ({ page }) => {
    await page.goto("/search?q=metric-style+tables");
    await expect(page.getByRole("link", { name: /Catalogs, schemas, views, and metric-style tables/i })).toBeVisible();

    await page.goto("/search?q=Metric+View+stand-in");
    await expect(page.getByRole("link", { name: /Catalogs, views, and metric views \(local\)/i })).toBeVisible();

    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
  });
});

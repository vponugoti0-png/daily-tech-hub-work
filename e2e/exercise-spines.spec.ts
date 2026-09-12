import { expect, test } from "@playwright/test";

const DBX_SELECT = "/training/databricks/dbx-spark-select-nulls";
const DBX_GOLD = "/training/databricks/dbx-gold-aggregates";
const SF_SELECT = "/training/snowflake/sf-select-filter-nulls";
const SF_AGG = "/training/snowflake/sf-aggregates-group-having";
const PY_NONE = "/training/python/python-none-dicts-rows";
const PY_LOG = "/training/python/python-logging-not-print";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Sibling exercise spines (DBX + SF + Python)", () => {
  test("training → Databricks track → Spark SQL SELECT lesson + TryIt lab", async ({ page }) => {
    await page.goto("/training");
    await expect(page.getByRole("heading", { name: "Interactive course tracks" })).toBeVisible();
    await page.locator('a.panel[href="/training/databricks"]').click();

    await expect(page).toHaveURL(/\/training\/databricks\/?$/);
    await expect(page.getByRole("heading", { name: "Databricks (DBX)" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Spark SQL SELECT, NULLs, and LIMIT/i })).toBeVisible();

    await page.locator('a[href="/training/databricks/dbx-spark-select-nulls"]').first().click();
    await expect(page).toHaveURL(/\/training\/databricks\/dbx-spark-select-nulls/);
    await expect(page.locator("#learn")).toHaveText(/Spark SQL SELECT, NULLs, and LIMIT/i);
    const tryItLab = page.getByRole("link", { name: /Open local practice lab/i }).first();
    await expect(tryItLab).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    const how = page.getByRole("link", { name: /How to practice/i }).first();
    await expect(how).toHaveAttribute("href", "#lab");
    await tryItLab.click();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
  });

  test("Databricks SELECT lab runs a sample and does not complete the lesson", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${DBX_SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/silver_orders|bronze_orders/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["databricks:dbx-spark-select-nulls"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);
  });

  test("Databricks gold aggregates hosts the lab; reading is not gated", async ({ page }) => {
    await page.goto(DBX_GOLD);
    await expect(page.locator("#learn")).toHaveText(/Gold aggregates/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("training → Snowflake track → SAMPLE SELECT lesson + TryIt lab", async ({ page }) => {
    await page.goto("/training");
    await page.locator('a.panel[href="/training/snowflake"]').click();

    await expect(page).toHaveURL(/\/training\/snowflake\/?$/);
    await expect(page.getByRole("heading", { name: "Snowflake", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /SELECT, filters, NULLs on SAMPLE/i })).toBeVisible();

    await page.locator('a[href="/training/snowflake/sf-select-filter-nulls"]').first().click();
    await expect(page).toHaveURL(/\/training\/snowflake\/sf-select-filter-nulls/);
    await expect(page.locator("#learn")).toHaveText(/SELECT, filters, NULLs on SAMPLE/i);
    const tryItLab = page.getByRole("link", { name: /Open local practice lab/i }).first();
    await expect(tryItLab).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /How to practice/i }).first()).toHaveAttribute(
      "href",
      "#lab",
    );
    await tryItLab.click();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
  });

  test("Snowflake SELECT lab runs a sample; aggregates also hosts lab", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SF_SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/sf_orders|promo_code/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();

    await page.goto(SF_AGG);
    await expect(page.locator("#learn")).toHaveText(/Aggregates, GROUP BY, HAVING for marts/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("Python exercise-path is copy-only — no #lab on new or existing lessons", async ({ page }) => {
    await page.goto("/training/python");
    await expect(page.getByRole("heading", { name: "Python for Data Engineers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /None, dicts, and pipeline rows/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Practice · local lab/i })).toHaveCount(0);

    await page.locator('a[href="/training/python/python-none-dicts-rows"]').first().click();
    await expect(page).toHaveURL(/\/training\/python\/python-none-dicts-rows/);
    await expect(page.locator("#learn")).toHaveText(/None, dicts, and pipeline rows/i);
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Open local practice lab/i })).toHaveCount(0);
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    const tryit = page.locator(".tryit").first();
    const copy = tryit.getByRole("button", { name: /Copy to practice/i });
    await expect(copy).toBeVisible();
    await copy.click();
    await tryit.getByRole("button", { name: /How to practice/i }).click();
    await expect(tryit.getByText(/Copy this example and run it/i)).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();

    await page.goto(PY_LOG);
    await expect(page.locator("#learn")).toHaveText(/logging — not print/i);
    await expect(page.locator("#lab")).toHaveCount(0);

    await page.goto("/training/python/python-dataframe-contracts");
    await expect(page.locator("#lab")).toHaveCount(0);
  });

  test("does not add a top-level Lab or ETL nav item", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Training" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: /^ETL$/i })).toHaveCount(0);
  });

  test("search indexes sibling exercise-path lessons", async ({ page }) => {
    await page.goto("/search?q=leftover+bronze+keys");
    await expect(page.getByRole("link", { name: /Semi-joins — leftover bronze keys/i })).toBeVisible();

    await page.goto("/search?q=nulls+on+sample");
    await expect(page.getByRole("link", { name: /SELECT, filters, NULLs on SAMPLE/i })).toBeVisible();

    await page.goto("/search?q=pathlib+extracts");
    await expect(page.getByRole("link", { name: /pathlib extracts/i })).toBeVisible();
  });
});

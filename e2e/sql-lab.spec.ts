import { expect, test } from "@playwright/test";
import { expectCleanLabCells } from "./lab-result";

const TRACK = "/training/sql";
const SELECT = "/training/sql/sql-select-filter-nulls";
const AGG = "/training/sql/sql-aggregates-group-having";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("SQL local practice lab + exercise path", () => {
  test("track Practice CTA opens the SELECT local lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · local lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/sql\/sql-select-filter-nulls#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByText(/Not a live warehouse/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /How to practice/i }).first()).toHaveAttribute(
      "href",
      "#lab",
    );
  });

  test("open lab → run sample → see result → guest progress persists", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.locator(".tryit").first().getByRole("link", { name: /How to practice/i })).toBeVisible();
    await expect(page.getByText(/aurora_orders/i).first()).toBeVisible();
    await expect(page.getByText(/aurora_lane/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(
      table.getByRole("columnheader", { name: /order_id|region|status|amount|promo_code/i }).first(),
    ).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expectCleanLabCells(table, ["64.25", "VIP", "paid"]);

    await lab.getByLabel("SQL to run").fill(
      "SELECT unit_price AS amount, sku FROM aurora_order_items WHERE sku = 'SKU-LANE' AND qty = 2 LIMIT 1",
    );
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expectCleanLabCells(table, ["12.50", "SKU-LANE"]);

    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["sql:sql-select-filter-nulls"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
    const storedAgain = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(storedAgain).toContain("sql-select-filter-nulls");
  });

  test("aggregates lesson also hosts the lab; reading is not gated", async ({ page }) => {
    await page.goto(AGG);

    await expect(page.locator("#learn")).toHaveText(/Aggregates, GROUP BY, and HAVING/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("training → SQL track → new SELECT lesson", async ({ page }) => {
    await page.goto("/training");
    await expect(page.getByRole("heading", { name: "Interactive course tracks" })).toBeVisible();
    await page.locator('a.panel[href="/training/sql"]').click();

    await expect(page).toHaveURL(/\/training\/sql\/?$/);
    await expect(page.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /SELECT, filters, NULLs, and LIMIT/i })).toBeVisible();

    await page.locator('a[href="/training/sql/sql-select-filter-nulls"]').first().click();
    await expect(page).toHaveURL(/\/training\/sql\/sql-select-filter-nulls/);
    await expect(page.locator("#learn")).toHaveText(/SELECT, filters, NULLs, and LIMIT/i);
    const tryItRun = page.getByRole("button", { name: /Run in local lab/i }).first();
    await expect(tryItRun).toBeVisible();
    const how = page.getByRole("link", { name: /How to practice/i }).first();
    await expect(how).toHaveAttribute("href", "#lab");
    await how.click();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await tryItRun.click();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
  });

  test("does not add a top-level Lab nav; older Python lessons stay copy-only", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);

    await page.goto("/training/python/python-dataframe-contracts");
    await expect(page.locator("#lab")).toHaveCount(0);
    const tryit = page.locator(".tryit").first();
    await expect(tryit).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(tryit.getByRole("button", { name: /Run in local lab/i })).toHaveCount(0);
    await expect(tryit.getByRole("button", { name: /Run SQL sample|Run sample/i })).toHaveCount(0);
    const copy = tryit.getByRole("button", { name: /Copy to practice/i });
    await expect(copy).toBeVisible();
    await copy.click();
    await tryit.getByRole("button", { name: /How to practice/i }).click();
    await expect(tryit.getByText(/Copy this example and run it/i)).toBeVisible();
  });
});

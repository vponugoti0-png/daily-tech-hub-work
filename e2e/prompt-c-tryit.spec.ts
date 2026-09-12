import { expect, test } from "@playwright/test";
import { expectCleanLabCells } from "./lab-result";

const SQL_SELECT = "/training/sql/sql-select-filter-nulls";
const PRACTICE = "/practice";

test.describe("Phase 1 Prompt C — unified Tryit editor shell", () => {
  test("/practice defaults to sql-select-filter-nulls with dialect tabs", async ({ page }) => {
    await page.goto(PRACTICE);

    await expect(page.getByRole("heading", { name: "Your practice desk" })).toBeVisible();
    await expect(page.getByTestId("practice-open-lab")).toHaveAttribute(
      "href",
      `${SQL_SELECT}#lab`,
    );

    const tabs = page.getByTestId("practice-dialect-tabs");
    await expect(tabs.getByRole("link")).toHaveCount(4);
    await expect(tabs.getByRole("link", { name: "sql", exact: true })).toHaveAttribute(
      "href",
      "/practice",
    );
    await expect(tabs.getByRole("link", { name: "sql-dbx", exact: true })).toHaveAttribute(
      "href",
      "/practice?dialect=sql-dbx",
    );
    await expect(tabs.getByRole("link", { name: "sql-sf", exact: true })).toHaveAttribute(
      "href",
      "/practice?dialect=sql-sf",
    );
    await expect(tabs.getByRole("link", { name: "python", exact: true })).toHaveAttribute(
      "href",
      "/practice?dialect=python",
    );

    const lab = page.locator("#lab");
    await expect(lab).toHaveAttribute("data-testid", "unified-tryit");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByLabel("SQL to run")).toHaveValue(/aurora_orders/i);
    await expect(lab.getByRole("heading", { name: "Your database" })).toBeVisible();
    await expect(lab.getByText(/local DuckDB seed, not a warehouse/i).first()).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.getByText(/Alfreds Futterkiste|Customers 101/i)).toHaveCount(0);
  });

  test("/practice Run → table, empty before run, Restore, Reset, Next/Prev", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto(PRACTICE);

    const lab = page.locator("#lab");
    const editor = lab.getByLabel("SQL to run");
    const empty = lab.getByTestId("lab-empty");
    const table = lab.getByRole("table", { name: "Query result" });

    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/Press Run to query the sample DB/i);
    await expect(table).toHaveCount(0);
    await expect(lab.getByRole("button", { name: "Run SQL sample" })).toHaveCSS("min-height", "44px");

    const seed = await editor.inputValue();
    expect(seed).toMatch(/LIMIT 5/i);

    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expectCleanLabCells(table, ["64.25", "VIP", "paid"]);
    await expect(empty).toHaveCount(0);

    await editor.fill("SELECT 1 AS n");
    await lab.getByRole("button", { name: "Reset statement" }).click();
    await expect(editor).toHaveValue(seed);

    await lab.getByRole("button", { name: "Restore sample database" }).click();
    await expect(lab.getByText("Sample database restored.")).toBeVisible({ timeout: 45_000 });
    await expect(empty).toBeVisible();
    await expect(table).toHaveCount(0);
    await expect(editor).toHaveValue(seed);

    await lab.getByRole("button", { name: "Next sample" }).click();
    await expect(editor).not.toHaveValue(seed);
    await expect(empty).toBeVisible();
    await lab.getByRole("button", { name: "Previous sample" }).click();
    await expect(editor).toHaveValue(seed);
  });

  test("/practice dialect tabs switch the same shell", async ({ page }) => {
    await page.goto(PRACTICE);

    await page.getByTestId("practice-dialect-tabs").getByRole("link", { name: "sql-dbx", exact: true }).click();
    await expect(page).toHaveURL(/dialect=sql-dbx/);
    const dbx = page.locator("#lab");
    await expect(dbx).toHaveAttribute("data-testid", "unified-tryit");
    await expect(dbx.getByRole("heading", { name: "Your database" })).toBeVisible();
    await expect(dbx.getByTestId("lab-schema-table-bronze_orders")).toBeVisible();
    await expect(dbx.getByTestId("lab-empty")).toBeVisible();

    await page.getByTestId("practice-dialect-tabs").getByRole("link", { name: "python", exact: true }).click();
    await expect(page).toHaveURL(/dialect=python/);
    const py = page.locator("#lab");
    await expect(py).toHaveAttribute("data-testid", "unified-tryit");
    await expect(py.getByLabel("Python to run")).toBeVisible();
    await expect(py.getByRole("heading", { name: "Your database" })).toHaveCount(0);
    await expect(py.getByTestId("lab-empty")).toContainText(/Press Run to execute the sample/i);
  });

  test("lesson #lab is the same shell: left lesson / right editor, no auto-run", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(SQL_SELECT);

    const shell = page.getByTestId("lesson-tryit-shell");
    await expect(shell).toBeVisible();
    const lab = page.locator("#lab");
    await expect(lab).toHaveAttribute("data-testid", "unified-tryit");
    await expect(lab.getByRole("heading", { name: "Your database" })).toBeVisible();
    await expect(lab.getByTestId("lab-empty")).toBeVisible();
    await expect(lab.getByRole("table", { name: "Query result" })).toHaveCount(0);

    const learn = page.locator("#learn");
    const learnBox = await learn.boundingBox();
    const labBox = await lab.boundingBox();
    expect(learnBox && labBox).toBeTruthy();
    expect(labBox!.x).toBeGreaterThan(learnBox!.x + learnBox!.width * 0.4);

    await page.getByRole("button", { name: /Run in local lab/i }).first().click();
    await expect(lab.getByLabel("SQL to run")).toHaveValue(/LIMIT 5/i);
    await expect(lab.getByTestId("lab-empty")).toBeVisible();
    await expect(lab.getByRole("table", { name: "Query result" })).toHaveCount(0);
    await expect(lab.locator("textarea")).toHaveCount(1);
    await expect(page.locator("#example").locator("textarea")).toHaveCount(0);
  });

  test("mobile stacks lesson above the editor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SQL_SELECT);

    const learnBox = await page.locator("#learn").boundingBox();
    const labBox = await page.locator("#lab").boundingBox();
    expect(learnBox && labBox).toBeTruthy();
    expect(labBox!.y).toBeGreaterThan(learnBox!.y);
  });
});

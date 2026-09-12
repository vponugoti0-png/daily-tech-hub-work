import { expect, test, type Page } from "@playwright/test";

const SQL = "/training/sql/sql-select-filter-nulls";
const DBX = "/training/databricks/dbx-workspace-cluster-basics";
const SF = "/training/snowflake/sf-day0-objects";
const PYTHON = "/training/python/python-none-dicts-rows";
const FDE = "/training/forward-deployed/fde-what-an-fde-is";
const AI = "/training/ai-data-eng/ai-de-practice-agents";
const PY_ETL = "/training/python/python-etl-pipeline-builder";

async function top(locator: ReturnType<Page["locator"]>) {
  const box = await locator.boundingBox();
  expect(box, "expected a visible box").toBeTruthy();
  return box!.y;
}

async function expectLessonOrder(page: Page) {
  const cheat = page.locator("#cheat-sheet");
  const tryit = page.locator("#tryit");
  const lab = page.locator("#lab");
  await expect(cheat).toBeVisible();
  await expect(tryit).toBeVisible();
  await expect(lab).toBeVisible();
  expect(await top(cheat)).toBeLessThan(await top(tryit));
  expect(await top(tryit)).toBeLessThan(await top(lab));
}

async function expectLabChrome(page: Page) {
  const lab = page.locator("#lab");
  await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
  await expect(lab.getByText("DuckDB", { exact: true })).toBeVisible();
  await expect(lab.getByLabel("SQL sample", { exact: true })).toBeVisible();
  await expect(lab.getByRole("button", { name: "Run SQL sample" })).toBeVisible();
  await expect(lab.getByLabel("SQL to run")).toBeVisible();
}

test.describe("UX unify — lesson layout, TryIt editor, lab chrome", () => {
  test("SQL lesson: Cheat sheet → Try it → Local lab; Coming soon = 0", async ({ page }) => {
    await page.goto(SQL);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expectLessonOrder(page);
    await expectLabChrome(page);

    const block = page.locator("#cheat-sheet .cheat-sheet-block").first();
    const title = block.locator("p").first();
    const code = block.locator("pre code");
    const tip = block.locator(".cheat-sheet-tip");
    const copy = block.getByRole("button", { name: "Copy" });
    await expect(title).toBeVisible();
    await expect(code).toBeVisible();
    await expect(tip).toBeVisible();
    await expect(copy).toBeVisible();
    expect(await top(title)).toBeLessThan(await top(code));
    expect(await top(code)).toBeLessThan(await top(tip));
    expect(await top(tip)).toBeLessThan(await top(copy));
  });

  test("Databricks + Snowflake labs share the same chrome and section order", async ({ page }) => {
    await page.goto(DBX);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expectLessonOrder(page);
    await expectLabChrome(page);
    await expect(page.locator("#lab").getByText(/Not a live Databricks workspace/i)).toBeVisible();

    await page.goto(SF);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expectLessonOrder(page);
    await expectLabChrome(page);
    await expect(page.locator("#lab").getByText(/Not a live Snowflake account/i)).toBeVisible();

    await page.goto(PYTHON);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expectLessonOrder(page);
    const pyLab = page.locator("#lab");
    await expect(pyLab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(pyLab.getByText("Pyodide", { exact: true })).toBeVisible();
    await expect(pyLab.getByLabel("Python sample", { exact: true })).toBeVisible();
    await expect(pyLab.getByRole("button", { name: "Run Python sample" })).toBeVisible();
    await expect(pyLab.getByLabel("Python to run")).toBeVisible();
  });

  test("TryIt is editable; Run deep-links and executes when a lab exists", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(SQL);

    const tryit = page.locator("#tryit");
    const editor = tryit.getByLabel("Try it editor");
    await expect(editor).toBeVisible();
    await expect(editor).toBeEditable();
    const sample = "SELECT order_id, status FROM aurora_orders WHERE status = 'paid' LIMIT 3;";
    await editor.click();
    await editor.press("Control+a");
    await editor.fill(sample);
    await expect(editor).toHaveValue(sample);

    const run = tryit.getByRole("link", { name: /Run in local lab/i });
    await expect(run).toBeVisible();
    await expect(run).toHaveAttribute("href", "#lab");
    await run.click();

    await expect(page).toHaveURL(/#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.getByRole("columnheader", { name: /order_id|status/i }).first()).toBeVisible();
  });

  test("FDE / AI / Python ETL TryIt is copy-only — editable, no Run, Coming soon = 0", async ({
    page,
  }) => {
    for (const href of [FDE, AI, PY_ETL]) {
      await page.goto(href);
      await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
      await expect(page.locator("#lab")).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Run in local lab/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Run SQL sample|Run sample/i })).toHaveCount(0);

      const tryit = page.locator("#tryit");
      await expect(tryit).toBeVisible();
      const editor = tryit.getByLabel("Try it editor");
      await expect(editor).toBeEditable();
      await editor.fill("# edited locally — copy only");
      await expect(editor).toHaveValue(/edited locally/);
      await expect(tryit.getByRole("button", { name: /Copy to practice/i })).toBeVisible();
      await expect(tryit.getByText(/Copy to practice/i).first()).toBeVisible();
    }
  });

  test("no top-level Lab nav; no Coming soon on catalog + builder pages", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    await page.goto("/training/sql/sql-staging-mart-etl");
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.locator("#tryit")).toBeVisible();
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Run in local lab/i })).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";
import { expectCleanLabCells } from "./lab-result";

const SQL_SELECT = "/training/sql/sql-select-filter-nulls";
const SQL_SHIP = "/training/sql/sql-shipments-events";
const PY_CONTRACTS = "/training/python/python-dataframe-contracts";
const PY_VFS = "/training/python/python-vfs-datasets";
const DBX_CELLS = "/training/databricks/dbx-notebook-cell-types";
const DBX_DBUTILS = "/training/databricks/dbx-dbutils-notebook";
const DBX_MERGE = "/training/databricks/dbx-delta-merge-deep";
const SF_COPY = "/training/snowflake/sf-copy-history-practice";
const PE_REVIEWS = "/training/prompt-engineering/pe-practice-de-reviews";
const AI_REVIEW = "/training/ai-data-eng/ai-de-practice-sql-review";
const GIT_CONFLICT = "/training/git/git-conflict-practice";
const FDE_RUNBOOKS = "/training/forward-deployed/fde-practice-runbooks";

test.describe("Wave A — hub, datasets, labs, deep-dive", () => {
  test("training hub lists every track without header clutter", async ({ page }) => {
    await page.goto("/training");

    await expect(page.getByRole("heading", { name: "Interactive course tracks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All tools & tracks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Track cards" })).toBeVisible();

    const inventory = page.getByRole("list", { name: "All training tracks" });
    await expect(inventory.getByRole("link", { name: "Prompt Engineering" })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "AI for Data Engineers" })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "Python for Data Engineers" })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "Databricks (DBX)" })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "Snowflake", exact: true })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "Forward Deployed Engineer" })).toBeVisible();
    await expect(inventory.getByRole("link", { name: "Git (bonus)" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Prompt Engineering" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Git (bonus)" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Training" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
  });

  test("SQL lab shows schema sidebar, restore, and hint after a failed run", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SQL_SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    const schema = lab.getByRole("complementary", { name: "Sample database schema" });
    await expect(schema).toBeVisible();
    await expect(schema.getByRole("button", { name: /aurora_orders/ })).toBeVisible();

    await lab.getByRole("button", { name: "Restore sample DB" }).click();
    await expect(lab.getByText(/Sample database restored/i)).toBeVisible({ timeout: 45_000 });

    await lab.getByLabel("SQL to run").fill("INSERT INTO aurora_orders VALUES (1)");
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    await expect(lab.getByRole("alert")).toBeVisible();
    await expect(lab.getByTestId("lab-hint")).toBeVisible();
    await expect(lab.getByTestId("lab-hint")).toContainText(/SELECT \/ WITH|status = 'paid'/i);

    await lab.getByLabel("SQL to run").fill("DELETE FROM aurora_orders");
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    await expect(lab.getByTestId("lab-solution")).toBeVisible();
    await expect(lab.getByTestId("lab-solution")).toContainText(/aurora_orders/);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("SQL shipments lesson runs a LEFT JOIN sample with clean cells", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SQL_SHIP}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/aurora_shipments|aurora_events/i).first()).toBeVisible();
    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expectCleanLabCells(table, ["1001"]);
  });

  test("Python depth + VFS lessons host the local lab", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${PY_CONTRACTS}#lab`);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText(/Pyodide · in-browser/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Run in local lab/i }).first()).toBeVisible();
    await expect(lab.getByRole("button", { name: "Restore sample DB" })).toHaveCount(0);

    await page.goto(`${PY_VFS}#lab`);
    await expect(page.locator("#learn")).toHaveText(/Practice data files in the local lab/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await page.locator("#lab").getByRole("button", { name: "Run Python sample" }).click();
    const result = page.locator("#lab").getByLabel("Python result");
    await expect(result).toBeVisible({ timeout: 90_000 });
    await expect(result).toContainText(/1|2|active|customer/i);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("Databricks deep-dive lessons host the lab; secrets/%sh stay copy-only", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${DBX_CELLS}#lab`);
    await expect(page.locator("#learn")).toHaveText(/Notebook cell types/i);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/%sh/i).first()).toBeVisible();
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();

    await page.goto(DBX_DBUTILS);
    await expect(page.locator("#learn")).toHaveText(/dbutils/i);
    await expect(page.locator("#lab")).toBeVisible();
    await expect(page.getByText(/Copy-only/i).first()).toBeVisible();
    await expect(page.getByText(/dbutils.secrets.get/i).first()).toBeVisible();

    await page.goto(`${DBX_MERGE}#lab`);
    await expect(page.locator("#learn")).toHaveText(/Delta MERGE deep-dive/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("new practice lessons exist on every remaining track", async ({ page }) => {
    await page.goto(SF_COPY);
    await expect(page.locator("#learn")).toHaveText(/COPY history practice/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator("#quiz")).toBeVisible();

    await page.goto(PE_REVIEWS);
    await expect(page.locator("#learn")).toHaveText(/Practice — DE review prompts/i);
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.locator("#quiz")).toBeVisible();
    await expect(page.locator("#lab")).toHaveCount(0);

    await page.goto(AI_REVIEW);
    await expect(page.locator("#learn")).toHaveText(/Practice — review SQL and Python with AI/i);
    await expect(page.locator(".tryit").first()).toBeVisible();

    await page.goto(GIT_CONFLICT);
    await expect(page.locator("#learn")).toHaveText(/Conflict practice/i);
    await expect(page.locator("#lab")).toBeVisible();

    await page.goto(FDE_RUNBOOKS);
    await expect(page.locator("#learn")).toHaveText(/Practice — runbooks/i);
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("search indexes Wave A slugs; no Lab nav", async ({ page }) => {
    await page.goto("/search?q=notebook+cell+types");
    await expect(page.getByRole("link", { name: /Notebook cell types/i })).toBeVisible();

    await page.goto("/search?q=aurora_shipments");
    await expect(page.getByRole("link", { name: /Shipments, events, and tickets/i })).toBeVisible();

    await page.goto("/search?q=practice+data+files");
    await expect(page.getByRole("link", { name: /Practice data files in the local lab/i })).toBeVisible();

    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";
import { expectCleanLabCells } from "./lab-result";

const SQL_SELECT = "/training/sql/sql-select-filter-nulls";
const DBX_DAY0 = "/training/databricks/dbx-workspace-cluster-basics";
const SF_DAY0 = "/training/snowflake/sf-day0-objects";

const ALL_TRACKS = [
  "Prompt Engineering",
  "AI for Data Engineers",
  "Python for Data Engineers",
  "SQL for Analytics Engineering",
  "Databricks (DBX)",
  "Snowflake",
  "Forward Deployed Engineer",
  "Git (bonus)",
];

test.describe("Wave A — training index + lab P1 UX", () => {
  test("training index lists every track and practice CTAs without header Play Lab", async ({
    page,
  }) => {
    await page.goto("/training");

    const index = page.getByTestId("training-track-index");
    await expect(index.getByRole("heading", { name: "All tracks" })).toBeVisible();

    for (const title of ALL_TRACKS) {
      await expect(
        index.getByRole("heading", { name: title, exact: true }),
        `track card missing: ${title}`,
      ).toBeVisible();
      await expect(index.getByRole("list", { name: "All training tracks" }).getByRole("link", { name: title, exact: true })).toBeVisible();
    }

    const labs = page.getByTestId("training-practice-labs");
    await expect(labs.getByRole("link", { name: /Practice · SQL lab/i })).toBeVisible();
    await expect(labs.getByRole("link", { name: /Practice · Databricks lab/i })).toBeVisible();
    await expect(labs.getByRole("link", { name: /Practice · Snowflake lab/i })).toBeVisible();
    await expect(labs.getByRole("link", { name: /Practice · Python lab/i })).toBeVisible();
    await expect(labs.getByRole("link", { name: /Practice · Git Play Lab/i })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Training" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Play Lab/i })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("SQL lab shows schema sidebar, restore, and hints after a failed run", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SQL_SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText(/Not a live warehouse/i)).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    const schema = lab.getByRole("complementary", { name: /Sample database schema/i });
    await expect(schema).toBeVisible();
    await expect(schema.getByTestId("lab-schema-table-aurora_orders")).toBeVisible();
    await expect(schema.getByText("order_id", { exact: true }).first()).toBeVisible();
    await expect(schema.getByText("amount", { exact: true }).first()).toBeVisible();

    await lab.getByRole("button", { name: "Show hint" }).click();
    await expect(lab.getByTestId("lab-hint")).toBeVisible();
    await lab.getByRole("button", { name: "Hide hint" }).click();
    await expect(lab.getByTestId("lab-hint")).toHaveCount(0);

    await lab.getByLabel("SQL to run").fill("SELECT nope FROM missing_table");
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    await expect(lab.getByRole("alert")).toBeVisible({ timeout: 45_000 });
    await expect(lab.getByTestId("lab-hint")).toBeVisible();
    await expect(lab.getByTestId("lab-hint")).toContainText(/After that failed run/i);

    await lab.getByRole("button", { name: "Restore sample database" }).click();
    await expect(lab.getByText("Sample database restored.")).toBeVisible({ timeout: 45_000 });
    await expect(schema.getByTestId("lab-schema-table-aurora_orders")).toBeVisible();

    await lab.getByLabel("SQL to run").fill(
      "SELECT order_id, status, amount FROM aurora_orders WHERE status = 'paid' ORDER BY amount DESC LIMIT 1",
    );
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expectCleanLabCells(table, ["64.25", "paid"]);
  });

  test("Databricks and Snowflake labs show dialect schema + restore", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto(`${DBX_DAY0}#lab`);
    const dbx = page.locator("#lab");
    await expect(dbx.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    const dbxSchema = dbx.getByRole("complementary", { name: /Sample database schema/i });
    await expect(dbxSchema.getByTestId("lab-schema-table-bronze_orders")).toBeVisible();
    await expect(dbxSchema.getByTestId("lab-schema-table-silver_orders")).toBeVisible();
    await expect(dbx.getByRole("button", { name: "Restore sample database" })).toBeVisible();

    await page.goto(`${SF_DAY0}#lab`);
    const sf = page.locator("#lab");
    await expect(sf.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    const sfSchema = sf.getByRole("complementary", { name: /Sample database schema/i });
    await expect(sfSchema.getByTestId("lab-schema-table-sf_orders")).toBeVisible();
    await expect(sfSchema.getByTestId("lab-schema-table-sf_warehouses")).toBeVisible();
    await expect(sf.getByRole("button", { name: "Restore sample database" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });
});

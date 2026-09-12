import { expect, test } from "@playwright/test";

/** Prompt D pedagogical L1 order — slugs/files unchanged. */
const L1 = [
  "sql-select-filter-nulls",
  "sql-patterns-aliases-case",
  "sql-aggregates-group-having",
  "sql-joins-set-logic-recap",
  "sql-exists-any-all",
  "sql-ddl-constraints",
  "sql-dml-write-path",
  "sql-dates-injection",
] as const;

const L2_NEXT = "/training/python/python-none-dicts-rows#lab";
const OFF_PATH = /sql-window-functions|sql-slowly-changing|sql-staging-mart-etl|sql-deduping/i;

test.describe("Phase 1 Prompt D — L1 SQL closed loop", () => {
  test("SQL track cards list L1 in pedagogical order, then depth catalog", async ({ page }) => {
    await page.goto("/training/sql");

    await expect(page.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(page.getByText(/SELECT\/filters → Patterns\/CASE → Aggregates → Joins recap/i)).toBeVisible();
    await expect(page.getByText(/Windows, SCD, and ETL builders stay off the L1 path/i)).toBeVisible();

    const cardHrefs = await page
      .locator('a.glass[href^="/training/sql/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(cardHrefs.slice(0, 8)).toEqual(L1.map((slug) => `/training/sql/${slug}`));
    expect(cardHrefs.slice(0, 8).join(" ")).not.toMatch(OFF_PATH);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("in-lesson Next checkpoint follows L1 order into #lab (not catalog sort)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    for (let i = 0; i < L1.length; i++) {
      const current = L1[i];
      const expected =
        i < L1.length - 1 ? `/training/sql/${L1[i + 1]}#lab` : L2_NEXT;

      await page.goto(`/training/sql/${current}`);
      const next = page.getByTestId("lesson-next-cta");
      await expect(next).toBeVisible();
      await expect(next).toHaveAttribute("href", expected);
      await expect(page.getByTestId("lesson-next-footer")).toHaveAttribute("href", expected);
      expect(expected).not.toMatch(OFF_PATH);
    }
  });

  test("each L1 slug mounts Unified Tryit against the local seed; no Coming soon", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    for (const slug of L1) {
      await page.goto(`/training/sql/${slug}#lab`);

      const lab = page.locator("#lab");
      await expect(lab).toHaveAttribute("data-testid", "unified-tryit");
      await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
      await expect(lab.getByLabel("SQL to run")).not.toHaveValue("");
      await expect(lab.getByLabel("SQL to run")).toHaveValue(/aurora_|information_schema/i);
      const demo = page.locator("#seed-demo-5-rows");
      await expect(demo).toBeVisible();
      const demoTable = page.locator("#learn table").first();
      await expect(demoTable).toBeVisible();
      await expect(demoTable.locator("tbody tr")).toHaveCount(5);
      await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
      await expect(page.getByText(/Alfreds Futterkiste|Customers 101/i)).toHaveCount(0);
    }
  });

  test("Mark complete reveals next CTA to the following L1 #lab", async ({ page }) => {
    await page.goto("/training/sql/sql-select-filter-nulls");
    await expect(page.getByTestId("complete-next-cta")).toHaveCount(0);

    await page.getByRole("button", { name: /Mark complete/i }).click();
    const after = page.getByTestId("complete-next-cta");
    await expect(after).toBeVisible();
    await expect(after).toHaveAttribute("href", "/training/sql/sql-patterns-aliases-case#lab");
  });
});

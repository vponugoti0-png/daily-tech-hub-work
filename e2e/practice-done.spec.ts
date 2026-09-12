import { expect, test, type Page } from "@playwright/test";

const LAB_LESSONS = [
  {
    name: "SQL SELECT",
    url: "/training/sql/sql-select-filter-nulls",
    heading: /SELECT, filters, NULLs, and LIMIT/i,
  },
  {
    name: "Databricks Spark SQL SELECT",
    url: "/training/databricks/dbx-spark-select-nulls",
    heading: /Spark SQL SELECT, NULLs, and LIMIT/i,
  },
  {
    name: "Snowflake SAMPLE SELECT",
    url: "/training/snowflake/sf-select-filter-nulls",
    heading: /SELECT, filters, NULLs on SAMPLE/i,
  },
] as const;

async function assertFinishedPractice(page: Page) {
  await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  await expect(page.getByText(/will arrive later/i)).toHaveCount(0);
  await expect(page.getByText(/Live Run isn.t/i)).toHaveCount(0);

  const tryIt = page.locator(".tryit").first();
  await expect(tryIt).toBeVisible();
  await expect(tryIt.getByText(/Local lab below/i)).toBeVisible();
  await expect(tryIt.getByRole("link", { name: /Open local practice lab/i })).toBeVisible();

  await tryIt.getByRole("button", { name: /How to practice/i }).click();
  await expect(tryIt.getByText(/DuckDB practice surface/i)).toBeVisible();
  await expect(tryIt.getByText(/Live Run isn.t ready/i)).toHaveCount(0);
  await expect(tryIt.getByText(/Play button/i)).toHaveCount(0);

  const lab = page.locator("#lab");
  await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
  await expect(lab.getByText(/DuckDB · in-browser/i)).toBeVisible();
  await expect(lab.getByText(/Coming soon: connect workspace/i)).toHaveCount(0);
}

test.describe("Practice chrome feels finished", () => {
  for (const lesson of LAB_LESSONS) {
    test(`${lesson.name} TryIt + lab have no Coming soon`, async ({ page }) => {
      await page.goto(lesson.url);
      await expect(page.locator("#learn")).toHaveText(lesson.heading);
      await assertFinishedPractice(page);
    });
  }

  test("Python TryIt is copy-to-practice — finished, not coming soon", async ({ page }) => {
    await page.goto("/training/python/python-none-dicts-rows");
    await expect(page.locator("#learn")).toHaveText(/None, dicts, and pipeline rows/i);
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    const tryIt = page.locator(".tryit").first();
    await expect(tryIt.getByText(/Copy to practice/i)).toBeVisible();
    await tryIt.getByRole("button", { name: /How to practice/i }).click();
    await expect(tryIt.getByText(/IDE, warehouse worksheet, notebook, or AI chat/i)).toBeVisible();
    await expect(tryIt.getByText(/Live Run isn.t ready/i)).toHaveCount(0);
    await expect(tryIt.getByText(/will arrive later/i)).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";

const ETL = [
  {
    track: "python",
    trackTitle: "Python for Data Engineers",
    slug: "python-etl-pipeline-builder",
    title: /Build an ETL job — extract, transform, load/i,
    body: /extract_orders/i,
  },
  {
    track: "sql",
    trackTitle: "SQL for Analytics Engineering",
    slug: "sql-staging-mart-etl",
    title: /Build staging→mart ETL with DQ gates/i,
    body: /dq_uniqueness_gate/i,
  },
  {
    track: "databricks",
    trackTitle: "Databricks (DBX)",
    slug: "dbx-medallion-etl-builder",
    title: /Build medallion ETL — Autoloader to gold/i,
    body: /availableNow/i,
  },
  {
    track: "snowflake",
    trackTitle: "Snowflake",
    slug: "sf-warehouse-etl-builder",
    title: /Build warehouse ETL — COPY, Streams, Dynamic Tables/i,
    body: /orders_stream/i,
  },
] as const;

test.describe("ETL builder lessons", () => {
  test("training hub is not an ETL overlay; no ETL nav", async ({ page }) => {
    await page.goto("/training");

    await expect(page.getByRole("heading", { name: /Suggested cert-style order/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Extract → transform → load/i })).toHaveCount(0);

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Learn" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^ETL$/i })).toHaveCount(0);
  });

  for (const row of ETL) {
    test(`${row.track} track lists builder; lesson shows quiz`, async ({ page }) => {
      await page.goto(`/training/${row.track}`);

      await expect(page.getByRole("heading", { name: row.trackTitle, exact: true })).toBeVisible();
      await expect(page.getByText(/Recommended order/i).first()).toBeVisible();

      const card = page.getByRole("link", { name: row.title });
      await expect(card).toBeVisible();
      await card.click();

      await expect(page).toHaveURL(new RegExp(`/training/${row.track}/${row.slug}`));
      await expect(page.locator("#learn")).toHaveText(row.title);
      await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
      await expect(page.locator(".tryit").first()).toBeVisible();
      await expect(page.getByText(row.body).first()).toBeVisible();

      const quiz = page.locator("#quiz");
      await quiz.scrollIntoViewIfNeeded();
      await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();
      await expect(quiz.getByRole("radio").first()).toBeVisible();
    });
  }

  test("search indexes each ETL builder via a unique phrase", async ({ page }) => {
    await page.goto("/search?q=extract_orders");
    await expect(page.getByRole("link", { name: /Build an ETL job/i })).toBeVisible();

    await page.goto("/search?q=dq_uniqueness_gate");
    await expect(page.getByRole("link", { name: /staging→mart ETL/i })).toBeVisible();

    await page.goto("/search?q=medallion+etl");
    await expect(page.getByRole("link", { name: /Autoloader to gold/i })).toBeVisible();

    await page.goto("/search?q=orders_stream");
    await expect(page.getByRole("link", { name: /COPY, Streams, Dynamic Tables/i })).toBeVisible();
  });
});

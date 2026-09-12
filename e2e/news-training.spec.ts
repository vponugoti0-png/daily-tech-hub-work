import { expect, test } from "@playwright/test";

const NEWS_SLUG = "snowflake-dynamic-tables-ga-improvements";
const RELEASE_SLUG = "databricks-runtime-16-brief";

test.describe("P2 news → training related links", () => {
  test("news detail shows 1–3 Continue learning links that resolve", async ({ page }) => {
    await page.goto(`/news/${NEWS_SLUG}`);

    await expect(
      page.getByRole("heading", { name: /Snowflake Dynamic Tables/i }),
    ).toBeVisible();

    const block = page.locator("#continue-learning");
    await expect(block.getByRole("heading", { name: "Continue learning" })).toBeVisible();
    await expect(block.getByText(/no sign-in required/i)).toBeVisible();

    const links = block.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href, `related href ${i}`).toMatch(/^\/training\//);
    }

    await expect(
      block.getByRole("link", { name: /Dynamic Tables declarative pipelines/i }),
    ).toBeVisible();

    const firstHref = await links.first().getAttribute("href");
    expect(firstHref).toBeTruthy();
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`${firstHref!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`));
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("release detail shows Continue learning and a Databricks track-family link", async ({
    page,
  }) => {
    await page.goto(`/releases/${RELEASE_SLUG}`);

    await expect(
      page.getByRole("heading", { name: /Databricks Runtime 16/i }),
    ).toBeVisible();

    const block = page.locator("#continue-learning");
    await expect(block.getByRole("heading", { name: "Continue learning" })).toBeVisible();

    const links = block.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);

    const hrefs = await Promise.all(
      Array.from({ length: count }, (_, i) => links.nth(i).getAttribute("href")),
    );
    expect(hrefs.every((href) => href?.startsWith("/training/"))).toBe(true);
    expect(hrefs.some((href) => href?.startsWith("/training/databricks"))).toBe(true);

    const firstHref = hrefs[0]!;
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`${firstHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`));
    await expect(page.locator("body")).not.toContainText("This page could not be found");
  });

  test("homepage news cards stay unchanged (no Continue learning)", async ({ page }) => {
    await page.goto("/");

    const newsSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "What's new (skimmable)" }),
    });
    await expect(newsSection.getByRole("link").first()).toBeVisible();
    await expect(newsSection.getByRole("heading", { name: "Continue learning" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Continue learning" })).toHaveCount(0);
  });
});

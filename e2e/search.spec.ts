import { expect, test } from "@playwright/test";

test.describe("search form (hydration-resilient GET)", () => {
  test("native form attributes are present for no-JS Enter", async ({ page }) => {
    await page.goto("/search");

    const form = page.getByRole("search");
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute("method", "get");
    await expect(form).toHaveAttribute("action", "/search");

    const input = form.locator('input[name="q"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("name", "q");
    await expect(input).toHaveAttribute("type", "search");
    await expect(input).toHaveAttribute("enterkeyhint", "search");
    await expect(input).toHaveAttribute("aria-label", "Search");
    const submit = form.getByRole("button", { name: "Search" });
    await expect(submit).toBeVisible();
    await expect(submit).toHaveAttribute("aria-label", "Search");
    await expect(submit).toHaveCSS("min-height", "44px");
  });

  test("Enter submits to /search?q= and shows results UI", async ({ page }) => {
    await page.goto("/search");

    const form = page.getByRole("search");
    const input = form.locator('input[name="q"]');
    await input.fill("window");
    await input.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=window/);
    await expect(page.getByRole("heading", { name: "Find anything in the hub" })).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();
    // Known curated hit (SQL window-functions lesson) or empty state if content changes.
    await expect(
      page.getByRole("heading", { name: /No matches|Search the hub/ }).or(
        page.getByRole("heading", { level: 3 }).first(),
      ),
    ).toBeVisible();
    await expect(page.getByRole("status")).toHaveText(/\d+ results? for “window”/);
  });

  test("search result count is visible for hits and zero matches", async ({ page }) => {
    await page.goto("/search?q=window");
    await expect(page.getByRole("status")).toHaveText(/\d+ results? for “window”/);
    await expect(page.getByRole("heading", { name: /Find anything in the hub/i })).toBeVisible();

    await page.goto("/search?q=zzzxqnotfound123");
    await expect(page.getByRole("status")).toHaveText(/0 results for “zzzxqnotfound123”/);
    await expect(page.getByRole("heading", { name: "No matches" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("git query prefers git lessons over body-only noise", async ({ page }) => {
    await page.goto("/search?q=git");
    await expect(page.getByRole("status")).toHaveText(/\d+ results? for “git”/);
    await expect(
      page.getByRole("link", { name: /rebase|commit hygiene|bisect|branching|PR templates/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Practice with agents & Cortex functions/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Docs and tests with AI/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Review AI-assisted changes/i })).toHaveCount(0);
  });

  test("native GET submit works without JavaScript handlers", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/search");

    const form = page.locator('form[role="search"]');
    await expect(form).toHaveAttribute("method", "get");
    await expect(form).toHaveAttribute("action", "/search");
    await expect(form.locator('input[name="q"]')).toHaveCount(1);

    // Client CSS/hydration is off, so the input may not be "visible" to Playwright.
    // HTMLFormElement.submit() still performs the native GET the P1 fix relies on.
    await form.locator('input[name="q"]').evaluate((el: HTMLInputElement) => {
      el.value = "window";
    });
    await Promise.all([
      page.waitForURL(/\/search\?q=window/),
      form.evaluate((el: HTMLFormElement) => el.submit()),
    ]);

    // Without JS, App Router Suspense leaves "Loading search…" — URL + form
    // attributes are the lock for the native GET fix.
    await expect(page).toHaveURL(/\/search\?q=window/);

    await context.close();
  });
});

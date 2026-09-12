import { expect, test } from "@playwright/test";

const PRACTICE = "/training/ai-data-eng/ai-de-practice-agents";

test.describe("training catalog", () => {
  test("index lists AI for Data Engineers as an elective", async ({ page }) => {
    await page.goto("/training");

    await expect(page.getByRole("heading", { name: "Your school" })).toBeVisible();
    await expect(page.getByTestId("learn-electives").getByRole("heading", { name: "AI for Data Engineers" })).toBeVisible();
    await expect(page.getByText(/Start here · Practice with agents/i)).toHaveCount(0);
  });

  test("ai-data-eng track lists the practice lesson", async ({ page }) => {
    await page.goto("/training/ai-data-eng");

    await expect(page.getByRole("heading", { name: "AI for Data Engineers" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Practice with agents & Cortex functions/i }),
    ).toBeVisible();
    await expect(page.getByText(/practice with agents and Cortex functions/i)).toBeVisible();
  });

  test("practice lesson shows TryIt, quiz, Shortcuts, and back-to-track", async ({ page }) => {
    await page.goto(PRACTICE);

    await expect(page.locator("#learn")).toHaveText(/Practice with agents & Cortex functions/i);
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText("SNOWFLAKE.CORTEX.COMPLETE").first()).toBeVisible();
    await expect(page.getByText("SNOWFLAKE.CORTEX.SUMMARIZE").first()).toBeVisible();

    const quiz = page.locator("#quiz");
    await quiz.scrollIntoViewIfNeeded();
    await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();

    const cortexLink = page.getByRole("link", { name: /Snowflake Cortex AI/i }).first();
    await expect(cortexLink).toBeVisible();
    await expect(cortexLink).toHaveAttribute("href", "/shortcuts/snowflake-cortex-ai");

    const back = page.getByRole("link", { name: /Back to AI for Data Engineers/i });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/training\/ai-data-eng\/?$/);
    await expect(page.getByRole("heading", { name: "AI for Data Engineers" })).toBeVisible();
  });

  test("prev navigation from the practice lesson works", async ({ page }) => {
    await page.goto(PRACTICE);

    const prev = page.getByRole("link", { name: /Review AI-assisted changes/i }).first();
    await expect(prev).toBeVisible();
    await prev.click();
    await expect(page).toHaveURL(/\/training\/ai-data-eng\/ai-de-review-changes/);
    await expect(page.locator("#learn")).toHaveText(/Review AI-assisted changes/i);
  });

  test("search indexes the new practice lesson", async ({ page }) => {
    await page.goto("/search");

    const form = page.getByRole("search");
    const input = form.locator('input[name="q"]');
    await input.fill("practice with agents");
    await input.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=practice(\+|%20)with(\+|%20)agents/);
    await expect(
      page.getByRole("link", { name: /Practice with agents & Cortex functions/i }),
    ).toBeVisible();
  });

  test("search finds the lesson via function-calling synonym", async ({ page }) => {
    await page.goto("/search?q=function+calling");
    await expect(
      page.getByRole("link", { name: /Practice with agents & Cortex functions/i }),
    ).toBeVisible();
  });

  test("search finds the lesson via agents and tools synonyms", async ({ page }) => {
    await page.goto("/search?q=agents");
    await expect(
      page.getByRole("link", { name: /Practice with agents & Cortex functions/i }),
    ).toBeVisible();

    await page.goto("/search?q=tools");
    await expect(
      page.getByRole("link", { name: /Practice with agents & Cortex functions/i }),
    ).toBeVisible();
  });
});

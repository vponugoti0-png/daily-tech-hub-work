import { expect, test } from "@playwright/test";

const FIRST_LESSON = "/training/prompt-engineering/pe-ask-better-questions";

test.describe("Kid Tester P0s — learner UX", () => {
  test("Start here opens Prompt Engineering lesson 1", async ({ page }) => {
    await page.goto("/");

    const start = page.getByTestId("start-here-cta");
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("href", FIRST_LESSON);
    await start.click();

    await expect(page).toHaveURL(/\/training\/prompt-engineering\/pe-ask-better-questions\/?$/);
    await expect(page.locator("#learn")).toHaveText(/Ask AI better questions/i);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("quiz shows why-wrong and cheer after a mixed submit", async ({ page }) => {
    await page.goto(FIRST_LESSON);

    const quiz = page.locator("#quiz");
    await quiz.scrollIntoViewIfNeeded();
    await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();

    await quiz.getByRole("radio", { name: /^Explain Spark$/ }).check();
    await quiz.getByRole("radio", { name: /Limits like dialect/ }).check();
    await quiz.getByRole("button", { name: "Submit answers" }).click();

    const why = quiz.getByTestId("quiz-why-wrong");
    await expect(why).toBeVisible();
    await expect(why).toContainText(/Why that was off/i);
    await expect(why).toContainText(/Clear audience, length, and format/i);
    await expect(quiz.getByText(/the answer is [A-D]\b/i)).toHaveCount(0);

    const cheer = quiz.getByTestId("quiz-cheer");
    await expect(cheer).toBeVisible();
    await expect(cheer).toContainText(/Nice one!/i);
  });

  test("jargon chips are visible on home and Training", async ({ page }) => {
    await page.goto("/");
    const homeChips = page.getByTestId("jargon-chips");
    await expect(homeChips).toBeVisible();
    await expect(homeChips).toContainText(/DE\s*=\s*Data Engineer/i);
    await expect(homeChips).toContainText(/DBX\s*=\s*Databricks/i);
    await expect(homeChips).toContainText(/ETL/i);

    await page.goto("/training");
    const trainingChips = page.getByTestId("jargon-chips");
    await expect(trainingChips).toBeVisible();
    await expect(trainingChips).toContainText(/DE\s*=\s*Data Engineer/i);
    await expect(trainingChips).toContainText(/DBX\s*=\s*Databricks/i);
    await expect(trainingChips).toContainText(/ETL/i);
  });
});

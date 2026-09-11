import { expect, test } from "@playwright/test";

/**
 * Real lesson with a 2-question quiz (frontmatter in content/training).
 * Path: /training/prompt-engineering/pe-ask-better-questions
 */
const QUIZ_LESSON = "/training/prompt-engineering/pe-ask-better-questions";

test.describe("quiz UX", () => {
  test("submit stays disabled until every question is answered", async ({ page }) => {
    await page.goto(QUIZ_LESSON);

    const quiz = page.locator("#quiz");
    await quiz.scrollIntoViewIfNeeded();
    await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();

    const submit = quiz.getByRole("button", { name: "Submit answers" });
    await expect(submit).toBeDisabled();
    await expect(quiz.getByText(/Answer all questions to enable submit/)).toBeVisible();
    await expect(page.getByText(/then submit for a score/i)).toHaveCount(0);

    await quiz.getByRole("radio", { name: /Explain Spark partitions/ }).check();
    await expect(submit).toBeDisabled();
    await expect(quiz.getByText(/Answer all questions to enable submit/)).toBeVisible();

    await quiz.getByRole("radio", { name: /Limits like dialect/ }).check();
    await expect(submit).toBeEnabled();
    await expect(quiz.getByText(/Answer all questions to enable submit/)).toHaveCount(0);
    await expect(page.getByText(/then submit for a score/i)).toHaveCount(0);
  });
});

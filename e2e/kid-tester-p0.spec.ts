import { expect, test } from "@playwright/test";

const FIRST_LESSON = "/training/prompt-engineering/pe-ask-better-questions";
const SQL_TRACK = "/training/sql";

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

test.describe("Kid Tester P0s — learner UX", () => {
  test("Start here navigates to the first beginner lesson", async ({ page }) => {
    await page.goto("/");

    const start = page.getByTestId("start-here-cta");
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("href", FIRST_LESSON);
    await start.click();

    await expect(page).toHaveURL(/\/training\/prompt-engineering\/pe-ask-better-questions\/?$/);
    await expect(page.locator("#learn")).toHaveText(/Ask AI better questions/i);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("quiz shows a plain-English why-wrong after a wrong submit", async ({ page }) => {
    await page.goto(FIRST_LESSON);

    const quiz = page.locator("#quiz");
    await quiz.scrollIntoViewIfNeeded();
    await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();

    await quiz.getByRole("radio", { name: /^Explain Spark$/ }).check();
    await quiz.getByRole("radio", { name: /Only the model name/ }).check();
    await quiz.getByRole("button", { name: "Submit answers" }).click();

    const why = quiz.getByTestId("quiz-why-wrong");
    await expect(why.first()).toBeVisible();
    await expect(why.first()).toContainText(/Why that was off/i);
    await expect(why.first()).toContainText(/Clear audience, length, and format/i);
    await expect(quiz.getByText(/the answer is [A-D]\b/i)).toHaveCount(0);
  });

  test("home digest date is a sane civil date (not off by months)", async ({ page }) => {
    await page.goto("/");

    const chip = page.getByTestId("digest-date");
    await expect(chip).toBeVisible();
    const text = (await chip.innerText()).trim();
    const match = text.match(/^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/);
    expect(match, `digest date "${text}"`).toBeTruthy();

    const month = MONTHS[match![1]];
    expect(month, match![1]).toBeGreaterThanOrEqual(0);
    const shown = new Date(Number(match![3]), month, Number(match![2]));
    const now = new Date();
    const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.abs((shown.getTime() - localToday.getTime()) / 86_400_000);
    expect(diffDays, `digest "${text}" vs local ${localToday.toDateString()}`).toBeLessThanOrEqual(1);
  });

  test("Practice CTA is visible from Start here and a track page", async ({ page }) => {
    await page.goto("/");
    const homePractice = page.getByTestId("practice-cta");
    await expect(homePractice).toBeVisible();
    await expect(homePractice).toHaveAttribute("href", /\/training\/sql\/sql-select-filter-nulls#lab/);

    await page.goto(SQL_TRACK);
    const trackPractice = page.getByTestId("practice-cta");
    await expect(trackPractice).toBeVisible();
    await expect(trackPractice).toHaveAttribute("href", /\/training\/sql\/.+#lab/);
    await expect(trackPractice).toContainText(/Practice/i);
  });
});

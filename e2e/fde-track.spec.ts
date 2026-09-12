import { expect, test } from "@playwright/test";

const TRACK = "/training/forward-deployed";
const LESSON1 = "/training/forward-deployed/fde-what-an-fde-is";

const LESSON_TITLES = [
  "What a Forward Deployed Engineer is",
  "Discovery and shadowing workflows",
  "Scope the smallest valuable deploy",
  "Integrate in someone else’s environment",
  "Deploy and environments",
  "Security review survival",
  "Observability and on-call handoff",
  "AI, RAG, and agents with evals",
  "Stakeholder demos and writing",
  "Capstone — DE platform engagement checklist",
];

test.describe("FDE training track", () => {
  test("training index lists the Forward Deployed Engineer card", async ({ page }) => {
    await page.goto("/training");

    await expect(page.getByRole("heading", { name: "Interactive course tracks" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Forward Deployed Engineer", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(/Customer-facing delivery for DE\/AI platforms/i).first(),
    ).toBeVisible();
  });

  test("track page lists all ten lessons", async ({ page }) => {
    await page.goto(TRACK);

    await expect(
      page.getByRole("heading", { name: "Forward Deployed Engineer", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/10 lessons/i)).toBeVisible();
    for (const title of LESSON_TITLES) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  test("lesson 1 shows objectives, try-it card, and quiz heading", async ({ page }) => {
    await page.goto(LESSON1);

    await expect(page.locator("#learn")).toHaveText(/What a Forward Deployed Engineer is/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();

    const quiz = page.locator("#quiz");
    await quiz.scrollIntoViewIfNeeded();
    await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();

    const back = page.getByRole("link", { name: /Back to Forward Deployed Engineer/i });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/training\/forward-deployed\/?$/);
    await expect(
      page.getByRole("heading", { name: "Forward Deployed Engineer", exact: true }),
    ).toBeVisible();
  });
});

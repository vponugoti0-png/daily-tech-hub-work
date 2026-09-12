import { expect, test, type Page } from "@playwright/test";

const SQL_LAB = "/training/sql/sql-select-filter-nulls#lab";
const SCORE_UI = /Score:|you scored|\b\d+\s*\/\s*6\b|%\s*correct|quizScore/i;
const COMING_SOON = /Coming soon/i;
const CERT_SPINE = /Suggested cert-style order|PE → AI → Python → SQL/i;

const QUESTIONS = [
  {
    topic: "WHERE Filter",
    question: "You need every paid aurora_orders row",
    correct: "WHERE status = 'paid'",
    wrong: "WHERE promo_code = NULL",
    failLevel: "L1",
  },
  {
    topic: "Python Exception Handling",
    question: "except Exception: pass",
    correct: "It turns a broken landing into a successful empty window",
    wrong: "It is slower than a bare except",
    failLevel: "L2",
  },
  {
    topic: "Staging & Incremental MERGE",
    question: "Why land into staging",
    correct: "So you can inspect, dedupe, and gate before publish",
    wrong: "Because staging is billed less",
    failLevel: "L3",
  },
  {
    topic: "COPY INTO Stage",
    question: "COPY INTO is best used to",
    correct: "Land files from a stage into a table",
    wrong: "Replace Dynamic Tables",
    failLevel: "L4",
  },
  {
    topic: "Delta MERGE Medallion",
    question: "Autoloader bronze → MERGE silver",
    correct: "You never persist a mart from unvalidated silver",
    wrong: "Gold must run first",
    failLevel: "L5",
  },
  {
    topic: "Mart & Data Quality",
    question: "When should a DQ gate block the MERGE",
    correct: "When a named contract breaks",
    wrong: "Never — gold should always update",
    failLevel: "L6",
  },
] as const;

async function expectNoScoreOrComingSoon(page: Page) {
  await expect(page.getByText(COMING_SOON)).toHaveCount(0);
  await expect(page.getByText(SCORE_UI)).toHaveCount(0);
}

test.describe("Phase 1 Prompt E — /paths outline + placement MCQs", () => {
  test("/paths and /paths/zero-to-hero render L0–L7 against existing slugs", async ({ page }) => {
    await page.goto("/paths");
    await expect(page.getByRole("heading", { name: "One school, two doors" })).toBeVisible();
    await expect(page.getByTestId("paths-zero-to-hero")).toBeVisible();
    await expect(page.getByTestId("placement-diagnostic")).toBeVisible();
    await expect(page.getByTestId("paths-git-skill")).toBeVisible();
    await expect(page.getByTestId("paths-git-skill")).toContainText(/Skill path/i);
    await expect(page.getByText(CERT_SPINE)).toHaveCount(0);

    for (const id of ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const) {
      await expect(page.getByTestId(`paths-level-${id}`)).toBeVisible();
    }
    await expect(page.getByTestId("paths-outline").getByRole("link")).toHaveCount(8);
    await expect(page.getByTestId("paths-level-L1")).toHaveAttribute("href", SQL_LAB);
    await expect(page.getByTestId("paths-level-L6")).toContainText(/L6 Elective/i);
    await expectNoScoreOrComingSoon(page);

    await page.getByTestId("paths-zero-to-hero").click();
    await expect(page).toHaveURL(/\/paths\/zero-to-hero/);
    await expect(page.getByTestId("z2h-outline")).toBeVisible();
    await expect(page.getByTestId("z2h-start")).toHaveAttribute("href", SQL_LAB);
    await expect(page.getByTestId("z2h-git-skill")).toContainText(/Skill path/i);
    await expect(page.getByTestId("z2h-fde-elective")).toHaveCount(1);
    await expect(page.getByTestId("z2h-fde-elective")).toHaveText("L6 Elective");
    await expect(page.getByText(CERT_SPINE)).toHaveCount(0);

    for (const id of ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const) {
      await expect(page.getByTestId(`z2h-level-${id}`)).toBeVisible();
    }
    await expect(page.getByTestId("z2h-level-L1").getByRole("link", { name: /SELECT, filters/i })).toHaveAttribute(
      "href",
      SQL_LAB,
    );
    await expect(
      page.getByTestId("z2h-level-L7").getByRole("link", { name: /Deduping and late data/i }),
    ).toHaveAttribute("href", "/training/sql/sql-deduping-late-data");
    await expectNoScoreOrComingSoon(page);
  });

  test("diagnostic halts on first wrong answer and hides scores", async ({ page }) => {
    await page.goto("/paths");
    const diagnostic = page.getByTestId("placement-diagnostic");
    await expect(diagnostic).toContainText(QUESTIONS[0].topic);
    await expect(diagnostic).toContainText(QUESTIONS[0].question);

    await diagnostic.getByTestId("placement-option").filter({ hasText: QUESTIONS[0].wrong }).click();

    await expect(page.getByTestId("placement-landing")).toHaveText("L1");
    await expect(page.getByTestId("placement-start")).toHaveAttribute("href", SQL_LAB);
    await expect(diagnostic).toContainText("Start at L1 · SQL");
    await expect(diagnostic).not.toContainText(QUESTIONS[1].topic);
    await expect(page.getByTestId("placement-override")).toBeVisible();
    await expectNoScoreOrComingSoon(page);
  });

  test("second miss lands L2; override stays open; retake resets", async ({ page }) => {
    await page.goto("/paths");
    const diagnostic = page.getByTestId("placement-diagnostic");
    await diagnostic.getByTestId("placement-option").filter({ hasText: QUESTIONS[0].correct }).click();

    await expect(diagnostic).toContainText(QUESTIONS[1].topic);
    await expect(diagnostic).not.toContainText(QUESTIONS[0].question);

    await diagnostic.getByTestId("placement-option").filter({ hasText: QUESTIONS[1].wrong }).click();

    await expect(page.getByTestId("placement-landing")).toHaveText("L2");
    await expect(page.getByTestId("placement-start")).toHaveAttribute(
      "href",
      "/training/python/python-none-dicts-rows#lab",
    );
    await expect(diagnostic.getByRole("heading", { name: /Start at L2 · Python/i })).toBeVisible();
    await expectNoScoreOrComingSoon(page);

    await page.getByTestId("placement-override-L4").click();
    await expect(page).toHaveURL(/\/training\/snowflake\/sf-day0-objects/);
    await expect(page.getByText(COMING_SOON)).toHaveCount(0);

    await page.goto("/paths");
    await expect(page.getByTestId("placement-landing")).toHaveText("L2");
    await page.getByTestId("placement-retake").click();
    await expect(page.getByTestId("placement-question")).toContainText(QUESTIONS[0].topic);
    await expect(page.getByTestId("placement-landing")).toHaveCount(0);
    await expectNoScoreOrComingSoon(page);
  });

  test("all six correct lands L7 without a numeric score", async ({ page }) => {
    await page.goto("/paths");
    for (const q of QUESTIONS) {
      const diagnostic = page.getByTestId("placement-diagnostic");
      await expect(diagnostic).toContainText(q.topic);
      await diagnostic.getByTestId("placement-option").filter({ hasText: q.correct }).click();
    }
    await expect(page.getByTestId("placement-landing")).toHaveText("L7");
    await expect(page.getByTestId("placement-start")).toHaveAttribute(
      "href",
      "/training/sql/sql-deduping-late-data",
    );
    await expect(page.getByRole("heading", { name: /Start at L7 · Interview/i })).toBeVisible();
    await expectNoScoreOrComingSoon(page);
  });
});

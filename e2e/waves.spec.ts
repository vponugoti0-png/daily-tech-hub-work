import { expect, test } from "@playwright/test";

const W1_SQL = "/training/sql/sql-joins-set-logic-recap";
const W1_DBX = "/training/databricks/dbx-workspace-cluster-basics";
const W1_SF = "/training/snowflake/sf-day0-objects";
const CAPSTONE = "/training/sql/sql-shared-capstone-checklist";

async function expectLessonChrome(
  page: import("@playwright/test").Page,
  title: RegExp,
) {
  await expect(page.locator("#learn")).toHaveText(title);
  await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
  await expect(page.locator(".tryit").first()).toBeVisible();
  const quiz = page.locator("#quiz");
  await quiz.scrollIntoViewIfNeeded();
  await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();
}

test.describe("W0–W4 training waves", () => {
  test("training index shows overlay, day-0 tracks, and shared capstone", async ({ page }) => {
    await page.goto("/training");

    await expect(page.getByRole("heading", { name: "Interactive course tracks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Suggested cert-style order/i })).toBeVisible();
    await expect(
      page.getByText(/CTEs → Windows → DQ → Incremental → Perf → Dimensional → Semi-structured/).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/contracts → config\/secrets → typing → testing → writers → orchestration → perf → packaging/)
        .first(),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Databricks (DBX)" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Snowflake", exact: true }).first()).toBeVisible();

    await expect(page.getByText(/Shared capstone · Orders → daily revenue mart/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Shared capstone checklist/i }).first(),
    ).toBeVisible();
  });

  test("SQL track lists day-0 joins and recommended order", async ({ page }) => {
    await page.goto("/training/sql");

    await expect(page.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(page.getByText(/Recommended order/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /DE joins & set-logic recap/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Shared capstone checklist/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Foundations exercise spine" })).toBeVisible();
  });

  test("W1 SQL day-0 lesson shows TryIt and quiz", async ({ page }) => {
    await page.goto(W1_SQL);
    await expectLessonChrome(page, /DE joins & set-logic recap/i);
    await expect(page.locator(".tryit")).toHaveCount(3);
    await expect(page.getByText(/INNER vs LEFT vs ANTI/i).first()).toBeVisible();
    await expect(page.getByText(/ANTI-join missing customers/i).first()).toBeVisible();
    const back = page.getByRole("link", { name: /Back to SQL for Analytics Engineering/i });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/training\/sql\/?$/);
  });

  test("W1 Databricks day-0 lesson shows TryIt and quiz", async ({ page }) => {
    await page.goto(W1_DBX);
    await expectLessonChrome(page, /Workspace & cluster basics/i);
    await expect(page.getByText(/job cluster/i).first()).toBeVisible();
    await expect(page.getByText(/day0-job-policy/i).first()).toBeVisible();
  });

  test("W1 Snowflake day-0 lesson shows TryIt and quiz", async ({ page }) => {
    await page.goto(W1_SF);
    await expectLessonChrome(page, /Databases, schemas & warehouses/i);
    await expect(page.getByText(/virtual warehouse/i).first()).toBeVisible();
  });

  test("shared capstone checklist is guest-usable", async ({ page }) => {
    await page.goto(CAPSTONE);
    await expectLessonChrome(page, /Shared capstone checklist/i);
    await expect(page.getByText(/Orders → late events → daily revenue mart/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Capstone — Dynamic Table mart/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /bronze→silver→gold Job/i })).toBeVisible();
  });

  test("search indexes W1 day-0 and capstone lessons", async ({ page }) => {
    await page.goto("/search?q=set-logic");
    await expect(page.getByRole("link", { name: /DE joins & set-logic recap/i })).toBeVisible();

    await page.goto("/search?q=all-purpose");
    await expect(page.getByRole("link", { name: /Workspace & cluster basics/i })).toBeVisible();

    await page.goto("/search?q=learn_wh");
    await expect(
      page.getByRole("link", { name: /Databases, schemas & warehouses/i }),
    ).toBeVisible();

    await page.goto("/search?q=daily+revenue+mart");
    await expect(page.getByRole("link", { name: /Shared capstone checklist/i })).toBeVisible();
  });

  test("search finds non-SF agent practice via tool-calling", async ({ page }) => {
    await page.goto("/search?q=databricks+assistant");
    await expect(
      page.getByRole("link", { name: /Practice with generic agents & Databricks Assistant/i }),
    ).toBeVisible();

    await page.goto("/search?q=tool-calling");
    await expect(
      page.getByRole("link", { name: /Practice with generic agents & Databricks Assistant/i }),
    ).toBeVisible();
  });
});

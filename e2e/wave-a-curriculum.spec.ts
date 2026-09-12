import { expect, test, type Page } from "@playwright/test";

/**
 * Thin Wave A curriculum carve: track → lesson → quiz for
 * Databricks 21–23 and Snowflake COPY history. No lab P1 / VFS / Wave B.
 */

const CASES = [
  {
    trackHref: "/training/databricks",
    trackTitle: "Databricks (DBX)",
    lessonHref: "/training/databricks/dbx-notebook-cell-types",
    title: /Notebook cell types/i,
    answers: [
      /Versioned sql \/ python cells/i,
      /SELECT \/ WITH against local DuckDB tables/i,
      /Human-readable context next to sql\/python/i,
    ],
  },
  {
    trackHref: "/training/databricks",
    trackTitle: "Databricks (DBX)",
    lessonHref: "/training/databricks/dbx-dbutils-notebook",
    title: /dbutils/i,
    answers: [
      /Reading a named job parameter/i,
      /Never — secrets examples are copy-only/i,
      /Widgets \/ Job parameters you can see in the run/i,
    ],
  },
  {
    trackHref: "/training/databricks",
    trackTitle: "Databricks (DBX)",
    lessonHref: "/training/databricks/dbx-delta-merge-deep",
    title: /Delta MERGE deep-dive/i,
    answers: [
      /An INNER JOIN on the MERGE key/i,
      /Insert leftover keys that pass the silver contract/i,
      /You can re-SELECT the exact keys the delete would hit/i,
    ],
  },
  {
    trackHref: "/training/snowflake",
    trackTitle: "Snowflake",
    lessonHref: "/training/snowflake/sf-copy-history-practice",
    title: /COPY history practice/i,
    answers: [
      /A tiny local stand-in so you can practice SELECT on load status/i,
      /Trigger a replay \/ investigation/i,
      /In a Snowflake worksheet \/ Task/i,
    ],
  },
] as const;

async function expectLessonChrome(page: Page, title: RegExp) {
  await expect(page.locator("#learn")).toHaveText(title);
  await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
  const quiz = page.locator("#quiz");
  await quiz.scrollIntoViewIfNeeded();
  await expect(quiz.getByRole("heading", { name: "Check your understanding" })).toBeVisible();
}

test.describe("Wave A curriculum carve — DBX 21–23 + SF COPY history", () => {
  for (const c of CASES) {
    test(`${c.lessonHref} — track → lesson → quiz`, async ({ page }) => {
      await page.goto(c.trackHref);
      await expect(page.getByRole("heading", { name: c.trackTitle, exact: true })).toBeVisible();
      await expect(page.locator(`a[href="${c.lessonHref}"]`).first()).toBeVisible();
      await page.locator(`a[href="${c.lessonHref}"]`).first().click();

      await expect(page).toHaveURL(new RegExp(`${c.lessonHref.replaceAll("/", "\\/")}$`));
      await expectLessonChrome(page, c.title);

      const quiz = page.locator("#quiz");
      await quiz.scrollIntoViewIfNeeded();
      const submit = quiz.getByRole("button", { name: "Submit answers" });
      await expect(submit).toBeDisabled();

      for (const answer of c.answers) {
        await quiz.getByRole("radio", { name: answer }).check();
      }
      await expect(submit).toBeEnabled();
      await submit.click();
      await expect(quiz.getByText("Score: 3/3")).toBeVisible();
    });
  }
});

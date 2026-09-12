import { expect, test, type Download } from "@playwright/test";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const L1 = [
  "sql-select-filter-nulls",
  "sql-patterns-aliases-case",
  "sql-aggregates-group-having",
  "sql-joins-set-logic-recap",
  "sql-exists-any-all",
  "sql-ddl-constraints",
  "sql-dml-write-path",
  "sql-dates-injection",
] as const;

const FINISH = "/paths/l1-complete";
const TRANSFER =
  "You can now filter, aggregate, and join. Staging and incremental loads are next.";
const LAST_L1 = "/training/sql/sql-dates-injection";
const PROGRESS_KEY = "dth-progress-v3";

function l1Lessons(complete: readonly string[] = L1) {
  const lessons: Record<string, { completed: boolean; updatedAt: string }> = {};
  for (const slug of complete) {
    lessons[`sql:${slug}`] = {
      completed: true,
      updatedAt: "2026-09-12T00:00:00.000Z",
    };
  }
  return { lessons };
}

async function seedProgress(
  page: import("@playwright/test").Page,
  complete: readonly string[] = L1,
) {
  await page.goto("/");
  await page.evaluate(
    ({ key, state }) => {
      localStorage.setItem(key, JSON.stringify(state));
      window.dispatchEvent(new Event("dth-progress"));
    },
    { key: PROGRESS_KEY, state: l1Lessons(complete) },
  );
}

async function readDownload(download: Download): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "aurora-dl-"));
  const dest = join(dir, download.suggestedFilename());
  await download.saveAs(dest);
  return readFile(dest, "utf8");
}

test.describe("Phase 1 Prompt F — L1 trophy + transcript", () => {
  test("last L1 next lands on the finish screen, not windows / SCD / ETL", async ({ page }) => {
    await page.goto(LAST_L1);
    const next = page.getByTestId("lesson-next-cta");
    await expect(next).toHaveAttribute("href", FINISH);
    await expect(page.getByTestId("lesson-next-footer")).toHaveAttribute("href", FINISH);
    await expect(next).toContainText(/L1 SQL trophy/i);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("finish screen after L1 mastery shows trophy, transfer sentence, and four metrics", async ({
    page,
  }) => {
    await seedProgress(page);
    await page.goto(FINISH);

    const finish = page.getByTestId("l1-finish");
    await expect(finish).toBeVisible();
    await expect(page.getByRole("heading", { name: "L1 SQL is complete" })).toBeVisible();
    await expect(page.getByTestId("transfer-sentence")).toHaveText(TRANSFER);
    await expect(page.getByTestId("l1-exercise")).toContainText(/Dirty orders → daily revenue/i);

    const metrics = page.getByTestId("l1-metrics");
    await expect(metrics).toBeVisible();
    await expect(page.getByTestId("l1-metric-freshness")).toBeVisible();
    await expect(page.getByTestId("l1-metric-volume")).toBeVisible();
    await expect(page.getByTestId("l1-metric-cost")).toBeVisible();
    await expect(page.getByTestId("l1-metric-failure")).toBeVisible();

    await expect(page.getByTestId("l1-readme")).toContainText("# gold.daily_revenue");
    await expect(page.getByTestId("l1-readme")).toContainText(/Grain is one row per paid order_date/i);
    await expect(page.getByTestId("l1-readme")).toContainText(/Dirty statuses stay out of this mart/i);

    await expect(page.getByTestId("l1-snippet")).toContainText("FROM aurora_orders");
    await expect(page.getByTestId("l1-snippet")).toContainText("daily_revenue");
    await expect(page.getByTestId("l1-finish-next")).toHaveAttribute(
      "href",
      "/training/python/python-none-dicts-rows#lab",
    );

    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.getByText(/\+XP|earn XP|badge inventory/i)).toHaveCount(0);
  });

  test("transfer sentence templates from the completed-slug array", async ({ page }) => {
    await seedProgress(page, ["sql-select-filter-nulls", "sql-joins-set-logic-recap"]);
    await page.goto(FINISH);
    await expect(page.getByTestId("transfer-sentence")).toHaveText(
      "You can now filter and join. Staging and incremental loads are next.",
    );
    await expect(page.getByRole("heading", { name: /Finish the eight SQL checkpoints/i })).toBeVisible();
    await expect(page.getByTestId("l1-remaining-sql-aggregates-group-having")).toBeVisible();
  });

  test("transcript download exports guest progress + completed slug ids", async ({ page }) => {
    await seedProgress(page);
    await page.goto(FINISH);
    await expect(page.getByTestId("transcript-download")).toBeVisible();

    const [jsonDl] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("transcript-download-json").click(),
    ]);
    expect(jsonDl.suggestedFilename()).toBe("aurora-transcript.json");
    const jsonText = await readDownload(jsonDl);
    const json = JSON.parse(jsonText) as {
      source: string;
      completedSlugIds: string[];
      lessons: Record<string, { completed: boolean }>;
    };
    expect(json.source).toBe("guest-progress");
    expect(json.completedSlugIds).toEqual([...L1]);
    for (const slug of L1) {
      expect(json.lessons[`sql:${slug}`]?.completed).toBe(true);
    }

    const [mdDl] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("transcript-download-md").click(),
    ]);
    expect(mdDl.suggestedFilename()).toBe("aurora-transcript.md");
    const md = await readDownload(mdDl);
    expect(md).toContain("# Aurora transcript");
    expect(md).toContain("Completed slug ids");
    expect(md).toContain("sql-select-filter-nulls");
    expect(md).toContain("sql-dates-injection");
    expect(md).toContain("guest progress");
  });

  test("home Continue after L1 mastery opens the trophy", async ({ page }) => {
    await seedProgress(page);
    await page.goto("/");
    await expect(page.getByTestId("home-continue-cta")).toHaveAttribute("href", FINISH);
    await expect(page.getByTestId("home-continue")).toContainText(/L1 complete|Open your trophy/i);
  });
});

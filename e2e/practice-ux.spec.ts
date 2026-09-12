import { expect, test } from "@playwright/test";

const SQL_SELECT = "/training/sql/sql-select-filter-nulls";
const PY_NONE = "/training/python/python-none-dicts-rows";
const PY_CONTRACTS = "/training/python/python-dataframe-contracts";
const AI_PRACTICE = "/training/ai-data-eng/ai-de-practice-agents";
const FDE = "/training/forward-deployed/fde-what-an-fde-is";
const PROGRESS_KEY = "dth-progress-v3";

const CRAWL = [
  SQL_SELECT,
  "/training/databricks/dbx-spark-select-nulls",
  "/training/snowflake/sf-select-filter-nulls",
  PY_NONE,
  PY_CONTRACTS,
  AI_PRACTICE,
  FDE,
  "/training/git/git-rebase-vs-merge",
];

test.describe("Practice UX — layout, editor Run, Python lab", () => {
  test("SQL lesson order is Cheat sheet → Try it → Local lab", async ({ page }) => {
    await page.goto(SQL_SELECT);

    await expect(page.getByRole("heading", { name: "Cheat sheet" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Try it", exact: true }).or(page.locator(".tryit").first())).toBeVisible();
    await expect(page.locator("#cheat-sheet")).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.locator("#lab")).toBeVisible();

    const order = await page.evaluate(() => {
      const cheat = document.getElementById("cheat-sheet");
      const tryit = document.querySelector("article .tryit");
      const lab = document.getElementById("lab");
      if (!cheat || !tryit || !lab) return [];
      const all = [cheat, tryit, lab];
      return [...all]
        .sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          return 0;
        })
        .map((el) => (el.id === "lab" ? "lab" : el.id === "cheat-sheet" ? "cheat" : "tryit"));
    });
    expect(order).toEqual(["cheat", "tryit", "lab"]);
  });

  test("SQL TryIt editor edit → Run loads the lab and returns rows", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(SQL_SELECT);

    const tryit = page.locator(".tryit").first();
    const editor = tryit.getByLabel("Try it editor");
    await expect(editor).toBeVisible();
    const original = await editor.inputValue();
    expect(original.length).toBeGreaterThan(10);
    const edited = original.includes("LIMIT 5")
      ? original.replace("LIMIT 5", "LIMIT 2")
      : `${original.replace(/;+\s*$/, "")}\nLIMIT 2`;
    await editor.fill(edited);

    await tryit.getByRole("button", { name: "Run in local lab" }).click();

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByLabel("SQL to run")).toHaveValue(/LIMIT 2/i);
    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();
  });

  test("Python local lab runs a sample and saves guest stepIndex", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${PY_NONE}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText(/Pyodide · in-browser/i)).toBeVisible();
    await expect(lab.getByText(/Not a live Databricks \/ cloud Python/i)).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    await lab.getByRole("button", { name: "Run Python sample" }).click();
    const result = lab.getByLabel("Python result");
    await expect(result).toBeVisible({ timeout: 90_000 });
    await expect(result).toContainText(/1|order_id|paid|None/i);
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["python:python-none-dicts-rows"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);
  });

  test("Python TryIt Run syncs the editor into the lab", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(PY_NONE);

    const tryit = page.locator(".tryit").first();
    const editor = tryit.getByLabel("Try it editor");
    await expect(editor).toBeVisible();
    await editor.fill('rows = [{"promo_code": None}, {"promo_code": "VIP"}]\nprint(sum(1 for r in rows if r["promo_code"] is None))');
    await tryit.getByRole("button", { name: "Run in local lab" }).click();

    const lab = page.locator("#lab");
    await expect(lab.getByLabel("Python to run")).toHaveValue(/promo_code is None/);
    const result = lab.getByLabel("Python result");
    await expect(result).toBeVisible({ timeout: 90_000 });
    await expect(result).toContainText("1");
  });

  test("copy-only pages never show a fake Run or Coming soon", async ({ page }) => {
    await page.goto(PY_CONTRACTS);
    const tryit = page.locator(".tryit").first();
    await expect(tryit.getByRole("button", { name: /Copy to practice/i })).toBeVisible();
    await expect(tryit.getByRole("button", { name: /Run in local lab/i })).toHaveCount(0);
    await expect(page.locator("#lab")).toHaveCount(0);
  });

  test("learner UI crawl has no Coming soon / will arrive / isn’t ready", async ({ page }) => {
    for (const url of CRAWL) {
      await page.goto(url);
      await expect(page.getByText(/Coming soon|will arrive|isn[’']t ready/i)).toHaveCount(0);
    }
  });
});

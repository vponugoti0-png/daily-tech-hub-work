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
  test("SQL lesson order is Learn → Example → Practice → Quiz", async ({ page }) => {
    await page.goto(SQL_SELECT);

    await expect(page.locator("#learn")).toBeVisible();
    await expect(page.locator("#example")).toBeVisible();
    await expect(page.locator("#lab")).toBeVisible();
    await expect(page.locator("#quiz")).toBeVisible();

    const order = await page.evaluate(() => {
      const ids = ["learn", "example", "lab", "quiz"] as const;
      const nodes = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));
      return [...nodes]
        .sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          return 0;
        })
        .map((el) => el.id);
    });
    expect(order).toEqual(["learn", "example", "lab", "quiz"]);
  });

  test("SQL Example Load fills the single #lab editor and Run returns rows", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(SQL_SELECT);

    const example = page.locator("#example");
    await expect(example.locator("textarea")).toHaveCount(0);
    await example.getByRole("button", { name: "Run in local lab" }).click();

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    const editor = lab.getByLabel("SQL to run");
    await expect(editor).toHaveValue(/LIMIT 5/i);
    await editor.click();
    await editor.evaluate((el) => {
      const node = el as HTMLTextAreaElement;
      const idx = node.value.lastIndexOf("LIMIT 5");
      node.focus();
      if (idx >= 0) node.setSelectionRange(idx + 6, idx + 7);
    });
    await page.keyboard.type("2");
    await expect(editor).toHaveValue(/LIMIT 2/i);
    await lab.getByRole("button", { name: "Run SQL sample" }).click();
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

  test("Python Example Load fills the single #lab editor", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(PY_NONE);

    const example = page.locator("#example");
    await expect(example.locator("textarea")).toHaveCount(0);
    await example.getByRole("button", { name: "Run in local lab" }).click();

    const lab = page.locator("#lab");
    const editor = lab.getByLabel("Python to run");
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.evaluate((el) => {
      const node = el as HTMLTextAreaElement;
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    });
    await editor.pressSequentially('\nprint("aurora-lab-ok")', { delay: 15 });
    await expect(editor).toHaveValue(/aurora-lab-ok/);
    await lab.getByRole("button", { name: "Run Python sample" }).click();
    const result = lab.getByLabel("Python result");
    await expect(result).toBeVisible({ timeout: 90_000 });
    await expect(result).toContainText("aurora-lab-ok");
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

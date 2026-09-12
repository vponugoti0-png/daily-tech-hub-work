import { expect, test } from "@playwright/test";

const TRACK = "/training/sql";
const SELECT = "/training/sql/sql-ex-select-syntax";
const WHERE = "/training/sql/sql-ex-where-logic";
const DML = "/training/sql/sql-ex-dml-mutations";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("SQL foundations local practice lab", () => {
  test("track Practice CTA opens the foundations local lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Foundations exercise spine" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /SELECT, DISTINCT, and statement shape/i })).toBeVisible();
    await expect(page.getByText(/Select\/syntax → WHERE → ORDER\/LIMIT/i).first()).toBeVisible();

    const practice = page.getByRole("link", { name: /Practice · local lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/sql\/sql-ex-select-syntax#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText(/Coming soon: connect workspace/i)).toBeVisible();
    await expect(lab.getByText(/Not a live warehouse/i)).toBeVisible();
  });

  test("open lab → run sample → see result → guest progress persists", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${SELECT}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/lab_customers/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(
      table.getByRole("columnheader", { name: /customer_id|company|city|region/i }).first(),
    ).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["sql:sql-ex-select-syntax"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
    const storedAgain = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(storedAgain).toContain("sql-ex-select-syntax");
  });

  test("WHERE lesson hosts the lab; DML stays copy-only; reading is not gated", async ({ page }) => {
    await page.goto(WHERE);

    await expect(page.locator("#learn")).toHaveText(/WHERE, AND, OR, and NOT/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();

    await page.goto(DML);
    await expect(page.locator("#learn")).toHaveText(/INSERT, UPDATE, and DELETE/i);
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByText(/local lab stays SELECT/i).first()).toBeVisible();
  });

  test("does not add a top-level Lab nav; DE joins and Python stay lab-free", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);

    await page.goto("/training/sql/sql-joins-set-logic-recap");
    await expect(page.locator("#lab")).toHaveCount(0);

    await page.goto("/training/python/python-dataframe-contracts");
    await expect(page.locator("#lab")).toHaveCount(0);
  });

  test("search indexes foundation topics", async ({ page }) => {
    await page.goto("/search?q=select+distinct");
    await expect(
      page.getByRole("link", { name: /SELECT, DISTINCT, and statement shape/i }),
    ).toBeVisible();

    await page.goto("/search?q=sql+injection");
    await expect(
      page.getByRole("link", { name: /Injection awareness, hosting, and types/i }),
    ).toBeVisible();
  });
});

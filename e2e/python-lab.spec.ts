import { expect, test } from "@playwright/test";

const TRACK = "/training/python";
const NONE = "/training/python/python-none-dicts-rows";
const CONTRACTS = "/training/python/python-dataframe-contracts";
const ETL = "/training/python/python-etl-pipeline-builder";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Python local practice lab (Pyodide)", () => {
  test("track Practice CTA opens the None/dicts local lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "Python for Data Engineers" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · local lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/python\/python-none-dicts-rows#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText("Pyodide", { exact: true })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByText(/Not a live notebook or remote kernel/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /How to practice/i }).first()).toHaveAttribute(
      "href",
      "#lab",
    );
  });

  test("open lab → run sample → see result → guest progress persists", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${NONE}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.locator("#tryit")).toBeVisible();
    await expect(lab.getByLabel("Python sample", { exact: true })).toBeVisible();
    await expect(lab.getByLabel("Python to run")).toBeVisible();

    await lab.getByRole("button", { name: "Run Python sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 90_000 });
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["python:python-none-dicts-rows"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
  });

  test("contracts lesson hosts the lab; ETL builder stays copy-only", async ({ page }) => {
    await page.goto(CONTRACTS);
    await expect(page.locator("#learn")).toHaveText(/DataFrame contracts/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();

    await page.goto(ETL);
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Run in local lab/i })).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    const tryit = page.locator("#tryit");
    await expect(tryit.getByRole("button", { name: /Copy to practice/i })).toBeVisible();
  });

  test("does not add a top-level Lab nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);
  });
});

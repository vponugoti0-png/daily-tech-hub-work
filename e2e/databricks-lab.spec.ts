import { expect, test } from "@playwright/test";

const TRACK = "/training/databricks";
const DAY0 = "/training/databricks/dbx-workspace-cluster-basics";
const LAKEHOUSE = "/training/databricks/dbx-lakehouse-fundamentals";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Databricks local practice lab v1", () => {
  test("track Practice CTA opens the day-0 local lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "Databricks (DBX)" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · local lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/databricks\/dbx-workspace-cluster-basics#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText(/Coming soon: connect workspace/i)).toBeVisible();
    await expect(lab.getByText(/Not a live Databricks workspace/i)).toBeVisible();
  });

  test("open lab → run sample → see result → guest progress persists", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${DAY0}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/day0-job-policy/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(table.getByRole("columnheader", { name: /catalog|layer|row_count|table_name/i }).first()).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["databricks:dbx-workspace-cluster-basics"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
    const storedAgain = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(storedAgain).toContain("dbx-workspace-cluster-basics");
  });

  test("lakehouse lesson also hosts the lab; reading is not gated", async ({ page }) => {
    await page.goto(LAKEHOUSE);

    await expect(page.locator("#learn")).toHaveText(/Lakehouse fundamentals/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("does not add a top-level Lab nav item or a SQL-track lab", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Training" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);

    await page.goto("/training/sql/sql-joins-set-logic-recap");
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByText("Local practice lab")).toHaveCount(0);
  });
});

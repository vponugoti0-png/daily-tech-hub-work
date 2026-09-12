import { expect, test } from "@playwright/test";

const TRACK = "/training/python";
const PY_NONE = "/training/python/python-none-dicts-rows";
const PY_CONTRACTS = "/training/python/python-dataframe-contracts";
const PY_COPY = "/training/python/python-testing-spark-logic";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Python local practice lab — file editor + VFS", () => {
  test("track Practice CTA opens the None/dicts local lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "Python for Data Engineers" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · local lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/python\/python-none-dicts-rows#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByText(/Not a live Databricks \/ cloud Python/i)).toBeVisible();
    await expect(lab.getByText(/\/data\//i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /How to practice/i }).first()).toHaveAttribute(
      "href",
      "#lab",
    );
  });

  test("open lab → edit → run → see output; guest stepIndex", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${PY_NONE}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab.getByText(/Pyodide · in-browser/i)).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

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

  test("data file tab is readable and csv sample prints rows", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${PY_CONTRACTS}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(lab).toHaveAttribute("data-lab-ready", "1");
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    await expect(lab.getByLabel("Python to run")).toBeVisible();
    const csvTab = lab.getByRole("tab", { name: "orders.csv", exact: true });
    await expect(csvTab).toBeVisible();
    await csvTab.click();
    await expect(csvTab).toHaveAttribute("aria-selected", "true");
    const dataEditor = lab.getByLabel("Lab file orders.csv");
    await expect(dataEditor).toBeVisible();
    await expect(dataEditor).toHaveValue(/order_id,status,amount/);
    await expect(dataEditor).toHaveValue(/1001,paid,42.50,FALL26/);
    await expect(lab.getByText(/Seeded VFS/)).toBeVisible();
    await expect(
      lab.getByRole("region", { name: "Lab files" }).getByText("/data/orders.csv", { exact: true }),
    ).toBeVisible();

    await lab.getByRole("tab", { name: "main.py", exact: true }).click();
    await lab.getByLabel("Python sample", { exact: true }).selectOption({ label: "Read /data/orders.csv" });
    await expect(lab.getByLabel("Python to run")).toHaveValue(/\/data\/orders\.csv/);

    await lab.getByRole("button", { name: "Run Python sample" }).click();
    const result = lab.getByLabel("Python result");
    await expect(result).toBeVisible({ timeout: 90_000 });
    await expect(result).toContainText(/1001|paid|42/);
  });

  test("contracts TryIt Run syncs into the lab; Spark-test stays copy-only", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(PY_CONTRACTS);

    const tryit = page.locator(".tryit").first();
    await expect(tryit.getByRole("button", { name: "Run in local lab" })).toBeVisible();
    await tryit.getByRole("button", { name: "Run in local lab" }).click();

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    const result = lab.getByLabel("Python result");
    await expect(result).toBeVisible({ timeout: 90_000 });
    await expect(result).toContainText(/1001|paid|rows|order_id/i);

    await page.goto(PY_COPY);
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    const copyTry = page.locator(".tryit").first();
    await expect(copyTry.getByRole("button", { name: /Copy to practice/i })).toBeVisible();
    await expect(copyTry.getByRole("button", { name: /Run in local lab/i })).toHaveCount(0);
  });
});

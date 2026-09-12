import { expect, test } from "@playwright/test";

const TRACK = "/training/snowflake";
const DAY0 = "/training/snowflake/sf-day0-objects";
const ARCH = "/training/snowflake/sf-architecture";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Snowflake local practice lab v1", () => {
  test("track Practice CTA opens the day-0 local lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "Snowflake", exact: true })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · local lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/snowflake\/sf-day0-objects#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByText(/Not a live Snowflake account/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /How to practice/i }).first()).toHaveAttribute(
      "href",
      "#lab",
    );
  });

  test("open lab → run sample → see result → guest progress persists", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`${DAY0}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/learn_wh/i).first()).toBeVisible();

    await lab.getByRole("button", { name: "Run SQL sample" }).click();

    const table = lab.getByRole("table", { name: "Query result" });
    await expect(table).toBeVisible({ timeout: 45_000 });
    await expect(
      table.getByRole("columnheader", { name: /database|schema|object_name|name|size/i }).first(),
    ).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["snowflake:sf-day0-objects"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
    const storedAgain = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(storedAgain).toContain("sf-day0-objects");
  });

  test("architecture lesson also hosts the lab; reading is not gated", async ({ page }) => {
    await page.goto(ARCH);

    await expect(page.locator("#learn")).toHaveText(/Snowflake architecture/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Local practice lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("does not add a top-level Lab nav or a Python-track lab", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);

    await page.goto("/training/python/python-dataframe-contracts");
    await expect(page.locator("#lab")).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";

const TRACK = "/training/git";
const REBASE = "/training/git/git-rebase-vs-merge";
const HYGIENE = "/training/git/git-commit-hygiene";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Git Play Lab", () => {
  test("track Practice CTA opens the rebase lesson lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "Git (bonus)" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · Git Play Lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/git\/git-rebase-vs-merge#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(lab.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByText(/no VM/i).first()).toBeVisible();
    await expect(lab.getByRole("textbox", { name: "Git command" })).toBeVisible();
  });

  test("open lab → run a command → progress persists", async ({ page }) => {
    await page.goto(`${REBASE}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByRole("img", { name: /Commit graph/i })).toBeVisible();

    await lab.getByRole("textbox", { name: "Git command" }).fill('git commit -m "feat(marts): late-arriving orders"');
    await lab.getByRole("button", { name: "Run git command" }).click();

    await expect(lab.getByText(/\[C\d+[']*\] feat\(marts\): late-arriving orders/)).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();
    await expect(lab.getByRole("img", { name: /Commit graph/i })).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["git:git-rebase-vs-merge"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
    const storedAgain = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(storedAgain).toContain("git-rebase-vs-merge");
  });

  test("hygiene lesson hosts the lab; cheat sheet → practice → quiz; reading is not gated", async ({
    page,
  }) => {
    await page.goto(HYGIENE);

    await expect(page.locator("#learn")).toHaveText(/Commit hygiene for data PRs/i);
    await expect(page.getByRole("heading", { name: "Objectives" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cheat sheet" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Git Play Lab/i }).first()).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("does not add a top-level Lab nav or a Python-track lab", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);

    await page.goto("/training/python/python-performance-de");
    await expect(page.locator("#lab")).toHaveCount(0);
  });
});

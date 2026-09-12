import { expect, test } from "@playwright/test";

const TRACK = "/training/git";
const HUB = "/training/git/git-play-lab";
const BRANCH = "/training/git/git-branching-dbt-sql";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Git Play Lab (Product A)", () => {
  test("track Practice CTA opens the in-browser lab", async ({ page }) => {
    await page.goto(TRACK);

    await expect(page.getByRole("heading", { name: "Git (bonus)" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · Git Play Lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/git\/git-play-lab#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(lab.getByText(/In-browser model/i)).toBeVisible();
    await expect(lab.getByText(/Not a real git repo/i)).toBeVisible();
    await expect(lab.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByRole("img", { name: /HEAD on branch main/i }).first()).toBeVisible();
  });

  test("open level → commands → goal pass → guest progress persists", async ({ page }) => {
    await page.goto(`${HUB}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(page.locator(".tryit").first()).toBeVisible();
    await expect(lab.getByLabel("Git Play Lab level")).toHaveValue("commit-mart");

    await expect(lab.getByText(/HEAD is on main/i)).toBeVisible();
    await lab.getByLabel("Git command").fill('git commit -m "feat(marts): add orders_daily grain"');
    await lab.getByRole("button", { name: "Run command" }).click();

    await expect(lab.getByText(/Goal passed — Land a mart commit/i)).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();
    await expect(lab.getByText(/main has a new commit after init/i)).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["git:git-play-lab"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);

    await page.reload();
    await expect(page.locator("#lab").getByText(/Lab step saved on this device/i)).toBeVisible();
    const storedAgain = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(storedAgain).toContain("git-play-lab");
  });

  test("training index card and cheat sheet → practice → quiz", async ({ page }) => {
    await page.goto("/training");
    await expect(page.getByRole("heading", { name: "Interactive course tracks" })).toBeVisible();
    await expect(page.getByText(/Git Play Lab · Product A/i)).toBeVisible();
    await page.getByRole("link", { name: /Open Git Play Lab/i }).click();

    await expect(page).toHaveURL(/\/training\/git\/git-play-lab#lab/);
    await expect(page.locator("#learn")).toHaveText(/Git Play Lab/i);
    await expect(page.getByRole("heading", { name: "Cheat sheet" })).toBeVisible();
    await expect(page.locator("#lab").getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(page.locator("#quiz").getByRole("heading", { name: "Check your understanding" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark complete/i })).toBeEnabled();
  });

  test("dbt branching lesson hosts the lab; TryIt does not say Coming soon", async ({ page }) => {
    await page.goto(BRANCH);

    await expect(page.locator("#learn")).toHaveText(/Branching for dbt\/SQL repos/i);
    await expect(page.locator("#lab").getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(page.getByText(/Coming soon · live Run/i)).toHaveCount(0);
    const tryItLab = page.getByRole("link", { name: /Open Git Play Lab/i }).first();
    await expect(tryItLab).toBeVisible();
    await tryItLab.click();
    await expect(page.locator("#lab").getByRole("heading", { name: "Git Play Lab" })).toBeVisible();
    await expect(page.locator("#lab").getByLabel("Git Play Lab level")).toHaveValue("branch-dbt");
  });

  test("does not add a top-level Lab nav or a Practice VM", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /^Lab$/i })).toHaveCount(0);

    await page.goto(`${HUB}#lab`);
    await expect(page.getByText(/Practice VM/i).first()).toBeVisible();
    await expect(page.locator("#lab").getByText(/no VM/i)).toBeVisible();
    await expect(page.locator("#lab")).not.toContainText("Coming soon");
  });
});

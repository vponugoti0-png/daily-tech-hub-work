import { expect, test } from "@playwright/test";

const SQL_LAB = "/training/sql/sql-select-filter-nulls#lab";
const NAV_ITEMS = [
  { label: "Learn", href: /\/training\/?$/ },
  { label: "Practice", href: /\/practice\/?$/ },
  { label: "Paths", href: /\/paths\/?$/ },
  { label: "Progress", href: /\/dashboard\/?$/ },
] as const;

const GONE = ["Today", "Shortcuts", "News", "Releases", "Training"];

test.describe("Phase 1 Prompt A — IA / door & navigation", () => {
  test("primary nav is exactly Learn / Practice / Paths / Progress", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Primary" });
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(4);

    for (const item of NAV_ITEMS) {
      await expect(nav.getByRole("link", { name: item.label, exact: true })).toBeVisible();
    }
    for (const label of GONE) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveCount(0);
    }

    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);

    for (const item of NAV_ITEMS) {
      await page.goto("/");
      await nav.getByRole("link", { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(item.href);
    }
  });

  test("hero and StartHere CTAs open the SQL lab, not PE", async ({ page }) => {
    await page.goto("/");

    const start = page.getByTestId("start-here-cta");
    await expect(start).toHaveAttribute("href", SQL_LAB);
    await start.click();
    await expect(page).toHaveURL(/\/training\/sql\/sql-select-filter-nulls/);
    await expect(page.locator("#lab")).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("home Continue is first-run without progress and Continue with progress", async ({
    page,
  }) => {
    await page.goto("/");
    const first = page.getByTestId("home-continue-cta");
    await expect(first).toBeVisible();
    await expect(first).toHaveAttribute("href", SQL_LAB);
    await expect(page.getByTestId("home-continue")).toContainText(/Start Zero→Hero|Open the SQL lab/i);

    await page.evaluate(() => {
      localStorage.setItem(
        "dth-progress-v3",
        JSON.stringify({
          lessons: {
            "sql:sql-select-filter-nulls": {
              completed: true,
              updatedAt: "2026-09-12T00:00:00.000Z",
            },
          },
        }),
      );
      window.dispatchEvent(new Event("dth-progress"));
    });

    await expect(page.getByTestId("home-continue")).toContainText(/Continue/i);
    await expect(page.getByTestId("home-continue-cta")).toHaveAttribute(
      "href",
      "/training/sql/sql-patterns-aliases-case#lab",
    );
  });

  test("Learn hub: next step, one path, quiet tracks, one Open Practice", async ({ page }) => {
    await page.goto("/training");

    await expect(page.getByRole("heading", { name: "Your school" })).toBeVisible();
    await expect(page.getByTestId("learn-next-step")).toBeVisible();
    await expect(page.getByTestId("learn-path-card")).toBeVisible();
    await expect(page.getByTestId("learn-path-card")).toHaveAttribute(
      "href",
      "/paths/zero-to-hero",
    );

    const practice = page.getByTestId("training-practice-labs");
    await expect(practice.getByTestId("open-practice")).toHaveCount(1);
    await expect(practice.getByTestId("open-practice")).toHaveAttribute("href", SQL_LAB);
    await expect(practice.getByRole("link", { name: /Practice · /i })).toHaveCount(0);

    await expect(page.getByRole("heading", { name: /Suggested cert-style order/i })).toHaveCount(0);
    await expect(page.getByText(/Start here · Practice with agents/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Extract → transform → load/i })).toHaveCount(0);

    const index = page.getByTestId("training-track-index");
    await expect(index.getByRole("heading", { name: "SQL for Analytics Engineering" })).toBeVisible();
    await expect(index.getByRole("heading", { name: "Python for Data Engineers" })).toBeVisible();

    const electives = page.getByTestId("learn-electives");
    await expect(electives.getByRole("heading", { name: "Prompt Engineering", exact: true })).toBeVisible();
    await expect(electives.getByRole("heading", { name: "AI for Data Engineers", exact: true })).toBeVisible();
    await expect(electives.getByRole("heading", { name: "Forward Deployed Engineer", exact: true })).toBeVisible();
    await expect(electives.getByText("Elective", { exact: true })).toHaveCount(3);

    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.getByText(/\b13-select\b|\bLesson 13\b/i)).toHaveCount(0);
  });

  test("/practice and /paths are non-empty and never Coming soon", async ({ page }) => {
    await page.goto("/practice");
    await expect(page.getByRole("heading", { name: "Your practice desk" })).toBeVisible();
    await expect(page.getByTestId("practice-open-lab")).toHaveAttribute("href", SQL_LAB);
    await expect(page.getByTestId("practice-dialect-tabs").getByRole("link")).toHaveCount(4);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    await page.goto("/paths");
    await expect(page.getByRole("heading", { name: "One school, two doors" })).toBeVisible();
    await expect(page.getByTestId("paths-zero-to-hero")).toBeVisible();
    await expect(page.getByTestId("paths-outline").getByRole("link")).toHaveCount(8);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    await page.getByTestId("paths-zero-to-hero").click();
    await expect(page).toHaveURL(/\/paths\/zero-to-hero/);
    await expect(page.getByTestId("z2h-outline")).toBeVisible();
    await expect(page.getByTestId("z2h-start")).toHaveAttribute("href", SQL_LAB);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("demoted routes still resolve for deep links", async ({ page }) => {
    await page.goto("/shortcuts");
    await expect(page.getByRole("heading", { name: /Commands, keys/i })).toBeVisible();

    await page.goto("/news");
    await expect(page.getByRole("heading", { name: /Curated digest/i })).toBeVisible();

    await page.goto("/releases");
    await expect(page.getByRole("heading", { name: /Release briefs/i })).toBeVisible();
  });
});

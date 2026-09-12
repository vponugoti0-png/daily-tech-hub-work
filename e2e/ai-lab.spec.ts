import { expect, test } from "@playwright/test";

const PE_TRACK = "/training/prompt-engineering";
const PE_L1 = "/training/prompt-engineering/pe-ask-better-questions";
const AI_AGENTS = "/training/ai-data-eng/ai-de-practice-agents";
const FDE = "/training/forward-deployed/fde-what-an-fde-is";
const PY_CONTRACTS = "/training/python/python-dataframe-contracts";
const PROGRESS_KEY = "dth-progress-v3";

test.describe("Wave B1 — AI Local practice", () => {
  test("PE track Practice CTA opens Local practice", async ({ page }) => {
    await page.goto(PE_TRACK);

    await expect(page.getByRole("heading", { name: "Prompt Engineering" })).toBeVisible();
    const practice = page.getByRole("link", { name: /Practice · Prompt lab/i });
    await expect(practice).toBeVisible();
    await practice.click();

    await expect(page).toHaveURL(/\/training\/prompt-engineering\/pe-ask-better-questions#lab/);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice" })).toBeVisible();
    await expect(lab.getByText(/Not a live Claude or GPT/i)).toBeVisible();
    await expect(lab.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(lab.getByRole("button", { name: /^Copy$/i })).toBeVisible();
  });

  test("PE lesson: edit → Check prompt → guest stepIndex; Copy stays", async ({ page }) => {
    await page.goto(`${PE_L1}#lab`);

    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice" })).toBeVisible();
    await expect(lab.getByText(/Checklist · in-browser/i)).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    const editor = lab.getByLabel("Prompt to check");
    await expect(editor).toBeVisible();
    await editor.fill(
      [
        "Goal: Explain Snowflake warehouses vs databases to a junior DE.",
        "Context: I am new; we have one virtual warehouse named learn_wh.",
        "Constraints: no secrets, no DROP, under 200 words, plain language.",
        "Output format: 4-row comparison table plus 3 bullets.",
      ].join("\n"),
    );

    await lab.getByRole("button", { name: "Check prompt against lesson checklist" }).click();

    const rubric = lab.getByTestId("ai-rubric");
    await expect(rubric).toBeVisible();
    await expect(rubric.getByRole("status")).toContainText(/Checklist met|Checklist \d+\/\d+/i);
    await expect(lab.getByLabel("Practice sketch")).toContainText(/not a live Claude or GPT/i);
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();
    await expect(lab.getByRole("button", { name: /^Copy$/i })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    const stored = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as {
      lessons: Record<string, { stepIndex?: number; completed?: boolean }>;
    };
    const lesson = parsed.lessons["prompt-engineering:pe-ask-better-questions"];
    expect(lesson?.stepIndex).toBe(1);
    expect(lesson?.completed).not.toBe(true);
  });

  test("Example Load fills Local practice without a second textarea", async ({ page }) => {
    await page.goto(PE_L1);

    const example = page.locator("#example");
    await expect(example.getByText(/Local practice below/i).first()).toBeVisible();
    await expect(example.locator("textarea")).toHaveCount(0);
    await example.getByRole("button", { name: "Run in local practice" }).click();

    const lab = page.locator("#lab");
    await expect(lab.getByLabel("Prompt to check")).toHaveValue(/Goal:/i);
    await expect(lab.getByTestId("ai-rubric")).toBeVisible();
    await expect(example.getByRole("button", { name: /^Copy$/i })).toBeVisible();
  });

  test("AI-for-DE agents lesson hosts Local practice; no Coming soon", async ({ page }) => {
    await page.goto(AI_AGENTS);

    await expect(page.locator("#learn")).toHaveText(/Practice with agents & Cortex functions/i);
    const lab = page.locator("#lab");
    await expect(lab.getByRole("heading", { name: "Local practice" })).toBeVisible();
    await expect(lab.getByText(/Not a live Claude or GPT/i)).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    await expect(page.locator(".tryit").first().getByRole("button", { name: /^Copy$/i })).toBeVisible();

    await lab.getByRole("button", { name: "Check prompt against lesson checklist" }).click();
    await expect(lab.getByTestId("ai-rubric")).toBeVisible();
    await expect(lab.getByText(/Lab step saved on this device/i)).toBeVisible();
  });

  test("copy-only pages stay copy-only; FDE has no AI runtime chrome", async ({ page }) => {
    await page.goto(PY_CONTRACTS);
    await expect(page.locator(".tryit").first().getByRole("button", { name: /Copy to practice/i })).toBeVisible();
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    await page.goto(FDE);
    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Local practice" })).toHaveCount(0);
    await expect(page.locator(".tryit").first().getByRole("button", { name: /Copy to practice/i })).toBeVisible();
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });
});

import { expect, test } from "@playwright/test";

test.describe("auth form a11y", () => {
  test("login inputs have ids and associated labels", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    const email = page.getByLabel("Email");
    const password = page.getByLabel("Password");
    await expect(email).toHaveAttribute("id", "login-email");
    await expect(password).toHaveAttribute("id", "login-password");
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator('label[for="login-email"]')).toBeVisible();
    await expect(page.locator('label[for="login-password"]')).toBeVisible();
  });

  test("failed login surfaces a role=alert", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();

    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Next.js also mounts an empty #__next-route-announcer__ with role=alert.
    const alert = page.getByRole("alert").filter({ hasText: /./ });
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(
      /invalid email or password|login failed|csrf|forbidden|network/i,
    );
  });

  test("signup inputs have ids and associated labels", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await expect(page.getByLabel("Name")).toHaveAttribute("id", "signup-name");
    await expect(page.getByLabel("Email")).toHaveAttribute("id", "signup-email");
    await expect(page.getByLabel(/Password/)).toHaveAttribute("id", "signup-password");
    await expect(page.locator("#signup-name")).toBeVisible();
    await expect(page.locator("#signup-email")).toBeVisible();
    await expect(page.locator("#signup-password")).toBeVisible();
    await expect(page.locator('label[for="signup-name"]')).toBeVisible();
    await expect(page.locator('label[for="signup-email"]')).toBeVisible();
    await expect(page.locator('label[for="signup-password"]')).toBeVisible();
  });
});

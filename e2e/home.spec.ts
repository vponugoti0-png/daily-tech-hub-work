import { expect, test } from "@playwright/test";

test.describe("homepage hero", () => {
  test("loads and RelativeUpdated region renders without hydration #418", async ({
    page,
  }) => {
    const hydrationProblems: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        /Minified React error #418/i.test(text) ||
        /Hydration failed/i.test(text) ||
        /did not match the client/i.test(text)
      ) {
        hydrationProblems.push(text);
      }
    });
    page.on("pageerror", (err) => {
      if (/#418|hydrat/i.test(err.message)) hydrationProblems.push(err.message);
    });

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Daily Tech Hub v3/i }),
    ).toBeVisible();
    await expect(page.getByText(/Today ·/)).toBeVisible();

    // Hero “updated” cluster: SSR paints an absolute datetime; after mount it
    // may switch to relative time (“ago”) plus the same UTC stamp on sm+.
    const hero = page.locator("section").filter({ hasText: "Aurora Play Lab" });
    await expect(hero.getByText(/UTC|ago|just now|less than a minute/i)).toBeVisible();

    await expect(hydrationProblems, hydrationProblems.join("\n")).toEqual([]);
  });
});

import { expect, type Locator } from "@playwright/test";

/** Result cells must be text nodes — no `"12.50"` / `\"west\"` JSON chrome. */
export async function expectCleanLabCells(table: Locator, exactValues: string[]) {
  for (const value of exactValues) {
    const cell = table.locator("tbody td").filter({ hasText: new RegExp(`^${escapeRegExp(value)}$`) });
    await expect(cell.first()).toHaveText(value);
  }
  await expectNoLabEscapeChrome(table);
}

export async function expectNoLabEscapeChrome(table: Locator) {
  const texts = await table.locator("tbody td").allTextContents();
  expect(texts.length).toBeGreaterThan(0);
  for (const text of texts) {
    expect(text, `lab cell kept escape chrome: ${JSON.stringify(text)}`).not.toContain('\\"');
    expect(text, `lab cell wrapped in JSON quotes: ${JSON.stringify(text)}`).not.toMatch(/^".*"$/);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

import { expect, test } from "@playwright/test";

const SQL_SELECT = "/training/sql/sql-select-filter-nulls";
const PY_CONTRACTS = "/training/python/python-dataframe-contracts";

test.describe("Phase 1 Prompt B — lesson chrome", () => {
  test("SQL lesson order is Learn → Example → Practice → Quiz", async ({ page }) => {
    await page.goto(SQL_SELECT);

    await expect(page.locator("#learn")).toBeVisible();
    await expect(page.locator("#example")).toBeVisible();
    await expect(page.locator("#lab")).toBeVisible();
    await expect(page.locator("#quiz")).toBeVisible();

    const order = await page.evaluate(() => {
      const ids = ["learn", "example", "lab", "quiz"] as const;
      const nodes = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));
      if (nodes.length !== 4) return nodes.map((el) => el.id);
      return [...nodes]
        .sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          return 0;
        })
        .map((el) => el.id);
    });
    expect(order).toEqual(["learn", "example", "lab", "quiz"]);

    const markdownAboveExample = await page.evaluate(() => {
      const md = document.querySelector("[data-testid=lesson-markdown]");
      const example = document.getElementById("example");
      if (!md || !example) return false;
      return Boolean(md.compareDocumentPosition(example) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(markdownAboveExample).toBe(true);
  });

  test("Example loads into #lab without a second textarea; extras stay folded", async ({
    page,
  }) => {
    await page.goto(SQL_SELECT);

    const example = page.locator("#example");
    await expect(example.getByRole("heading", { name: "Example" })).toBeVisible();
    await expect(example.locator("textarea")).toHaveCount(0);
    await expect(example.getByRole("button", { name: /Run in local lab/i })).toBeVisible();

    const more = page.getByTestId("example-more");
    await expect(more).toBeVisible();
    await expect(more).not.toHaveAttribute("open", /.*/);
    await expect(more.locator("textarea")).toHaveCount(0);

    await example.getByRole("button", { name: /Run in local lab/i }).click();
    const lab = page.locator("#lab");
    await expect(lab.getByLabel("SQL to run")).toBeVisible();
    await expect(lab.getByLabel("SQL to run")).toHaveValue(/LIMIT 5/i);
    await expect(lab.locator("textarea")).toHaveCount(1);
  });

  test("copy-only lessons do not mount an empty editor frame", async ({ page }) => {
    await page.goto(PY_CONTRACTS);

    await expect(page.locator("#lab")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Local practice lab" })).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    const example = page.locator("#example");
    await expect(example).toBeVisible();
    const editor = example.getByLabel("Try it editor");
    await expect(editor).toBeVisible();
    await expect(editor).not.toHaveValue("");
    await expect(example.getByRole("button", { name: /Copy to practice/i })).toBeVisible();
    await expect(example.getByRole("button", { name: /Run in local lab/i })).toHaveCount(0);

    const articleTextareas = page.locator("article textarea");
    await expect(articleTextareas).toHaveCount(1);
  });

  test("StartHere has two doors and no PE CTA", async ({ page }) => {
    await page.goto("/");

    const doors = page.getByTestId("start-here-doors");
    await expect(doors.getByRole("link")).toHaveCount(2);
    await expect(doors.getByRole("link", { name: /Start Zero→Hero/i })).toHaveAttribute(
      "href",
      /\/training\/sql\/sql-select-filter-nulls#lab/,
    );
    await expect(doors.getByRole("link", { name: /Skip ahead/i })).toHaveAttribute(
      "href",
      /\/paths\/?$/,
    );
    await expect(page.locator("#start-here").getByRole("link", { name: /Prompt Engineering/i })).toHaveCount(
      0,
    );
    await expect(doors.getByRole("heading", { name: /Prompt Engineering/i })).toHaveCount(0);
  });

  test("SQL lesson shows a path crumb and a reference rail", async ({ page }) => {
    await page.goto(SQL_SELECT);

    const crumb = page.getByTestId("lesson-path-crumb");
    await expect(crumb).toBeVisible();
    await expect(crumb).toContainText("Zero→Hero");
    await expect(crumb).toContainText("L1 SQL");
    await expect(crumb).toContainText("1/8");
    await expect(crumb.getByRole("link", { name: "Zero→Hero" })).toHaveAttribute(
      "href",
      "/paths/zero-to-hero",
    );

    const rail = page.getByTestId("lesson-reference");
    await expect(rail).toBeVisible();
    await expect(rail.getByRole("heading", { name: "Cheat sheet" })).toBeVisible();
    await expect(rail.getByRole("link", { name: /Open Shortcuts pack for this tool/i })).toHaveAttribute(
      "href",
      "/shortcuts/sql-pyspark-windows",
    );
  });
});

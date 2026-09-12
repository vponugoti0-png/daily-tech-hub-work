import { expect, test } from "@playwright/test";
import { hasYearLongSharedCache } from "../src/lib/http-cache";

const DOCUMENT_PATHS = ["/", "/training"] as const;

test.describe("HTML Cache-Control", () => {
  for (const path of DOCUMENT_PATHS) {
    test(`${path} does not advertise year-long s-maxage`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.ok(), `${path} status ${res.status()}`).toBeTruthy();

      const cacheControl = res.headers()["cache-control"] ?? "";
      expect(
        hasYearLongSharedCache(cacheControl),
        `${path} Cache-Control must not be year-long s-maxage; got: ${cacheControl}`,
      ).toBe(false);

      // Security headers must stay on document responses.
      expect(res.headers()["x-content-type-options"]).toBe("nosniff");
      expect(res.headers()["x-frame-options"]).toBe("DENY");
      expect(res.headers()["content-security-policy"]).toBeTruthy();
      expect(res.headers()["strict-transport-security"]).toMatch(/max-age=63072000/);
    });
  }
});

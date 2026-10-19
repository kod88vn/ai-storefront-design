import { expect, test } from "@playwright/test";

const shouldRunRealAi = Boolean(
  process.env.RUN_REAL_AI_E2E &&
  (process.env.AI_GATEWAY_API_KEY || process.env.OLLAMA_BASE_URL),
);

test.describe("real AI storefront flows", () => {
  test.describe.configure({ mode: "serial" });

  test.skip(
    !shouldRunRealAi,
    "Set RUN_REAL_AI_E2E=1 and configure AI_GATEWAY_API_KEY or OLLAMA_BASE_URL to run live AI smoke tests.",
  );

  async function waitForPlan(page: import("@playwright/test").Page) {
    await expect(page.getByTestId("inline-plan-approval")).toBeVisible({
      timeout: 180_000,
    });
  }

  async function applyPlan(page: import("@playwright/test").Page) {
    await page.getByTestId("plan-apply-button").click();
    await expect(page.getByTestId("reset-button")).toBeVisible({
      timeout: 180_000,
    });
  }

  async function contrastFor(
    page: import("@playwright/test").Page,
    testId: string,
  ) {
    return await page.getByTestId(testId).evaluate((element) => {
      function parseRgb(value: string): [number, number, number] | null {
        const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!match) return null;
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      }

      function toLinear(channel: number) {
        const normalized = channel / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      }

      function luminance(rgb: [number, number, number]) {
        return (
          0.2126 * toLinear(rgb[0]) +
          0.7152 * toLinear(rgb[1]) +
          0.0722 * toLinear(rgb[2])
        );
      }

      function resolveBackground(node: Element | null): string {
        if (!node) return "rgb(255, 255, 255)";
        const style = window.getComputedStyle(node);
        const bg = style.backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
        return resolveBackground(node.parentElement);
      }

      const style = window.getComputedStyle(element);
      const fg = parseRgb(style.color);
      const bg = parseRgb(resolveBackground(element));
      if (!fg || !bg) return 1;
      const lighter = Math.max(luminance(fg), luminance(bg));
      const darker = Math.min(luminance(fg), luminance(bg));
      return (lighter + 0.05) / (darker + 0.05);
    });
  }

  test("reference URL flow reaches approval and preserves readable hero contrast", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByTestId("goal-text-input")
      .fill(
        "Redesign this storefront to feel premium while keeping all text readable with strong accessible contrast.",
      );
    await page
      .getByTestId("vision-url-input")
      .fill("http://127.0.0.1:3001/ai-reference-luxury.html");

    await page.getByTestId("simulate-button").click();
    await waitForPlan(page);
    await applyPlan(page);

    const heroContrast = await contrastFor(page, "storefront-hero");
    expect(heroContrast).toBeGreaterThanOrEqual(4.5);
  });

  test("image upload flow reaches approval and preserves readable navbar contrast", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByTestId("goal-text-input")
      .fill(
        "Use this image as inspiration and keep the final storefront accessible with clear text contrast.",
      );

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <rect width="1200" height="800" fill="#111111" />
        <rect x="80" y="80" width="420" height="180" fill="#c9a84c" rx="8" />
        <text x="110" y="180" font-size="72" fill="#ffffff" font-family="Arial, sans-serif">LUXE</text>
        <rect x="80" y="320" width="540" height="220" fill="#1f2937" rx="12" />
        <text x="110" y="410" font-size="42" fill="#f5f5f5" font-family="Arial, sans-serif">Premium audio & design</text>
      </svg>
    `;

    await page.locator('input[type="file"]').setInputFiles({
      name: "reference.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(svg),
    });

    await page.getByTestId("simulate-button").click();
    await waitForPlan(page);
    await applyPlan(page);

    const navbarContrast = await contrastFor(page, "storefront-navbar");
    expect(navbarContrast).toBeGreaterThanOrEqual(4.5);
  });
});

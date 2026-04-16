/**
 * @jest-environment node
 */

import { executeTool } from "@/lib/mcp/execute-tool";
import {
  contrastRatio,
  pickAccessibleTextColor,
} from "../../../../packages/storefront-components/src/accessibility";
import { sanitizeConfigUpdateForAccessibility } from "@/lib/design-studio/accessibility";

function parseToolPayload(result: Awaited<ReturnType<typeof executeTool>>) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

describe("apply_config_update accessibility", () => {
  it("repairs low-contrast component text colors", async () => {
    const result = await executeTool("apply_config_update", {
      componentStyleChanges: {
        hero: {
          backgroundColor: "#ffffff",
          textColor: "#f7f7f7",
        },
        footer: {
          backgroundColor: "#101010",
          textColor: "#222222",
        },
      },
    });

    const payload = parseToolPayload(result);

    expect(payload.success).toBe(true);
    expect(payload.applied.componentStyleChanges.hero.textColor).not.toBe(
      "#f7f7f7",
    );
    expect(payload.applied.componentStyleChanges.footer.textColor).not.toBe(
      "#222222",
    );
  });

  it("fills in a readable text color when a custom background is provided", async () => {
    const result = await executeTool("apply_config_update", {
      componentStyleChanges: {
        categories: {
          backgroundColor: "#111111",
        },
      },
    });

    const payload = parseToolPayload(result);

    expect(
      payload.applied.componentStyleChanges.categories.textColor,
    ).toBeTruthy();
  });

  it("prevents the navbar and hero from sharing the same surface color", async () => {
    const result = await executeTool("apply_config_update", {
      componentStyleChanges: {
        navbar: {
          backgroundColor: "#ffffff",
          textColor: "#111111",
        },
        hero: {
          backgroundColor: "#ffffff",
          textColor: "#111111",
        },
      },
    });

    const payload = parseToolPayload(result);

    expect(payload.applied.componentStyleChanges.navbar.backgroundColor).not.toBe(
      payload.applied.componentStyleChanges.hero.backgroundColor,
    );
  });

  it("prevents a filled navbar from matching the current hero background", () => {
    const applied = sanitizeConfigUpdateForAccessibility(
      {
        componentStyleChanges: {
          navbar: {
            backgroundColor: "#f59e0b",
            textColor: "#111111",
          },
        },
      },
      {
        theme: {
          primaryColor: "#f59e0b",
          colorScheme: "light",
          navStyle: "filled",
        },
        hero: {
          backgroundColor: "#f59e0b",
          layout: "split",
        },
      },
    );

    expect(applied.componentStyleChanges?.navbar?.backgroundColor).not.toBe(
      "#f59e0b",
    );
  });

  it("chooses readable text for bright accent and section colors", () => {
    const brightAccent = "#f6c768";
    const warmSection = "#f0a35e";

    const buttonText = pickAccessibleTextColor(brightAccent, "#ffffff");
    const headingText = pickAccessibleTextColor(warmSection, "#ffffff");

    expect(contrastRatio(buttonText, brightAccent)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(headingText, warmSection)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps limited accent colors from taking over the whole theme", async () => {
    const result = await executeTool("generate_theme", {
      dominantStyle: "editorial",
      targetAesthetic: "luxury",
      colorScheme: "light",
      navStyle: "bordered",
      primaryColors: ["#f5efe6", "#1f1f1f", "#d97706"],
    });

    const payload = parseToolPayload(result);

    expect(payload.primaryColor).not.toBe("#d97706");
    expect(payload.secondaryColor).toBe("#d97706");
  });
});

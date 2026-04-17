import {
  contrastRatio,
  ensureDistinctSurfaceColor,
  normalizeHex as normalizeSharedHex,
  pickAccessibleTextColor,
} from "../../../../packages/storefront-components/src/accessibility";
import {
  normalizeHex as normalizeStudioHex,
  sanitizeConfigUpdateForAccessibility,
} from "./accessibility";

describe("shared accessibility contracts", () => {
  it("normalizes short hex colors consistently across studio and shared helpers", () => {
    expect(normalizeSharedHex("#AbC")).toBe("#aabbcc");
    expect(normalizeStudioHex("#AbC")).toBe("#aabbcc");
    expect(normalizeSharedHex("not-a-color")).toBeUndefined();
    expect(normalizeStudioHex("not-a-color")).toBeNull();
  });

  it("picks readable text when the preferred color fails contrast", () => {
    const background = "#f6c768";
    const text = pickAccessibleTextColor(background, "#ffffff");

    expect(text).toBe("#171717");
    expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("shifts identical surfaces to keep adjacent sections visually distinct", () => {
    expect(ensureDistinctSurfaceColor("#ffffff", "#ffffff")).toBe("#f5f5f5");
    expect(ensureDistinctSurfaceColor("#111111", "#111111")).toBe("#171717");
    expect(ensureDistinctSurfaceColor("#ffffff", "#f5f5f5")).toBe("#ffffff");
  });

  it("sanitizes navbar updates into a readable and distinct surface", () => {
    const applied = sanitizeConfigUpdateForAccessibility(
      {
        componentStyleChanges: {
          navbar: {
            backgroundColor: "#ffffff",
            textColor: "#f8f8f8",
          },
          hero: {
            backgroundColor: "#ffffff",
          },
        },
      },
      {
        theme: {
          colorScheme: "light",
          navStyle: "filled",
          primaryColor: "#ffffff",
        },
        hero: {
          backgroundColor: "#ffffff",
          layout: "split",
        },
      },
    );

    const navbar = applied.componentStyleChanges?.navbar;

    expect(navbar?.backgroundColor).toBe("#f5f5f5");
    expect(navbar?.textColor).toBeTruthy();
    expect(contrastRatio(navbar?.textColor, navbar?.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });
});

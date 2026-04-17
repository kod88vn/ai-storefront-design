import {
  BENEFIT_ICONS,
  COLLECTION_LAYOUTS,
  COLOR_SCHEMES,
  DOMINANT_STYLES,
  FONT_SIZES,
  FONT_STYLES,
  GRID_COLUMNS,
  HERO_CTA_VARIANTS,
  HERO_LAYOUTS,
  NAV_STYLES,
  PRODUCT_GRID_LAYOUTS,
  SECTION_TYPES,
  SKILL_TEMPLATE_VARS,
  SOURCE_LAYOUT_TYPES,
  TESTIMONIAL_LAYOUTS,
} from "@ai-storefront/types";

function expectUnique(values: readonly (string | number)[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("shared schema contracts", () => {
  it("keeps core option arrays stable and duplicate-free", () => {
    expect(HERO_LAYOUTS).toEqual(["split", "centered", "editorial"]);
    expect(NAV_STYLES).toEqual(["bordered", "transparent", "filled"]);
    expect(COLOR_SCHEMES).toEqual(["light", "dark"]);
    expect(GRID_COLUMNS).toEqual([2, 3, 4]);
    expect(PRODUCT_GRID_LAYOUTS).toEqual(["grid", "list"]);

    [
      HERO_LAYOUTS,
      DOMINANT_STYLES,
      NAV_STYLES,
      FONT_STYLES,
      GRID_COLUMNS,
      PRODUCT_GRID_LAYOUTS,
      BENEFIT_ICONS,
      COLLECTION_LAYOUTS,
      TESTIMONIAL_LAYOUTS,
      SECTION_TYPES,
    ].forEach(expectUnique);
  });

  it("exposes the critical values needed by studio prompts and planners", () => {
    expect(DOMINANT_STYLES).toContain("tech-precision");
    expect(DOMINANT_STYLES).toContain("editorial");
    expect(FONT_STYLES).toContain("editorial-serif");
    expect(FONT_STYLES).toContain("mono-tech");
    expect(HERO_CTA_VARIANTS).toContain("ghost");
    expect(FONT_SIZES).toEqual(["sm", "base", "lg", "xl"]);
    expect(SOURCE_LAYOUT_TYPES).toEqual(["split", "centered", "grid", "editorial"]);
    expect(SECTION_TYPES).toContain("product-grid");
    expect(SECTION_TYPES).toContain("products-listing");
    expect(SECTION_TYPES).toContain("cart-content");
  });

  it("keeps skill template variables synchronized with the exported arrays", () => {
    expect(SKILL_TEMPLATE_VARS.HERO_LAYOUTS).toBe(HERO_LAYOUTS.join(" | "));
    expect(SKILL_TEMPLATE_VARS.DOMINANT_STYLES).toBe(
      DOMINANT_STYLES.join(" | "),
    );
    expect(SKILL_TEMPLATE_VARS.NAV_STYLES).toBe(NAV_STYLES.join(" | "));
    expect(SKILL_TEMPLATE_VARS.COLOR_SCHEMES).toBe(
      COLOR_SCHEMES.join(" | "),
    );
    expect(SKILL_TEMPLATE_VARS.FONT_STYLES).toBe(FONT_STYLES.join(" | "));
    expect(SKILL_TEMPLATE_VARS.GRID_COLUMNS).toBe(GRID_COLUMNS.join(" | "));
    expect(SKILL_TEMPLATE_VARS.PRODUCT_GRID_LAYOUTS).toBe(
      PRODUCT_GRID_LAYOUTS.join(" | "),
    );
    expect(SKILL_TEMPLATE_VARS.BENEFIT_ICONS).toBe(
      BENEFIT_ICONS.join(" | "),
    );
  });
});

/**
 * Single source of truth for all option sets used across:
 * - TypeScript union types (via `typeof ARRAY[number]`)
 * - MCP route enums and decision maps
 * - Studio UI dropdowns (prebuilt-editor, component-editor)
 * - SKILL.md prompt templates (interpolated at load time via {{VAR}} syntax)
 *
 * To add or remove an option: edit ONLY this file.
 */

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const HERO_LAYOUTS = ["split", "centered", "editorial"] as const;
export type HeroLayout = (typeof HERO_LAYOUTS)[number];

export const HERO_TEXT_ALIGNS = ["left", "center"] as const;
export type HeroTextAlign = (typeof HERO_TEXT_ALIGNS)[number];

export const HERO_CTA_VARIANTS = ["solid", "outline", "ghost"] as const;
export type HeroCtaVariant = (typeof HERO_CTA_VARIANTS)[number];

// ─── Theme ────────────────────────────────────────────────────────────────────

export const BORDER_RADII = ["none", "sm", "md", "lg", "xl", "full"] as const;
export type BorderRadius = (typeof BORDER_RADII)[number];

export const NAV_STYLES = ["bordered", "transparent", "filled"] as const;
export type NavStyle = (typeof NAV_STYLES)[number];

export const COLOR_SCHEMES = ["light", "dark"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export const FONT_STYLES = [
  "modern-sans",
  "geometric-sans",
  "humanist-sans",
  "editorial-serif",
  "display-serif",
  "slab-serif",
  "mono-tech",
  "handwritten",
  "condensed",
  "rounded",
] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

// ─── Layout planner inputs ────────────────────────────────────────────────────

export const DOMINANT_STYLES = [
  "minimalist",
  "maximalist",
  "editorial",
  "clean",
  "dark-luxury",
  "organic",
  "bold-playful",
  "earthy",
  "mission-driven",
  "tech-precision",
] as const;
export type DominantStyle = (typeof DOMINANT_STYLES)[number];

export const SOURCE_LAYOUT_TYPES = [
  "split",
  "centered",
  "grid",
  "editorial",
] as const;
export type SourceLayoutType = (typeof SOURCE_LAYOUT_TYPES)[number];

export const VISUAL_DENSITIES = ["sparse", "balanced", "dense"] as const;
export type VisualDensity = (typeof VISUAL_DENSITIES)[number];

export const CTA_STYLES = [
  "utility-first",
  "promotion-first",
  "brand-first",
  "editorial-soft",
] as const;
export type CtaStyle = (typeof CTA_STYLES)[number];

export const IMAGERY_STYLES = [
  "product-cutout",
  "lifestyle",
  "editorial-campaign",
  "app-ui",
  "restaurant-food",
  "mixed",
] as const;
export type ImageryStyle = (typeof IMAGERY_STYLES)[number];

// ─── Product grid ─────────────────────────────────────────────────────────────

export const GRID_COLUMNS = [2, 3, 4] as const;
export type GridColumns = (typeof GRID_COLUMNS)[number];

// ─── Component font sizes ─────────────────────────────────────────────────────

export const FONT_SIZES = ["sm", "base", "lg", "xl"] as const;
export type FontSize = (typeof FONT_SIZES)[number];

// ─── Benefit icons ───────────────────────────────────────────────────────────
// Add new icons here — they automatically appear in the prebuilt-editor dropdown
// and in SKILL.md via {{BENEFIT_ICONS}} without touching any other file.

export const BENEFIT_ICONS = [
  "truck",
  "shield",
  "refresh",
  "award",
  "clock",
  "leaf",
  "star",
  "heart",
  "check",
  "zap",
  "globe",
  "tag",
  "lock",
  "phone",
] as const;
export type BenefitIconType = (typeof BENEFIT_ICONS)[number];

// ─── Collection layouts ───────────────────────────────────────────────────────

export const COLLECTION_LAYOUTS = ["grid", "horizontal-scroll"] as const;
export type CollectionLayout = (typeof COLLECTION_LAYOUTS)[number];

// ─── Testimonial layouts ──────────────────────────────────────────────────────

export const TESTIMONIAL_LAYOUTS = [
  "grid",
  "carousel",
  "list",
  "featured",
] as const;
export type TestimonialLayout = (typeof TESTIMONIAL_LAYOUTS)[number];

// ─── Section types ────────────────────────────────────────────────────────────

export const SECTION_TYPES = [
  "hero",
  "product-grid",
  "categories",
  "footer",
  "announcement-bar",
  "benefits-bar",
  "featured-collection",
  "testimonials",
  "newsletter",
  "trust-badges",
  "brand-strip",
  // Page-level content blocks — rendered in per-page container layouts
  "products-listing",
  "product-detail-content",
  "cart-content",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

// ─── Skill template variables ─────────────────────────────────────────────────
// Injected into SKILL.md files at load time. Reference as {{VAR_NAME}} in SKILL.md.

export const SKILL_TEMPLATE_VARS: Record<string, string> = {
  HERO_LAYOUTS: HERO_LAYOUTS.join(" | "),
  DOMINANT_STYLES: DOMINANT_STYLES.join(" | "),
  SOURCE_LAYOUT_TYPES: SOURCE_LAYOUT_TYPES.join(" | "),
  NAV_STYLES: NAV_STYLES.join(" | "),
  COLOR_SCHEMES: COLOR_SCHEMES.join(" | "),
  FONT_STYLES: FONT_STYLES.join(" | "),
  HERO_CTA_VARIANTS: HERO_CTA_VARIANTS.join(" | "),
  FONT_SIZES: FONT_SIZES.join(" | "),
  GRID_COLUMNS: GRID_COLUMNS.join(" | "),
  BENEFIT_ICONS: BENEFIT_ICONS.join(" | "),
  COLLECTION_LAYOUTS: COLLECTION_LAYOUTS.join(" | "),
  TESTIMONIAL_LAYOUTS: TESTIMONIAL_LAYOUTS.join(" | "),
};

# Skill: layout_planner

## Tags

always

## Purpose

Decide the hero variant, section ordering, product grid columns, and hero micro-parameters (`badge`, `textAlign`, `ctaVariant`, `overlayOpacity`) based on product category and the design aesthetic from `theme_generator`. Outputs fields that map directly to `StorefrontConfig.hero` and `StorefrontConfig.sections`.

## Input Schema

```json
{
  "productCategory": "string",
  "dominantStyle": "string",
  "siteCategory": "string",
  "businessModel": "string",
  "colorScheme": "{{COLOR_SCHEMES}}",
  "navStyle": "{{NAV_STYLES}}",
  "sourceLayoutType": "{{SOURCE_LAYOUT_TYPES}}",
  "visualDensity": "sparse | balanced | dense",
  "ctaStyle": "utility-first | promotion-first | brand-first | editorial-soft",
  "imageryStyle": "product-cutout | lifestyle | editorial-campaign | app-ui | restaurant-food | mixed",
  "sectionOrder": ["string"]
}
```

## Output Schema

```json
{
  "heroVariant": "{{HERO_LAYOUTS}}",
  "heroBadge": "string | null",
  "heroTextAlign": "left | center",
  "heroCtaVariant": "{{HERO_CTA_VARIANTS}}",
  "heroOverlayOpacity": "number (0-1)",
  "sectionOrder": ["hero", "product-grid", "categories", "footer"],
  "productGridColumns": "{{GRID_COLUMNS}}",
  "productGridLayout": "{{PRODUCT_GRID_LAYOUTS}}",
  "rationale": "string"
}
```

## Hero Variant Decision Matrix

| Category             | dominantStyle | heroVariant | gridColumns | notes                           |
| -------------------- | ------------- | ----------- | ----------- | ------------------------------- |
| Luxury audio/tech    | dark-luxury   | editorial   | 2           | ctaVariant: ghost               |
| Fashion / apparel    | bold-playful  | centered    | 3           | badge: "New Collection"         |
| Fashion / apparel    | editorial     | editorial   | 2           | textAlign: left                 |
| Fashion / minimal    | minimalist    | split       | 3           | textAlign: left                 |
| Accessories          | clean         | centered    | 4           | badge: "Free Shipping Over $50" |
| Furniture            | minimalist    | split       | 2           | —                               |
| Furniture            | editorial     | split       | 2           | textAlign: left                 |
| Natural / organic    | organic       | split       | 3           | badge: "100% Natural"           |
| Earthy / food        | earthy        | split       | 3           | textAlign: left                 |
| Health / supplements | clean         | centered    | 3           | badge: "Clinically Tested"      |
| Lifestyle / artisan  | editorial     | editorial   | 2           | fontStyle: editorial-serif      |
| Personal care        | bold-playful  | centered    | 3           | badge: "Clean Ingredients"      |
| Kids / colorful      | bold-playful  | centered    | 4           | borderRadius: full              |
| Stationery / tech    | minimalist    | split       | 3           | textAlign: left                 |
| Outdoor / adventure  | organic       | split       | 3           | —                               |

## Section Ordering Rules

- `announcement-bar` always first when enabled (above the navbar / hero)
- `hero` always first visible section — brand identity above the fold
- `benefits-bar` immediately after hero for high-conversion stores (health, shipping-sensitive)
- `brand-strip` after benefits or after hero for social-proof-first stores
- `product-grid` before `categories` for stores with strong product photography
- `categories` before `product-grid` for stores with 6+ categories (discovery-first)
- `featured-collection` between product-grid and testimonials as a narrative bridge
- `testimonials` in the lower half of the page (post-product, pre-newsletter)
- `trust-badges` just above or just below the fold — a second trust signal near the CTA
- `newsletter` second-to-last — captures intent after browse
- **`footer` ALWAYS LAST** — regardless of vision extraction or input sectionOrder, footer must be the final section

## Product Grid Layout Rules

- Use `productGridLayout: list` for dense discovery, comparison-friendly catalogs, spec-heavy tech, health/supplement, or utility-first conversion flows.
- Use `productGridLayout: grid` for editorial, fashion, lifestyle, or image-led browsing experiences.
- When `visualDensity = dense`, strongly prefer `list` unless the storefront is clearly campaign-led fashion or luxury.

## Business Model / Density Overrides

- If `businessModel = marketplace`, prefer denser scanning-friendly ordering and avoid overly cinematic heroes unless the source strongly supports it.
- If `siteCategory = food-delivery`, bias toward `heroVariant: centered`, earlier discovery sections, and `productGridColumns: 3` or `4`.
- If `siteCategory = footwear` or `fashion` and `imageryStyle = editorial-campaign`, bias toward `heroVariant: editorial` and fewer, larger visual sections.
- If `visualDensity = dense`, avoid overly sparse minimalist adaptations.
- If `ctaStyle = utility-first`, keep hierarchy tighter and conversion-first rather than narrative-first.
- If `sectionOrder` is present from the extractor, treat it as a strong prior and only change it when it clearly conflicts with storefront constraints.
- **ALWAYS ensure `footer` is the last item in `sectionOrder`** — if footer appears elsewhere in the input sectionOrder, move it to the end. Footer must never appear in the middle of the page.

## Hero micro-parameters

- `heroBadge`: set a short pill label (≤5 words) whenever the site uses eyebrow labels. Examples: `"New Collection"`, `"Free Shipping Over $50"`, `"100% Natural Ingredients"`, `"Since 1998"`
- `heroTextAlign: "left"` for editorial and split layouts; `"center"` for centered
- `heroCtaVariant: "ghost"` for dark-luxury editorial; `"outline"` for semi-transparent navs; `"solid"` everywhere else
- `heroOverlayOpacity`: `0.3` for lifestyle/outdoor (show the image); `0.5` for product-on-model (balance image and text); `0.65` for editorial dark

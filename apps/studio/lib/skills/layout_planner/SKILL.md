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
  "colorScheme": "light | dark",
  "navStyle": "bordered | transparent | filled",
  "sourceLayoutType": "split | centered | minimal | grid | editorial | fullbleed"
}
```

## Output Schema

```json
{
  "heroVariant": "split | centered | minimal | fullbleed | editorial",
  "heroBadge": "string | null",
  "heroTextAlign": "left | center",
  "heroCtaVariant": "solid | outline | ghost",
  "heroOverlayOpacity": "number (0-1)",
  "sectionOrder": ["hero", "product-grid", "categories", "footer"],
  "productGridColumns": 2,
  "rationale": "string"
}
```

## Hero Variant Decision Matrix

| Category             | dominantStyle | heroVariant | gridColumns | notes                                  |
| -------------------- | ------------- | ----------- | ----------- | -------------------------------------- |
| Luxury audio/tech    | dark-luxury   | fullbleed   | 2           | overlayOpacity: 0.5, ctaVariant: ghost |
| Fashion / apparel    | bold-playful  | centered    | 3           | badge: "New Collection"                |
| Fashion / apparel    | editorial     | editorial   | 2           | textAlign: left                        |
| Fashion / minimal    | minimalist    | minimal     | 3           | textAlign: left                        |
| Accessories          | clean         | centered    | 4           | badge: "Free Shipping Over $50"        |
| Furniture            | minimalist    | minimal     | 2           | —                                      |
| Furniture            | editorial     | split       | 2           | textAlign: left                        |
| Natural / organic    | organic       | split       | 3           | badge: "100% Natural"                  |
| Earthy / food        | earthy        | split       | 3           | textAlign: left                        |
| Health / supplements | clean         | centered    | 3           | badge: "Clinically Tested"             |
| Lifestyle / artisan  | editorial     | editorial   | 2           | fontStyle: editorial-serif             |
| Personal care        | bold-playful  | centered    | 3           | badge: "Clean Ingredients"             |
| Kids / colorful      | bold-playful  | centered    | 4           | borderRadius: full                     |
| Stationery / tech    | minimalist    | split       | 3           | textAlign: left                        |
| Outdoor / adventure  | organic       | fullbleed   | 3           | overlayOpacity: 0.35                   |

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
- `footer` always last

## Hero micro-parameters

- `heroBadge`: set a short pill label (≤5 words) whenever the site uses eyebrow labels. Examples: `"New Collection"`, `"Free Shipping Over $50"`, `"100% Natural Ingredients"`, `"Since 1998"`
- `heroTextAlign: "left"` for editorial, split, and minimal layouts; `"center"` for centered and fullbleed
- `heroCtaVariant: "ghost"` on fullbleed layouts with dark overlays (`overlayOpacity ≥ 0.4`); `"outline"` for semi-transparent navs; `"solid"` everywhere else
- `heroOverlayOpacity`: `0.3` for lifestyle/outdoor (show the image); `0.5` for product-on-model (balance image and text); `0.65` for editorial dark

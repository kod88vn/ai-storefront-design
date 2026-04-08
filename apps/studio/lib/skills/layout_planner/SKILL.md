# Skill: layout_planner

## Purpose

Plan the optimal section ordering, hero variant, and product grid column count for a storefront based on product category and the design aesthetic established by `theme_generator`. Outputs configuration that feeds directly into `StorefrontConfig.sections` and `StorefrontConfig.hero`.

## Input Schema

```json
{
  "productCategory": "string (e.g. 'furniture', 'fashion', 'accessories')",
  "dominantStyle": "minimalist | maximalist | editorial | clean",
  "sourceLayoutType": "split | centered | minimal | grid"
}
```

## Output Schema

```json
{
  "heroVariant": "split | centered | minimal",
  "sectionOrder": ["hero", "product-grid", "categories", "footer"],
  "productGridColumns": 2,
  "rationale": "string"
}
```

## Example Usage

```typescript
// Runs after theme_generator. Layout decisions feed into StorefrontConfig.
const layout = await skills.layout_planner.run({
  productCategory: "furniture",
  dominantStyle: "minimalist",
  sourceLayoutType: "split",
});
// → { heroVariant: "minimal", sectionOrder: [...], productGridColumns: 2 }
```

## Layout Decision Matrix

| Category    | Style      | Hero Variant | Grid Columns |
| ----------- | ---------- | ------------ | ------------ |
| Furniture   | minimalist | minimal      | 2            |
| Furniture   | editorial  | split        | 2            |
| Fashion     | clean      | centered     | 3            |
| Accessories | any        | centered     | 4            |
| Lighting    | editorial  | split        | 3            |
| Textiles    | minimalist | minimal      | 3            |

## Section Ordering Rules

- `hero` always first — establishes brand identity above the fold
- `product-grid` before `categories` — drives conversion before discovery
- `footer` always last — provides navigation closure
- `categories` can move above `product-grid` for stores with 6+ categories

## Implementation Notes

- `minimal` hero maximizes page-above-fold whitespace — best for luxury/editorial aesthetics
- `split` hero performs best for conversion-focused stores (CTA always visible)
- `centered` hero works well for seasonal campaigns or single-product focus
- 4 columns requires product images ≥ 300px wide; enforce min-width constraint

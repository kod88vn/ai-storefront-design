# Skill: theme_generator

## Purpose

Generate a cohesive storefront color theme and typography configuration from extracted design signals or a target aesthetic keyword. Outputs a `ThemeConfig` object that is applied directly to the `StorefrontConfig`.

## Input Schema

```json
{
  "dominantStyle": "minimalist | maximalist | editorial | clean",
  "primaryColors": ["#hex"],
  "targetAesthetic": "string (e.g. 'organic', 'luxury', 'tech', 'artisan')"
}
```

## Output Schema

```json
{
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "borderRadius": "none | md | full",
  "rationale": "string"
}
```

## Example Usage

```typescript
// Receives ui_extractor output and synthesizes a ThemeConfig.
// Always pairs a neutral primary with a vibrant accent for contrast.
const theme = await skills.theme_generator.run({
  dominantStyle: "minimalist",
  primaryColors: ["#1a1a1a"],
  targetAesthetic: "organic",
});
// → { primaryColor: "#1a1a1a", secondaryColor: "#22c55e", borderRadius: "md" }
```

## Aesthetic → Accent Color Mappings

| Aesthetic        | Accent Color | Hex       |
| ---------------- | ------------ | --------- |
| organic/natural  | Forest Green | `#22c55e` |
| luxury/editorial | Warm Gold    | `#f59e0b` |
| tech/clean       | Cobalt Blue  | `#3b82f6` |
| artisan/handmade | Terracotta   | `#ef4444` |
| minimal/modern   | Slate Gray   | `#64748b` |

## Implementation Notes

- Never use `borderRadius: "full"` for furniture or textiles stores — it conflicts with product imagery
- `primaryColor` should always be near-black (`#0f172a`, `#1a1a1a`) or near-white for high-contrast readability
- `secondaryColor` drives CTA buttons, cart badge, and hover effects — must pass WCAG AA on white
- If `primaryColors` from `ui_extractor` are all neutrals, map to `targetAesthetic` accent table above

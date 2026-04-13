# Skill: theme_generator

## Tags

always

## Purpose

Generate a cohesive `ThemeConfig` from extracted design signals or a target aesthetic keyword. Covers colors, border radius, font style, nav style, and color scheme. Always runs after `ui_extractor`.

## Input Schema

```json
{
  "dominantStyle": "minimalist | maximalist | editorial | clean | dark-luxury | organic | bold-playful | earthy",
  "siteCategory": "string",
  "businessModel": "string",
  "primaryColors": ["#hex"],
  "colorTemperature": "warm | cool | neutral",
  "colorScheme": "light | dark",
  "fontStyle": "modern-sans | geometric-sans | humanist-sans | editorial-serif | display-serif | slab-serif | mono-tech | handwritten | condensed | rounded",
  "navStyle": "bordered | transparent | filled",
  "targetAesthetic": "string (e.g. 'organic', 'luxury', 'tech', 'artisan')",
  "ctaStyle": "utility-first | promotion-first | brand-first | editorial-soft",
  "imageryStyle": "product-cutout | lifestyle | editorial-campaign | app-ui | restaurant-food | mixed"
}
```

## Output Schema — ThemeConfig

```json
{
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "borderRadius": "none | sm | md | lg | xl | full",
  "fontStyle": "modern-sans | geometric-sans | humanist-sans | editorial-serif | display-serif | slab-serif | mono-tech | handwritten | condensed | rounded",
  "navStyle": "bordered | transparent | filled",
  "colorScheme": "light | dark",
  "rationale": "string"
}
```

## Aesthetic → Full Theme Presets

Use these as complete starting points when mimicking a known style archetype:

| Archetype                                        | primaryColor | secondaryColor   | borderRadius | fontStyle         | navStyle      | colorScheme |
| ------------------------------------------------ | ------------ | ---------------- | ------------ | ----------------- | ------------- | ----------- |
| **Dark luxury** (Master & Dynamic)               | `#0a0a0a`    | `#c9a84c` (gold) | `none`       | `modern-sans`     | `transparent` | `dark`      |
| **Organic / natural** (Rocky Mountain Soap)      | `#2d4a22`    | `#7cb87a`        | `md`         | `modern-sans`     | `bordered`    | `light`     |
| **Editorial serif** (Holstee)                    | `#1a1a1a`    | `#e8b84b`        | `none`       | `editorial-serif` | `bordered`    | `light`     |
| **Bold playful** (Outdoor Voices, Love Wellness) | `#1a1a1a`    | `#f97316`        | `full`       | `modern-sans`     | `bordered`    | `light`     |
| **Clean health** (Kettle & Fire, Hiya)           | `#0f4c35`    | `#22c55e`        | `md`         | `modern-sans`     | `bordered`    | `light`     |
| **Earthy / rustic** (Dr. Squatch)                | `#3d2b1f`    | `#a16207`        | `md`         | `modern-sans`     | `bordered`    | `light`     |
| **Medical / clinical** (Figs)                    | `#0c3547`    | `#06b6d4`        | `md`         | `modern-sans`     | `filled`      | `light`     |
| **Minimal / modern** (Kit and Ace, Studio Neat)  | `#111827`    | `#6366f1`        | `none`       | `modern-sans`     | `bordered`    | `light`     |
| **Tech / mono** (product hardware)               | `#0f172a`    | `#3b82f6`        | `none`       | `mono-tech`       | `transparent` | `dark`      |
| **Soft beauty** (Love Wellness pastel)           | `#7c3aed`    | `#f472b6`        | `full`       | `modern-sans`     | `bordered`    | `light`     |

## Implementation Notes

- `primaryColor` drives all text headings and the logo wordmark — needs strong contrast on both light and dark backgrounds
- `secondaryColor` drives CTA buttons, badge pills, icon accents, cart count badge — must pass WCAG AA on white AND on `primaryColor`
- `navStyle: "transparent"` must be paired with a fullbleed or editorial hero that has a dark overlay
- `navStyle: "filled"` works best with `colorScheme: "light"` so the colored navbar provides contrast
- `borderRadius: "none"` signals premium/architectural brands; `"full"` signals approachable/wellness brands
- `fontStyle: "editorial-serif"` is best for lifestyle, artisan, or heritage brands — not tech or health
- `colorScheme: "dark"` overrides the base background to near-black; the AI should use `colorScheme: "dark"` + `navStyle: "transparent"` together for luxury dark sites
- Never use `borderRadius: "full"` for furniture or sharp-edged product brands
- If `businessModel = marketplace`, prefer more functional palettes and stronger surface contrast over purely expressive luxury/art-direction choices.
- If `siteCategory = food-delivery`, avoid overfitting to fashion/editorial presets even when the screenshot is visually clean.
- If `imageryStyle = editorial-campaign`, color and typography can be more dramatic; if `imageryStyle = app-ui` or `restaurant-food`, favor utility and clarity.
- `ctaStyle = utility-first` should bias toward clearer, higher-contrast accents and less ornamental styling.

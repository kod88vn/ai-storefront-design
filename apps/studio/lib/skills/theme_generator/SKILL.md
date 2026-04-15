# Skill: theme_generator

## Tags

always

## Purpose

Generate a cohesive `ThemeConfig` from extracted design signals or a target aesthetic keyword. Covers colors, border radius, font style, nav style, and color scheme. Always runs after `ui_extractor`.

## Input Schema

```json
{
  "dominantStyle": "{{DOMINANT_STYLES}}",
  "siteCategory": "string",
  "businessModel": "string",
  "primaryColors": ["#hex"],
  "colorTemperature": "warm | cool | neutral",
  "colorScheme": "{{COLOR_SCHEMES}}",
  "fontStyle": "{{FONT_STYLES}}",
  "navStyle": "{{NAV_STYLES}}",
  "targetAesthetic": "string (e.g. 'organic', 'luxury', 'tech', 'artisan')",
  "ctaStyle": "utility-first | promotion-first | brand-first | editorial-soft",
  "imageryStyle": "product-cutout | lifestyle | editorial-campaign | app-ui | restaurant-food | mixed"
}
```

## Output Schema — ThemeConfig + componentStyleChanges

When calling `apply_config_update`, you output `themeChanges` (the global theme) and optionally `componentStyleChanges` (per-section overrides for background color, text color, and font size). Use `componentStyleChanges` when a section needs to deviate from the global theme — for example:

- A dark footer on an otherwise light site
- A brand-colored hero background that differs from the page background
- A tinted categories strip
- An announcement bar–style navbar

```json
{
  "themeChanges": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "borderRadius": "{{BORDER_RADII}}",
    "fontStyle": "{{FONT_STYLES}}",
    "navStyle": "{{NAV_STYLES}}",
    "colorScheme": "{{COLOR_SCHEMES}}"
  },
  "componentStyleChanges": {
    "navbar": {
      "backgroundColor": "#hex (optional — overrides navStyle-derived color)",
      "textColor": "#hex (optional — overrides derived text color)",
      "fontSize": "sm | base | lg | xl (optional)"
    },
    "hero": {
      "backgroundColor": "#hex (optional)",
      "textColor": "#hex (optional)",
      "fontSize": "sm | base | lg | xl (optional)"
    },
    "productGrid": {
      "backgroundColor": "#hex (optional)",
      "textColor": "#hex (optional)",
      "fontSize": "sm | base | lg | xl (optional)"
    },
    "categories": {
      "backgroundColor": "#hex (optional)",
      "textColor": "#hex (optional)",
      "fontSize": "sm | base | lg | xl (optional)"
    },
    "footer": {
      "backgroundColor": "#hex (optional)",
      "textColor": "#hex (optional)",
      "fontSize": "sm | base | lg | xl (optional)"
    }
  }
}
```

### Per-section style rules

- Only populate `componentStyleChanges` fields you actually change — omit the rest (they inherit from the theme).
- **Background Color Alternation**: When applying extracted background colors, use them proportionally across sections. Background colors must alternate between 2 adjacent components to create visual rhythm — avoid applying the same background color to consecutive sections. For example: hero (neutral) → productGrid (tint) → categories (neutral) → footer (dark).
- **Conservative Dark Color Application**: Avoid applying black or very dark backgrounds extensively unless the reference site clearly uses dark colors throughout. If the reference has mostly light backgrounds, do not create a "false impression" of heaviness by over-applying dark colors. Dark backgrounds should only be used for specific sections (like footer) when the reference site actually uses them, not as a default assumption. **Never apply black backgrounds to organic, earthy, or natural sites** — these should maintain light, clean aesthetics even if the reference has some dark accents.
- `navbar.backgroundColor` takes precedence over `navStyle`-derived colors. **Always set it** in these cases:
  - When `navStyle = bordered` and the extracted `backgroundColor` is not pure white (`#ffffff`) — the nav should match the page background (e.g. a cream `#faf5f0` page needs `navbar.backgroundColor: #faf5f0`).
  - When `navStyle = filled` and the nav uses a specific brand color that differs from `primaryColor`.
  - For earthy, organic, warm-toned sites: ALWAYS set `navbar.backgroundColor` to the extracted `backgroundColor` so the nav blends with the page instead of showing a jarring white strip.
- `hero.backgroundColor` overrides the layout-default section background (white/neutral). Set it for editorial heroes with a custom brand color.
- `footer.backgroundColor` is commonly dark even on light sites — set it to `#0d0d0d` or brand dark for a grounding footer.
- `categories.backgroundColor` is commonly a light tint — use `sectionBackgroundColor` from extracted tokens when available.
- Do not set redundant values: if `hero.textColor` would be the same as the theme-derived default, omit it.
- For `dominantStyle: earthy`: set `footer.backgroundColor: "#1b4332"` (dark forest green) and `footer.textColor: "#ffffff"`. Set `categories.backgroundColor: "#f0ebe4"` (warm cream/tan). These two overrides create the layered earthy look (cream page → tinted category strip → dark grounding footer).
- For `dominantStyle: organic`: set `footer.backgroundColor: "#2d4a22"` (deep forest green) and `footer.textColor: "#ffffff"`. Set `categories.backgroundColor: "#f0f4ee"` (pale sage tint).
- For `dominantStyle: dark-luxury`: set `footer.backgroundColor` to the same near-black as `primaryColor`. Omit `categories.backgroundColor` — dark luxury sites keep surfaces monochrome.

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
- Respect the reference color proportions: dominant neutrals and structural tones should cover most of the UI, while vivid accents should stay in a restrained 5–15% role.
- Do not let a navbar-only color become the site-wide primary unless that same tone is repeated across headings, cards, and CTAs throughout the reference.
- All AI-selected foreground/background combinations must meet WCAG AA contrast, targeting at least 4.5:1 for normal text. If a custom section background is dark, use white or near-white text; if the background is light, use near-black text.
- Whenever you set `backgroundColor` for `navbar`, `hero`, `productGrid`, `categories`, or `footer`, also set a readable `textColor` unless the inherited theme color already clearly passes contrast.
- `navStyle: "transparent"` must be paired with an editorial hero that has a dark overlay
- `navStyle: "filled"` works best with `colorScheme: "light"` so the colored navbar provides contrast
- `borderRadius: "none"` signals premium/architectural brands; `"full"` signals approachable/wellness brands
- `fontStyle: "editorial-serif"` is best for lifestyle, artisan, or heritage brands — not tech or health
- `colorScheme: "dark"` overrides the base background to near-black; the AI should use `colorScheme: "dark"` + `navStyle: "transparent"` together for luxury dark sites
- Never use `borderRadius: "full"` for furniture or sharp-edged product brands
- If `businessModel = marketplace`, prefer more functional palettes and stronger surface contrast over purely expressive luxury/art-direction choices.
- If `siteCategory = food-delivery`, avoid overfitting to fashion/editorial presets even when the screenshot is visually clean.
- If `imageryStyle = editorial-campaign`, color and typography can be more dramatic; if `imageryStyle = app-ui` or `restaurant-food`, favor utility and clarity.
- `ctaStyle = utility-first` should bias toward clearer, higher-contrast accents and less ornamental styling.

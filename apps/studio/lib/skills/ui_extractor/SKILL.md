# Skill: ui_extractor

## Purpose

Extract visual design elements from a URL or image. Analyzes colors, typography, spacing, layout patterns, and component hierarchy to produce a structured design signal object that all downstream skills consume. This is always the **first skill** in the pipeline when a source URL or image is provided.

## Input Schema

```json
{
  "source": "string (URL or base64 image data URI)",
  "extractionTargets": [
    "colors",
    "typography",
    "layout",
    "components",
    "spacing"
  ]
}
```

## Output Schema

```json
{
  "primaryColors": ["#hex"],
  "fontStack": "string",
  "fontStyle": "modern-sans | editorial-serif | mono-tech",
  "layoutType": "split | centered | minimal | grid | editorial | fullbleed",
  "borderRadius": "none | md | full",
  "dominantStyle": "minimalist | maximalist | editorial | clean | dark-luxury | organic | bold-playful | earthy",
  "colorScheme": "light | dark",
  "navStyle": "bordered | transparent | filled",
  "heroHasBadge": "boolean",
  "heroHasOverlay": "boolean",
  "sectionOrder": ["hero", "product-grid", "categories", "footer"],
  "hasBenefitsBar": "boolean",
  "hasTestimonials": "boolean",
  "testimonialLayout": "grid | list | featured",
  "hasNewsletter": "boolean",
  "hasBrandStrip": "boolean",
  "hasAnnouncementBar": "boolean",
  "colorTemperature": "warm | cool | neutral"
}
```

## Real-Brand Style Matrix

Use this table to map observed site characteristics to `dominantStyle`:

| Site archetype                     | dominantStyle | colorScheme | navStyle    | fontStyle       | heroLayout |
| ---------------------------------- | ------------- | ----------- | ----------- | --------------- | ---------- |
| Master & Dynamic (luxury audio)    | dark-luxury   | dark        | transparent | modern-sans     | fullbleed  |
| Outdoor Voices (athleisure)        | bold-playful  | light       | bordered    | modern-sans     | centered   |
| Kit and Ace (minimal fashion)      | minimalist    | light       | bordered    | modern-sans     | minimal    |
| Rocky Mountain Soap (organic)      | organic       | light       | bordered    | modern-sans     | split      |
| Dr. Squatch (earthy personal care) | earthy        | light       | bordered    | modern-sans     | split      |
| Figs (bold medical apparel)        | maximalist    | light       | filled      | modern-sans     | split      |
| Holstee (artisan lifestyle)        | editorial     | light       | bordered    | editorial-serif | centered   |
| Studio Neat (minimal tech)         | minimalist    | light       | bordered    | mono-tech       | split      |
| Kettle & Fire (health food)        | clean         | light       | bordered    | modern-sans     | centered   |
| Love Wellness (soft beauty)        | bold-playful  | light       | bordered    | modern-sans     | centered   |

## Implementation Notes

- Prioritize brand colors over neutral background fills
- Detect `navStyle: "transparent"` when navbar overlaps hero image without a visible background fill
- Detect `navStyle: "filled"` when navbar background is a strong brand color
- Map `colorScheme: "dark"` when the page background is dark (below `#404040` luminance)
- Detect `borderRadius: "full"` from pill-shaped CTA buttons; `"none"` from sharp-cornered cards
- Set `fontStyle: "editorial-serif"` when serif fonts dominate headlines
- Set `fontStyle: "mono-tech"` when monospace or data-forward fonts are used (tech/product stores)
- Return `heroHasBadge: true` when an eyebrow label/pill appears above the main headline
- Return `testimonialsLayout: "featured"` when one large quote is flanked by smaller ones
- Extract `sectionOrder` by mapping visible sections top-to-bottom from the source
- Return `dominantStyle: "minimalist"` when negative space exceeds 60% of viewport
- Return `dominantStyle: "dark-luxury"` for dark backgrounds + premium product photography

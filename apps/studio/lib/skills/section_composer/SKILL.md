# Skill: section_composer

## Purpose

Compose section plans for modern ecommerce storefronts, including which sections to enable and how to populate their content payloads.

## Input Schema

```json
{
  "storeType": "string",
  "designSignals": {
    "dominantStyle": "minimalist | maximalist | editorial | clean",
    "sectionOrder": ["string"],
    "primaryColors": ["string"]
  },
  "catalogHighlights": ["string"],
  "voice": "string"
}
```

## Output Schema

```json
{
  "enableSections": [
    "announcement-bar",
    "benefits-bar",
    "featured-collection",
    "testimonials",
    "newsletter",
    "trust-badges",
    "brand-strip"
  ],
  "disableSections": ["string"],
  "sectionOrder": ["string"],
  "sectionData": {
    "announcement-bar": { "text": "string" },
    "benefits-bar": { "items": [{ "icon": "truck", "label": "string" }] },
    "featured-collection": { "heading": "string", "layout": "grid" },
    "testimonials": {
      "heading": "string",
      "items": [{ "quote": "string", "author": "string", "rating": 5 }]
    },
    "newsletter": {
      "heading": "string",
      "subtext": "string",
      "buttonText": "string"
    },
    "trust-badges": { "items": [{ "icon": "lock", "label": "string" }] },
    "brand-strip": { "brands": [{ "name": "string" }] }
  }
}
```

## Implementation Notes

- Keep the above-the-fold sequence focused: announcement, hero, benefits.
- Use product category to choose section depth and storytelling density.
- Ensure each generated section has complete, renderable data.
- Keep section order deterministic and stable unless explicitly changed.

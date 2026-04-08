# Skill: ui_extractor

## Purpose

Extract visual design elements from a URL or image input. Analyzes colors, typography, spacing, layout patterns, and component hierarchy to produce a structured design summary that downstream skills can consume.

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
  "layoutType": "split | centered | minimal | grid",
  "borderRadius": "none | md | full",
  "componentCount": "number",
  "dominantStyle": "minimalist | maximalist | editorial | clean",
  "sectionOrder": ["hero", "product-grid", "categories", "footer"]
}
```

## Example Usage

```typescript
// Called when a user provides a URL or drops an image.
// Runs before theme_generator and layout_planner to establish baseline design context.
const designSignals = await skills.ui_extractor.run({
  source: "https://example-store.com",
  extractionTargets: ["colors", "typography", "layout"],
});
```

## Implementation Notes

- Prioritize brand colors over neutral background fills
- Detect border-radius globally from card and button elements
- Identify hero layout type from the above-the-fold section
- If source is an image, run OCR to capture any visible brand text
- Return `dominantStyle: "minimalist"` when negative space exceeds 60% of viewport
- Extract `sectionOrder` by mapping visible sections top-to-bottom

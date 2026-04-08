# Skill: content_analyzer

## Purpose

Analyze storefront copy and messaging quality from a URL, screenshot OCR text, or provided text blocks. Produces structured guidance for brand voice, information hierarchy, and clarity.

## Input Schema

```json
{
  "source": "string (URL, screenshot text, or plain copy)",
  "brandContext": "string (optional)",
  "targetAudience": "string (optional)",
  "sections": ["hero", "featured-collection", "newsletter", "footer"]
}
```

## Output Schema

```json
{
  "tone": "modern | premium | playful | editorial | utilitarian",
  "readingLevel": "number",
  "clarityScore": "number (0-100)",
  "ctaStrength": "number (0-100)",
  "headlinePatterns": ["string"],
  "microcopyRecommendations": [
    {
      "section": "string",
      "before": "string",
      "after": "string",
      "reason": "string"
    }
  ]
}
```

## Implementation Notes

- Prefer concise, conversion-oriented headlines.
- Penalize vague adjectives without value proposition.
- Ensure CTA labels are action-oriented and specific.
- Flag repeated phrases and weak urgency language.

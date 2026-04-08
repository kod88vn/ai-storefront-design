# Skill: conversion_optimizer

## Purpose

Generate conversion-focused layout and UX recommendations using observed design signals, product category, and trust indicators.

## Input Schema

```json
{
  "productCategory": "string",
  "dominantStyle": "minimalist | maximalist | editorial | clean",
  "deviceMix": { "mobile": "number", "desktop": "number" },
  "currentSections": ["string"],
  "theme": {
    "primaryColor": "string",
    "secondaryColor": "string",
    "borderRadius": "none | md | full"
  }
}
```

## Output Schema

```json
{
  "priorityActions": ["string"],
  "experiments": [
    {
      "name": "string",
      "hypothesis": "string",
      "metric": "string",
      "expectedLift": "string"
    }
  ],
  "sectionRecommendations": {
    "add": ["testimonials", "trust-badges", "newsletter"],
    "remove": ["string"],
    "reorder": ["string"]
  }
}
```

## Implementation Notes

- Prioritize trust and friction-reduction on mobile-first storefronts.
- Recommend social proof placement near first purchase CTA.
- Suggest reducing section count when above-the-fold becomes cluttered.
- Include clear measurable metrics for every recommendation.

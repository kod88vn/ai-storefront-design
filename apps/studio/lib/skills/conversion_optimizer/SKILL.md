# Skill: conversion_optimizer

## Tags

conversion

## Purpose

Generate conversion-focused layout and UX recommendations. Synthesizes all upstream skill outputs to produce a final configuration that maximizes purchase intent based on the brand's archetype, product category, and trust signals.

## Input Schema

```json
{
  "productCategory": "string",
  "dominantStyle": "string",
  "tone": "modern | premium | playful | editorial | utilitarian",
  "deviceMix": { "mobile": "number", "desktop": "number" },
  "currentSections": ["string"],
  "theme": {
    "primaryColor": "string",
    "secondaryColor": "string",
    "borderRadius": "none | md | full",
    "navStyle": "bordered | transparent | filled",
    "colorScheme": "light | dark"
  }
}
```

## Output Schema

```json
{
  "priorityActions": ["string"],
  "sectionRecommendations": {
    "add": ["string"],
    "remove": ["string"],
    "reorder": ["string"]
  },
  "heroRecommendations": {
    "variant": "string",
    "badge": "string | null",
    "ctaVariant": "solid | outline | ghost"
  },
  "themeRecommendations": {
    "suggestion": "string"
  }
}
```

## Conversion Playbooks by Archetype

### Dark Luxury (Master & Dynamic)

- Hero: `fullbleed`, `ctaVariant: ghost`, `overlayOpacity: 0.5` — product hero image fills the screen
- Trust: `trust-badges` with icons: `award`, `globe`, `shield` ("Worldwide shipping", "2-year warranty")
- Social proof: `testimonials` with `featured` layout — one hero quote in brand color
- Skip `newsletter` incentive — luxury brands don't discount
- `navStyle: transparent` over the hero, filled on scroll (CSS-only approximation: use transparent always)
- **DO NOT** enable `brand-strip` — luxury brands curate their associations

### Organic / Natural Wellness

- Hero: `split`, left image of product in use (lifestyle photo), `badge: "100% Natural"`
- Benefits: `leaf`, `heart`, `check`, `award` — ingredients, ethics, returns, quality
- Testimonials: `list` layout with verified reviews — social proof is the #1 purchase driver
- Newsletter: `incentive: "Get 10% off your first order"` — drives first-purchase conversion
- `borderRadius: md` — softness signals approachability

### Bold Playful (Activewear / Wellness)

- Hero: `centered`, large type, `badge` with an offer (free shipping threshold)
- `announcement-bar` always on, `scrolling: true`, bright accent background
- Benefits: `zap` (fast), `truck` (shipping), `heart` (community), `refresh` (returns)
- `newsletter` with incentive — high email capture rates for this category
- `borderRadius: full` — pill shapes reinforce brand personality

### Health / Subscription

- Hero: `centered`, clinical copy, `badge: "Clinically Tested"` or `"30-Day Money Back"`
- `trust-badges` prominent (near the fold): `shield`, `check`, `award`, `lock`
- Testimonials: `grid` layout with star ratings visible — ratings are decisive in health category
- Newsletter: `buttonText: "Subscribe & Save"`, `incentive: "20% off your first subscription"`
- `benefits-bar` immediately after hero — eliminates purchase anxiety

### Editorial / Artisan

- Hero: `editorial` layout — massive typography, brand-statement copy
- Skip star ratings in testimonials — editorial brands use pull quotes over scores
- `featured-collection` with lifestyle photography placeholder
- `newsletter` without incentive — community/story angle: "Stories, updates, new drops"
- `navStyle: bordered` — clean separation preserves the editorial feel

## General Rules

- Always place `benefits-bar` within the first 2 sections for any store selling physical goods with shipping
- `trust-badges` near the CTA reduces cart abandonment — place above or below the product grid
- Social proof (`testimonials`) converts best when placed AFTER the product grid (post-consideration)
- Avoid enabling more than 7 sections total — page depth beyond that hurts mobile completion rates
- On dark-scheme sites: `navStyle: transparent` + `fullbleed` hero creates the immersive premium experience

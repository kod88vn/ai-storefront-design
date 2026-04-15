# Skill: content_analyzer

## Tags

content

## Purpose

Analyze storefront copy, messaging, and brand voice from a URL, screenshot OCR, or plain text. Produces structured guidance that `section_composer` uses to write on-brand copy for every section. Also extracts hero titles, subtitles, badge text, and CTA labels that directly populate `HeroConfig`.

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
  "heroTitle": "string",
  "heroSubtitle": "string",
  "heroBadge": "string | null",
  "heroCta": "string",
  "heroCtaSecondary": "string | null",
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

## Tone → Copy Style Guide

| Tone            | Headlines                                                   | CTA labels                           | Testimonial style                  | Newsletter incentive                |
| --------------- | ----------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------- |
| **premium**     | Short, confident, product-forward ("Engineered for life")   | "Shop Now", "Explore"                | No star ratings, attributed quotes | None (luxury avoids discounts)      |
| **modern**      | Benefit-led ("Feel the difference")                         | "Shop the Collection", "Get Started" | Star ratings shown                 | "Get 10% off your first order"      |
| **playful**     | Energetic, inclusive ("Move. Play. Repeat.")                | "Let's Go", "Join Us", "Get Yours"   | Star ratings, conversational       | "Join the community — 15% off"      |
| **editorial**   | Poetic, provocative ("The jacket that outlasts everything") | "Discover", "Read More"              | Long pull quotes, no stars         | Soft: "Stories, updates, new drops" |
| **utilitarian** | Specification-forward ("30mg Vitamin D — daily")            | "Subscribe & Save", "Buy Now"        | Ratings + verified badges          | "Subscribe and save 20%"            |

## Hero Copy Rules

- `heroTitle`: max 8 words, present tense, no filler adjectives
- `heroSubtitle`: 1-2 sentences, lead with the customer benefit, not product specs
- `heroBadge`: short pill (≤5 words). Use when the source site has eyebrow labels. Examples:
  - `"New Collection"` — fashion/seasonal
  - `"Free Shipping Over $50"` — conversion-focused
  - `"100% Natural Ingredients"` — organic brands
  - `"As seen on GQ"` — media/social proof
  - `"Handmade in the USA"` — artisan/heritage
- `heroCta`: imperative verb + noun. "Shop Now", "Explore the Collection", "Get Started". **Never leave blank** — if no CTA is extracted from the source, use "Shop Now" as the default.
- `heroCtaSecondary`: softer alternative for centered/split layouts. "Learn More", "See How It Works". If not applicable, omit (set to null).

## Implementation Notes

- This skill extracts signals only. It does NOT rewrite or change any existing storefront content.
- `heroTitle`, `heroSubtitle`, `heroBadge`, `heroCta` outputs are only used when writing copy for **brand-new** sections being added — never to overwrite existing hero content.
- Avoid vague adjectives: "innovative", "world-class", "revolutionary" — flag and replace
- Prefer concrete benefit language: "Ships in 24h", "30-day return window"
- CTA labels must be action-oriented and specific (not "Click here")
- Match the tone to the `dominantStyle` from `ui_extractor`: dark-luxury → premium; organic → modern; bold-playful → playful

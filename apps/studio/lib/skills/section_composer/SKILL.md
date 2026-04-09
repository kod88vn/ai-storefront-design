# Skill: section_composer

## Purpose

Compose section plans for modern ecommerce storefronts. Decides which sections to enable, populates their full content payloads, and ensures every section has complete renderable data. Runs after `layout_planner`.

## Input Schema

```json
{
  "storeType": "string",
  "dominantStyle": "string",
  "colorScheme": "light | dark",
  "sectionOrder": ["string"],
  "primaryColors": ["string"],
  "voice": "modern | premium | playful | editorial | utilitarian",
  "hasAnnouncementBar": "boolean",
  "hasBenefitsBar": "boolean",
  "hasTestimonials": "boolean",
  "testimonialLayout": "grid | list | featured",
  "hasNewsletter": "boolean",
  "hasBrandStrip": "boolean"
}
```

## Full Output Schema — sectionData

Every enabled section MUST have complete data. Never emit partial objects.

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
  "disableSections": [],
  "sectionOrder": ["hero", "product-grid", "categories", "footer"],
  "sectionData": {
    "announcement-bar": {
      "text": "string",
      "backgroundColor": "#hex",
      "textColor": "#fff",
      "scrolling": false,
      "emoji": "string | null",
      "link": "string | null",
      "dismissible": false
    },
    "benefits-bar": {
      "items": [
        {
          "icon": "truck",
          "label": "Free Shipping Over $50",
          "detail": "On all US orders"
        },
        {
          "icon": "refresh",
          "label": "30-Day Returns",
          "detail": "Hassle-free policy"
        },
        {
          "icon": "shield",
          "label": "Secure Checkout",
          "detail": "SSL encrypted"
        },
        {
          "icon": "award",
          "label": "Premium Quality",
          "detail": "Satisfaction guaranteed"
        }
      ]
    },
    "featured-collection": {
      "heading": "string",
      "subheading": "string",
      "layout": "grid"
    },
    "testimonials": {
      "heading": "string",
      "layout": "grid | list | featured",
      "showRatings": true,
      "items": [
        {
          "quote": "string",
          "author": "string",
          "location": "string",
          "rating": 5
        }
      ]
    },
    "newsletter": {
      "heading": "string",
      "subtext": "string",
      "placeholder": "Enter your email",
      "buttonText": "Subscribe",
      "backgroundColor": "#hex",
      "incentive": "string | null"
    },
    "trust-badges": {
      "items": [
        { "icon": "lock", "label": "Secure Payment" },
        { "icon": "truck", "label": "Fast Delivery" },
        { "icon": "refresh", "label": "Easy Returns" },
        { "icon": "award", "label": "Quality Guarantee" }
      ]
    },
    "brand-strip": {
      "heading": "As featured in",
      "brands": [{ "name": "string", "logoText": "string" }]
    }
  }
}
```

## Section Composition by Brand Archetype

### Dark Luxury (Master & Dynamic style)

- Enable: `announcement-bar`, `benefits-bar`, `trust-badges`
- `announcement-bar`: scrolling: true, emoji: null, dark background matching `primaryColor`
- `benefits-bar` icons: `award`, `shield`, `globe`, `zap`
- Testimonials: `featured` layout, showRatings: true
- Newsletter: incentive: null (luxury brands avoid discounting)
- Voice: premium

### Organic / Natural (Rocky Mountain Soap style)

- Enable: `benefits-bar`, `testimonials`, `newsletter`, `trust-badges`
- `benefits-bar` icons: `leaf`, `heart`, `check`, `award`
- Testimonials: `list` layout, showRatings: true
- Newsletter: incentive: "Get 10% off your first order"
- Voice: modern

### Bold / Playful (Outdoor Voices, Love Wellness style)

- Enable: `announcement-bar`, `benefits-bar`, `brand-strip`, `testimonials`, `newsletter`
- `announcement-bar`: emoji: "🎉", scrolling: true
- `benefits-bar` icons: `zap`, `heart`, `refresh`, `truck`
- Testimonials: `grid` layout, showRatings: true
- Newsletter: incentive: "Join the community — get 15% off"
- Voice: playful

### Editorial / Artisan (Holstee style)

- Enable: `featured-collection`, `testimonials`, `newsletter`
- Testimonials: `featured` layout, showRatings: false (editorial brands omit stars)
- Newsletter: incentive: null
- Voice: editorial

### Health / Supplements (Kettle & Fire, Hiya style)

- Enable: `announcement-bar`, `benefits-bar`, `trust-badges`, `testimonials`, `newsletter`
- `benefits-bar` icons: `check`, `shield`, `leaf`, `award`
- Testimonials: `grid` layout, showRatings: true
- Newsletter: incentive: "Subscribe and save 20%"
- Voice: utilitarian

## Implementation Notes

- Keep above-the-fold sequence: announcement-bar → hero → benefits-bar
- Newsletter `incentive` should match the store's voice (luxury brands skip it; wellness brands lean into it)
- `brand-strip` `heading` should be `"As seen in"` or `"Featured in"` — never empty when enabled

## Content Rules — ALWAYS ENFORCED

**Do NOT modify any content already present on the storefront.** Product names, descriptions, prices, hero titles, CTAs, category labels, and navbar/footer links are all off-limits.

**Always supply `sectionData` for every section you enable.** Each section component has built-in placeholder defaults — the components own those values. Your job is to provide the AI-chosen copy so the merchant can distinguish it from the defaults. Focus on style-appropriate choices (icons, incentive text, section heading) rather than generic filler.

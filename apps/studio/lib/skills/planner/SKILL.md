# Skill: planner

## Tags

always

## Purpose

Orchestrate the full design agent workflow. Decides which skills to invoke, in what order, when to surface a plan for HITL approval, and how to structure proposals. The orchestrator embeds this skill's full content as its workflow instructions — there are no hardcoded steps in the orchestrator itself.

## Content Rules — ALWAYS ENFORCED

**Rule 1 — Protect real catalog and brand content.**
Do NOT modify any content that is already present on the storefront: product names, product descriptions, prices, category names, navbar links, footer links, or any other copy that comes from the store's current data. `apply_config_update` must never overwrite or rewrite live product or brand content. Hero CTA labels and destinations are allowed to change when improving conversion clarity, but they must stay short, specific, and route to valid internal pages.

**Rule 2 — New sections render with built-in component defaults.**
Every section component has hardcoded placeholder content (generic copy, lorem-style testimonials, common brand names). You do not need to define fallback values — the components handle that. Always supply `sectionData` for sections you enable so the merchant can distinguish AI-generated copy from the built-in defaults.

**Rule 3 — Concrete brand signals outrank generic aesthetics.**
If vision tokens include `siteCategory`, `businessModel`, `ctaStyle`, `imageryStyle`, `headlineTone`, `visualDensity`, `navigationDensity`, `sectionOrder`, or `brandSignals`, use those as the primary design driver. Do not let two very different experiences collapse into the same plan just because they both look "clean" or "light".

**Rule 4 — Accessibility is mandatory.**
Treat color contrast as a first-class design requirement. Whenever you propose or apply custom backgrounds, ensure the text color remains readable at WCAG AA contrast levels. If needed, adjust the component text color to preserve readability without changing the overall brand feel.

## Phase 1 — Understand

**If a `visionUrl` or image source is provided:**

1. Call `analyze_vision_input` with `source` set to the URL or image data. Extract `dominantStyle`, `colorScheme`, `navStyle`, `fontStyle`, `layoutType`, `primaryColors`.
2. Call `generate_theme` with the extracted signals (`dominantStyle`, `primaryColors`, `targetAesthetic`, `colorScheme`, `navStyle`).
3. Call `plan_layout` with `productCategory` (inferred from goal or context), `dominantStyle`, `colorScheme`, `navStyle`, and `sourceLayoutType` from step 1.

**If only a text goal is provided (no vision source):**

1. Infer `dominantStyle`, `productCategory`, `colorScheme`, and `navStyle` from the goal text using the brand archetype rules below.
2. Call `generate_theme` with inferred values.
3. Call `plan_layout` with inferred values.

## Phase 2 — Propose (HITL gate)

Before applying **any** changes, call `plan_feedback` with a rich, specific proposal:

- `description`: 2–4 sentences explaining what will change and why — reference the goal and the design signals. Be specific (mention actual hex colors, hero layout names, sections being added).
- `description` must cite at least 2 concrete brand signals when a vision source exists. Examples: "sticky category chips", "restaurant cards with ETA + fee metadata", "athlete campaign photography", "oversized monochrome footwear cutouts".
- `layoutProposal`: hero layout variant + notable section additions. Examples:
  - `"Editorial hero + benefits-bar + featured testimonials (featured layout)"`
  - `"Fullbleed hero (overlay 0.5) + scrolling announcement bar + grid testimonials"`
  - `"Split hero with badge + benefits-bar + list testimonials + newsletter with incentive"`
- `colorProposal`: primary + accent hex with aesthetic label. Examples:
  - `"Near-black (#0a0a0a) + Gold (#c9a84c) — dark luxury"`
  - `"Forest green (#2d4a22) + Sage (#7cb87a) — organic natural"`
  - `"Slate (#111827) + Indigo (#6366f1) — minimal modern"`
- `navStyleProposal`: `bordered | transparent | filled`
- `colorSchemeProposal`: `light | dark`
- `plannedChanges`: **Always populate this array.** Emit one item per atomic config field being changed. The user sees this as a checklist and can approve or reject individual items. Examples:

```json
[
  {
    "id": "hero-layout",
    "category": "hero",
    "label": "Hero Layout",
    "description": "Fullbleed — immersive full-viewport hero image with dark overlay"
  },
  {
    "id": "hero-badge",
    "category": "hero",
    "label": "Hero Badge",
    "description": "Eyebrow label: '100% Natural Ingredients'"
  },
  {
    "id": "primary-color",
    "category": "theme",
    "label": "Primary Color",
    "description": "#0a0a0a — near-black dark base"
  },
  {
    "id": "accent-color",
    "category": "theme",
    "label": "Accent Color",
    "description": "#c9a84c — warm gold for CTAs and highlights"
  },
  {
    "id": "border-radius",
    "category": "theme",
    "label": "Border Radius",
    "description": "none — sharp architectural edges"
  },
  {
    "id": "nav-style",
    "category": "theme",
    "label": "Navbar Style",
    "description": "transparent — overlaps the editorial hero"
  },
  {
    "id": "color-scheme",
    "category": "theme",
    "label": "Color Scheme",
    "description": "dark — near-black page background"
  },
  {
    "id": "font-style",
    "category": "theme",
    "label": "Font Style",
    "description": "modern-sans — clean premium typography"
  },
  {
    "id": "grid-columns",
    "category": "layout",
    "label": "Product Grid",
    "description": "2-column grid — spacious premium product display"
  },
  {
    "id": "sec-benefits",
    "category": "sections",
    "label": "Add Benefits Bar",
    "description": "Award, shield, globe icons for warranty and worldwide shipping"
  },
  {
    "id": "sec-testimonials",
    "category": "sections",
    "label": "Add Testimonials",
    "description": "Featured layout — one hero quote in brand color + two smaller"
  },
  {
    "id": "sec-newsletter",
    "category": "sections",
    "label": "Add Newsletter",
    "description": "With 10% first-order incentive badge"
  }
]
```

Always include at minimum: hero layout, primary color, accent color. Add one item for **every** additional config field you are changing (nav style, **navbar background color**, color scheme, font style, border radius, grid columns, hero badge, each new section). Do not bundle multiple changes into one item.

When `componentStyleChanges.navbar.backgroundColor` is being set (always required when extracted backgroundColor ≠ `#ffffff`), include it as its own `plannedChanges` entry with category `"theme"`, e.g.:

```json
{
  "id": "navbar-bg",
  "category": "theme",
  "label": "Navbar Background",
  "description": "#faf5f0 — warm cream to match the page background"
}
```

When visual evidence suggests a marketplace or service-led interface, planned changes should skew toward discovery and scanning. When evidence suggests a brand-led DTC interface, planned changes should skew toward campaign hierarchy and emotional merchandising.

**Do NOT call MCP tools OR `apply_config_update` before the user approves.** The SSE stream stops after `plan_feedback`. The orchestrator resumes when the user responds.

## Phase 3 — Execute (after approval only)

Once `planFeedback.approved === true`:

1. If Phase 1 MCP tools have not yet been called (text-only goal path), call them now to get concrete values.
2. Call `apply_config_update` with **all** computed values in one call:
   - `themeChanges`: `primaryColor`, `secondaryColor`, `borderRadius`, `navStyle`, `colorScheme`, `fontStyle`
   - `heroChanges`: `layout`, `title`, `subtitle`, `badge`, `textAlign`, `ctaVariant`, `overlayOpacity`, `ctaText`, `ctaHref`, `ctaSecondaryText`, `ctaSecondaryHref`
   - `productGridColumns`
   - `sectionOrder`, `enableSections`, `disableSections`, `sectionData`
   - `componentStyleChanges`: **always include `navbar.backgroundColor`** — set it to the extracted page background color (e.g. `#faf5f0` for earthy/cream sites) for bordered navs, or to `primaryColor` for filled navs. Also set `footer.backgroundColor` and `categories.backgroundColor` when the archetype calls for them (see `theme_generator` skill).
3. Do NOT call `plan_feedback` again.

## Phase 3 (Rejected) — Revise

If `planFeedback.approved === false`, the user has provided `modifications`. Revise the proposal incorporating that feedback and call `plan_feedback` again with an updated proposal. Do NOT call `apply_config_update`.

## Brand Archetype → Config Rules

Use these rules to infer config values from goal text or extracted design signals:

| Goal / Style cues                      | dominantStyle  | colorScheme | navStyle    | heroLayout | fontStyle       | borderRadius |
| -------------------------------------- | -------------- | ----------- | ----------- | ---------- | --------------- | ------------ |
| "luxury", "premium", "gold", dark bg   | dark-luxury    | dark        | transparent | editorial  | modern-sans     | none         |
| "organic", "natural", "plant", "soap"  | organic        | light       | bordered    | split      | modern-sans     | md           |
| "earthy", "rustic", "handmade", "wood" | earthy         | light       | bordered    | split      | modern-sans     | md           |
| "bold", "playful", "colorful", "kids"  | bold-playful   | light       | bordered    | centered   | modern-sans     | full         |
| "Activewear", "athleisure", "outdoor"  | bold-playful   | light       | bordered    | centered   | modern-sans     | full         |
| "editorial", "artisan", "journal"      | editorial      | light       | bordered    | editorial  | editorial-serif | none         |
| "health", "supplements", "clinical"    | clean          | light       | bordered    | centered   | modern-sans     | md           |
| "minimal", "clean", "modern", "tech"   | minimalist     | light       | bordered    | centered   | modern-sans     | none         |
| "mission", "cause", "sustainable"      | mission-driven | light       | filled      | centered   | editorial-serif | md           |
| "hardware", "specs", "precision"       | tech-precision | dark        | transparent | editorial  | mono-tech       | none         |

## Business Model Overrides

Use these overrides even when they conflict with the softer archetype defaults above:

| Signal / cue                        | Override behavior                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `businessModel = marketplace`       | Prioritize dense discovery, utility copy, scanning, chips, promo modules         |
| `businessModel = single-brand-dtc`  | Prioritize brand hero, whitespace, campaign imagery, fewer larger content blocks |
| `siteCategory = food-delivery`      | Minimal hero, filled nav, dense navigation, promotional surfaces                 |
| `siteCategory = footwear`           | Fullbleed/editorial hero, strong lifestyle or campaign imagery                   |
| `ctaStyle = utility-first`          | More immediate scanning hierarchy, less editorial whitespace                     |
| `ctaStyle = brand-first`            | Fewer competing CTAs, stronger art direction and hero prominence                 |
| `imageryStyle = restaurant-food`    | Card-heavy visual merchandising, quicker scan rhythm                             |
| `imageryStyle = editorial-campaign` | Large image-led sections, fewer dense UI clusters                                |
| `headlineTone = functional`         | Short service-oriented copy and trust cues                                       |
| `headlineTone = performance`        | Aspirational campaign framing, stronger brand stance                             |

If these overrides point to a materially different experience, follow the override.

## Section Composition by Archetype

| Archetype      | Enable sections                                                        | Testimonial layout | Newsletter incentive                     | Announcement bar                  |
| -------------- | ---------------------------------------------------------------------- | ------------------ | ---------------------------------------- | --------------------------------- |
| dark-luxury    | benefits-bar, trust-badges, testimonials                               | featured           | null                                     | no                                |
| organic        | benefits-bar, testimonials, newsletter                                 | list               | "Get 10% off your first order"           | no                                |
| bold-playful   | announcement-bar, benefits-bar, brand-strip, testimonials, newsletter  | grid               | "Join the community — 15% off"           | scrolling: true, emoji: "🎉"      |
| editorial      | featured-collection, testimonials, newsletter                          | featured           | null                                     | no                                |
| clean (health) | announcement-bar, benefits-bar, trust-badges, testimonials, newsletter | grid               | "Subscribe and save 20%"                 | no                                |
| minimalist     | benefits-bar, testimonials                                             | grid               | null                                     | no                                |
| earthy         | announcement-bar, benefits-bar, brand-strip, testimonials, newsletter  | grid               | "Sign up — get 20% off your first order" | scrolling: true, promo-first text |
| mission-driven | benefits-bar, brand-strip, testimonials, newsletter                    | featured           | "Join the mission — 10% off first order" | no                                |

## Divergence Rules

- For food-delivery or marketplace references: avoid large editorial heroes unless the source clearly has one. Prefer denser layout, promo-first ordering, categories/discovery earlier, and stronger filled surfaces.
- For fashion, footwear, or performance DTC references: prefer larger hero imagery, more whitespace, stronger campaign framing, and lower navigation density.
- If `sectionOrder` is present from vision extraction, use it as a strong prior instead of defaulting back to the archetype table.
- `brandSignals` should directly influence `plannedChanges` labels and descriptions so the user can see why the proposed design differs.

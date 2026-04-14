# Skill: vision_context

## Tags

vision

## Purpose

Provide interpretation rules for pre-computed vision tokens. When an image is analyzed before the main agent loop, these rules govern how the extracted design tokens (siteCategory, businessModel, brandSignals, backgroundColor, etc.) should influence layout, section selection, and component styles. Runs alongside `ui_extractor`, `theme_generator`, and `layout_planner` for vision requests.

## High-Priority Interpretation Rules

Treat `siteCategory`, `businessModel`, `ctaStyle`, `imageryStyle`, `headlineTone`, `visualDensity`, `navigationDensity`, `sectionOrder`, and `brandSignals` as **more important** than generic labels like `dominantStyle` or `mood`.

Use these concrete signals to produce materially different outputs for different brands. A food-delivery marketplace must not generate the same layout, spacing, hierarchy, and section mix as a performance DTC brand.

- When `businessModel = marketplace`: favor utility-first UX — denser navigation, category discovery earlier, promo surfaces, trust/transaction cues, faster scanning hierarchy.
- When `businessModel = single-brand-dtc`: favor brand storytelling — stronger hero presence, campaign imagery, fewer but larger merchandising surfaces, more whitespace.
- Use `brandSignals` verbatim as evidence in `plan_feedback` descriptions so the rationale references visible differences instead of abstract adjectives.
- If `sectionOrder` is present from extraction, use it as a strong prior instead of defaulting to the archetype table.

## Background Color Rules — Apply to componentStyleChanges and sectionData

When vision tokens include `backgroundColor` and `sectionBackgroundColor`, apply them as follows:

- **`componentStyleChanges.navbar.backgroundColor`**: Set this ALWAYS when the extracted `backgroundColor` is not pure white (`#ffffff`). The navbar must match the page background for bordered navs (e.g. if the site has a cream `#faf5f0` background, set `navbar.backgroundColor: #faf5f0`). For `navStyle = filled`, set it to the brand fill color.
- **`componentStyleChanges.hero.backgroundColor`**: Set when `backgroundColor` is not default white/neutral and the hero doesn't use a full-bleed image.
- **`sectionData.announcement-bar.backgroundColor`**: Use `sectionBackgroundColor` or `primaryColor` — announcement bars should contrast with the page background.
- **`sectionData.newsletter.backgroundColor`**: Use `sectionBackgroundColor` for a tinted newsletter panel that stands out.
- **`componentStyleChanges.categories.backgroundColor`**: Set to `sectionBackgroundColor` when it differs from `backgroundColor` — category strips commonly use a tinted surface.
- **`componentStyleChanges.footer.backgroundColor`**: Set to a dark variant of the brand color when the extracted site has a dark footer — do not leave it at default white when a dark footer was clearly visible.
- Do not leave color fields at default white/gray when a reference color was extracted. Use pre-computed hex values verbatim.

## Earthy Brand Color Patterns

When `dominantStyle = earthy` and a reference image was provided:

- `footer.backgroundColor` → dark forest green range (`#1b4332`–`#2d4a22`) or dark walnut brown (`#1e1208`). Check extracted `backgroundColor` and `sectionBackgroundColor` for exact values.
- `categories.backgroundColor` → warm cream/tan (`#f0ebe4`–`#faf5f0`). Use `sectionBackgroundColor` if extracted.
- `announcement-bar.backgroundColor` → earthy primary color (dark brown `#3d2b1f` or brand dark). Use `primaryColor` from tokens.
- Page background: do NOT override to pure white — earthy brands use off-white/cream (`#faf5f0` or similar).

## Earthy Brand Section Signals

When `brandSignals` include terms like "announcement bar promo", "brand strip press logos", "high review count", "category chip navigation", "newsletter incentive", or "lifestyle product photography":

- Always enable `announcement-bar` (scrolling, promo-first text)
- Always enable `brand-strip` (press legitimacy)
- Always enable `testimonials` with `grid` layout and star ratings
- Always enable `newsletter` with a discount incentive
- Always enable `benefits-bar` with natural/quality icons (`leaf`, `check`, `shield`, `award`)

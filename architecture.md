# AI Storefront Design Studio — Architecture

## Overview

A Turborepo monorepo containing two Next.js applications sharing a common rendering engine and type system. The **Studio** app is an AI-powered design tool where an agent proposes and applies storefront changes with human-in-the-loop approval. The **Web** app is the live storefront that always reflects the latest saved configuration.

---

## Monorepo Structure

```
/
├── apps/
│   ├── studio/          # AI design tool (port 3001)
│   └── web/             # Live storefront (port 3000)
│
├── packages/
│   ├── storefront-components/   # Shared rendering engine (@ai-storefront/storefront-components)
│   ├── types/                   # Shared TypeScript interfaces (@ai-storefront/types)
│   └── ui/                      # Base UI primitives (@ai-storefront/ui)
│
├── turbo.json           # Turborepo pipeline
└── package.json         # Yarn workspace root
```

**Package manager:** Yarn 1 (Classic). Always use `yarn`, never `npm` or `pnpm`.  
**Build system:** Turborepo (`turbo build`, `turbo dev`).

---

## Shared Rendering Engine (`packages/storefront-components`)

Single source of truth for all storefront UI. Both apps import from `@ai-storefront/storefront-components`. Neither app maintains its own copy of storefront components.

```
packages/storefront-components/src/
├── storefront-preview.tsx   # Master renderer — applies theme CSS vars, renders ordered sections
├── navbar.tsx               # 3 navStyle variants + hamburger mobile menu; cart icon is <a href="/cart">
├── hero.tsx                 # 3 layout variants: split, centered, editorial
├── product-grid.tsx         # Responsive grid with badge overlays and star ratings
├── categories.tsx           # Category grid (2 → 4 cols)
├── extra-sections.tsx       # announcement-bar, benefits-bar, featured-collection,
│                            # testimonials (grid/list/featured), newsletter, trust-badges, brand-strip
├── footer.tsx               # 4-column responsive footer
└── data.ts                  # Sample products and categories
```

### Tailwind scanning

Both apps include `@source` directives so Tailwind v4 scans the shared package:

```css
/* apps/*/app/globals.css */
@source "../../../packages/storefront-components/src";
@source "../../../packages/types/src";
```

Both `next.config.mjs` files declare:

```js
transpilePackages: [
  "@ai-storefront/storefront-components",
  "@ai-storefront/types",
];
```

### Mobile responsiveness

Storefront components are mobile-first. Studio canvas is assumed to be desktop-only.

| Component    | Mobile baseline                  | Breakpoints                           |
| ------------ | -------------------------------- | ------------------------------------- |
| Navbar       | Hamburger menu (useState toggle) | `md:` hidden toggle, horizontal links |
| Hero split   | Single column                    | `lg:grid-cols-2`                      |
| Product grid | 1 column                         | `sm:2`, `lg:3/4`                      |
| Categories   | 2 columns                        | `lg:4`                                |
| Newsletter   | Stacked input + button           | `sm:flex-row`                         |
| Footer       | 2 columns                        | `md:4`                                |

---

## Shared Types (`packages/types`)

All interfaces live in `packages/types/src/index.ts` and are imported by both apps and the shared package.

### Schema (single source of truth)

`packages/types/src/schema.ts` exports **all `as const` option arrays** for every enum-like value in the system. This is the **only file you need to edit** when adding or removing options (hero layouts, dominant styles, nav styles, etc.).

```typescript
// packages/types/src/schema.ts
export const HERO_LAYOUTS = ["split", "centered", "editorial"] as const;
export const DOMINANT_STYLES = ["minimalist", "maximalist", "editorial", "clean", "dark-luxury", ...] as const;
export const NAV_STYLES = ["bordered", "transparent", "filled"] as const;
export const FONT_STYLES = ["modern-sans", "geometric-sans", "humanist-sans", "editorial-serif", ...] as const;
// ... and BORDER_RADII, COLOR_SCHEMES, HERO_CTA_VARIANTS, SOURCE_LAYOUT_TYPES, etc.

// Skill template vars — injected into SKILL.md {{VAR}} placeholders at load time
export const SKILL_TEMPLATE_VARS: Record<string, string> = { ... };
```

Everything else derives from schema automatically:

| Consumer                                            | How it uses schema                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `packages/types/src/index.ts`                       | `HeroLayout = typeof HERO_LAYOUTS[number]` — union types auto-derived            |
| `apps/studio/app/api/mcp/route.ts`                  | Imports arrays directly — no local re-declarations                               |
| `apps/studio/components/studio/prebuilt-editor.tsx` | Imports `HERO_LAYOUTS` — dropdown always in sync                                 |
| `apps/studio/lib/skills/*.SKILL.md`                 | Uses `{{HERO_LAYOUTS}}`, `{{DOMINANT_STYLES}}`, etc. — interpolated at load time |

### Core config

```typescript
interface StorefrontConfig {
  theme: ThemeConfig;
  sections: LayoutSection[]; // ordered, enabled/disabled
  hero: HeroConfig;
  productGrid: ProductGridConfig;
  sectionData: StorefrontSectionData; // keyed by SectionType
  nav?: NavConfig;
  categories?: CategoriesConfig;
  footer?: FooterConfig;
  pages?: Partial<PagesConfig>; // per-page config (products, cart, productDetail)
  customPages?: Array<{
    id: string;
    name: string;
    slug: string; // e.g. "/about"
    sections?: LayoutSection[]; // saved from studio designer containers
  }>;
  pagesSections?: Partial<
    Record<"products" | "product-detail" | "cart", LayoutSection[]>
  >;
  // ^^ saved section order for each core page; falls back to defaults if absent
}

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full"; // BorderRadius
  navStyle?: "bordered" | "transparent" | "filled"; // NavStyle
  colorScheme?: "light" | "dark"; // ColorScheme
  fontStyle?:
    | "modern-sans"
    | "geometric-sans"
    | "humanist-sans"
    | "editorial-serif"
    | "display-serif"
    | "slab-serif"
    | "mono-tech"
    | "handwritten"
    | "condensed"
    | "rounded"; // FontStyle
}

interface HeroConfig {
  layout: "split" | "centered" | "editorial"; // HeroLayout
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
  badge?: string; // eyebrow pill label above headline
  textAlign?: "left" | "center";
  overlayOpacity?: number; // 0–1 for overlays
  ctaVariant?: "solid" | "outline" | "ghost"; // HeroCtaVariant
  // Per-section style overrides (take precedence over theme defaults)
  backgroundColor?: string;
  textColor?: string;
  fontSize?: "sm" | "base" | "lg" | "xl";
}

/** Per-component style overrides shared by hero, productGrid, categories, footer, navbar */
interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: "sm" | "base" | "lg" | "xl";
}
```

### Section data types

Key section config interfaces (all in `packages/types/src/index.ts`):

```typescript
interface AnnouncementBarConfig {
  text: string;
  backgroundColor: string;
  textColor: string;
  scrolling?: boolean; // marquee repeat for promotional bars
  emoji?: string; // prefix emoji for playful brands
  link?: string | null;
  dismissible?: boolean;
}

interface BenefitItem {
  icon:
    | "truck"
    | "shield"
    | "refresh"
    | "award"
    | "clock"
    | "leaf"
    | "star"
    | "heart"
    | "check"
    | "zap"
    | "globe"
    | "tag";
  label: string;
  detail?: string;
}

interface TestimonialsConfig {
  heading: string;
  layout: "grid" | "carousel" | "list" | "featured";
  showRatings?: boolean;
  items: TestimonialItem[];
}

interface NewsletterConfig {
  heading: string;
  subtext: string;
  placeholder?: string;
  buttonText: string;
  backgroundColor: string;
  incentive?: string; // e.g. "Get 10% off your first order"
}
```

### Agent / HITL types

```typescript
interface PlanChange {
  id: string;
  category: "theme" | "hero" | "layout" | "sections" | "content";
  label: string;
  description: string;
}

interface AgentPlan {
  id: string;
  description: string;
  layoutProposal: string;
  colorProposal: string;
  navStyleProposal?: string;
  colorSchemeProposal?: string;
  approved: boolean | null;
  plannedChanges?: PlanChange[];
}

interface PlanFeedback {
  approved: boolean;
  modifications?: string;
  userSuggestion?: string;
  previousPlan?: {
    description: string;
    layoutProposal: string;
    colorProposal: string;
    navStyleProposal?: string;
    colorSchemeProposal?: string;
  };
}

interface AppliedSummary {
  planDescription: string | null;
  theme: { before: Partial<ThemeConfig>; after: Partial<ThemeConfig> } | null;
  // Individual tracked fields surfaced in the Applied Changes panel:
  //   primaryColor, secondaryColor, borderRadius, navStyle, colorScheme, fontStyle
  hero: { before: Partial<HeroConfig>; after: Partial<HeroConfig> } | null;
  productGridColumns: { before: number; after: number } | null;
  sectionOrder: string[] | null; // final ordered section IDs after apply
}
```

---

## Studio App (`apps/studio`)

### Three-pane layout

```
┌─────────────────┬────────────────────────────────┬──────────────────┐
│   Left Sidebar  │         Center Canvas          │  Right Sidebar   │
│   (320px fixed) │         (flex-1 fluid)         │  (320px fixed)   │
├─────────────────┼────────────────────────────────┼──────────────────┤
│ Vision URL input│  Viewport toolbar              │ Theme Panel      │
│ Image drop zone │  ┌──────────────────────────┐  │ Layout Panel     │
│ Skills list     │  │  StorefrontPreview       │  │ Content Panel    │
│ Run AI button   │  │  (scaled iframe-style)   │  │                  │
│ ─────────────── │  └──────────────────────────┘  │ [Save to Web]    │
│ Execution trace │                                │                  │
│ HITL approval   │                                │                  │
│ Applied summary │                                │                  │
├─────────────────┴────────────────────────────────┴──────────────────┤
│                    Audit Trail (collapsible)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### File locations

```
apps/studio/
├── app/
│   ├── layout.tsx                   # ThemeProvider (dark), global fonts
│   ├── page.tsx                     # Renders <StudioLayout />
│   ├── globals.css                  # Studio dark theme tokens + @source directives
│   └── api/
│       ├── mcp/route.ts             # MCP server endpoint (5 tools: analyze_vision_input,
│       │                            #   generate_theme, plan_layout,
│       │                            #   get_storefront_config, apply_config_update)
│       ├── orchestrate/route.ts     # SSE orchestrator stream
│       ├── skills/route.ts          # Skill manifest loader
│       └── store-config/route.ts    # GET/PUT — reads/writes apps/web/data/store-config.json
│
├── components/studio/
│   │
│   │  ── Shell ─────────────────────────────────────────────────────
│   ├── studio-layout.tsx            # Three-pane shell
│   ├── center-canvas.tsx            # Viewport scaler + StorefrontPreview
│   ├── audit-trail.tsx              # Collapsible JSON-RPC log
│   │
│   │  ── Left sidebar (orchestrator + HITL) ─────────────────────────
│   ├── left-sidebar.tsx             # Orchestrator panel — composes sub-components below
│   ├── vision-input.tsx             # URL input + image drag-and-drop zone
│   ├── execution-trace.tsx          # AI step list with spinner / checkmarks
│   ├── plan-approval.tsx            # InlinePlanApproval HITL card + ChangeItem rows
│   ├── applied-summary.tsx          # Post-apply before→after summary panel
│   │
│   │  ── Right sidebar (live editor) ──────────────────────────────────
│   ├── right-sidebar.tsx            # Shell — composes ThemePanel + ContainersPanel + Save
│   ├── theme-panel.tsx              # Colors, border radius, nav style, color scheme, font
│   ├── containers-panel.tsx         # Container list header + Add Container button
│   ├── container-node.tsx           # Recursive container tree node, ComponentRow, picker
│   ├── container-layout-config.tsx  # Stack / Flex / Grid layout picker (visual 3×3 grid)
│   ├── nav-panel.tsx                # Navigation panel (brand name, links, bg/text color pickers)
│   ├── page-selector.tsx            # Page tabs (home, products, cart, product-detail, custom pages)
│   ├── page-settings-panel.tsx      # Custom page CRUD (create/rename/delete custom pages)
│   │
│   │  ── Component editor (editor pane, slides in from bottom of right sidebar)
│   ├── component-editor.tsx         # Main dispatch + custom-text / custom-image editors
│   ├── prebuilt-editor.tsx          # Hero, ProductGrid, and all SectionData editors
│   │                               # Each editor includes its own bg/text/fontSize controls
│   ├── wysiwyg-editor.tsx           # Rich-text toolbar + contentEditable area
│   └── advanced-section.tsx         # Tailwind class pill manager
│
├── hooks/
│   └── use-orchestrator.ts          # SSE stream handler, resumeWithFeedback
│
├── lib/
│   ├── store.ts                     # Zustand store
│   └── design-studio/
│       └── orchestrator.ts          # Agent orchestration logic
│
└── lib/skills/                      # AI skill definitions loaded at runtime
    ├── planner/SKILL.md             # Workflow orchestration (phases 1–3, brand archetypes)
    ├── ui_extractor/SKILL.md        # Visual signal extraction from URLs/images
    ├── theme_generator/SKILL.md     # ThemeConfig generation from design signals
    ├── layout_planner/SKILL.md      # Hero variant + section order + hero micro-params
    ├── section_composer/SKILL.md    # Section content population and brand archetype rules
    ├── content_analyzer/SKILL.md    # Brand voice and copy analysis
    └── conversion_optimizer/SKILL.md # Conversion playbooks by brand archetype
```

### Component size budget

Every studio component is kept under ~200 lines. The refactoring split three monolithic files (613 / 488 / 410 lines) into 14 focused single-responsibility files:

| File                          | Lines | Responsibility               |
| ----------------------------- | ----- | ---------------------------- |
| `left-sidebar.tsx`            | ~146  | Orchestration shell only     |
| `vision-input.tsx`            | ~80   | URL + image drop zone        |
| `execution-trace.tsx`         | ~50   | Step list UI                 |
| `plan-approval.tsx`           | ~190  | HITL approval card           |
| `applied-summary.tsx`         | ~107  | Post-apply diff display      |
| `right-sidebar.tsx`           | ~64   | Editor shell + Save button   |
| `theme-panel.tsx`             | ~71   | Theme controls               |
| `containers-panel.tsx`        | ~64   | Container list               |
| `container-node.tsx`          | ~166  | Recursive tree node          |
| `container-layout-config.tsx` | ~122  | Layout mode picker           |
| `component-editor.tsx`        | ~108  | Custom editor dispatch       |
| `prebuilt-editor.tsx`         | ~185  | All prebuilt section editors |
| `wysiwyg-editor.tsx`          | ~60   | Rich text editor             |
| `advanced-section.tsx`        | ~54   | Tailwind class manager       |

### State management (Zustand)

```typescript
// apps/studio/lib/store.ts
interface StudioStore {
  config: StorefrontConfig; // Live config driving the canvas preview
  containers: DesignerContainer[]; // What the studio canvas renders (separate from config.sections)
  visionUrl: string;
  agentStep: AgentStep; // idle | thinking | decomposing | executing | awaiting-approval | complete
  agentPlan: AgentPlan | null; // Set when agent proposes changes
  appliedSummary: AppliedSummary | null;
  auditLog: AuditLogEntry[];
  loadedSkills: LoadedSkill[];
  orchestratorGoal: string | null;
  orchestratorContext: OrchestratorContext | null;

  // Granular config updaters
  updateTheme(patch: Partial<ThemeConfig>): void;
  updateHero(patch: Partial<HeroConfig>): void;
  setProductGridColumns(cols: 2 | 3 | 4): void;
  reorderSections(sections: LayoutSection[]): void;
  enableSection(type: SectionType): void;
  disableSection(type: SectionType): void;
  toggleSection(id: string): void;
  updateSectionData(patch: Partial<StorefrontSectionData>): void;
  // Atomic container update — updates containers AND syncs config.sections
  reorderContainers(containers: DesignerContainer[]): void;
}
```

### Dual section data models

The studio maintains two parallel representations of section layout that must be kept in sync:

| Model             | Type                  | What uses it                                                     |
| ----------------- | --------------------- | ---------------------------------------------------------------- |
| `containers`      | `DesignerContainer[]` | Studio canvas (`center-canvas.tsx`) — what you see while editing |
| `config.sections` | `LayoutSection[]`     | Web storefront preview + `StorefrontConfig` persistence          |

`syncSectionsFromContainers` (store-internal) provides a **one-way** `containers → config.sections` sync. It runs automatically whenever `containers` changes (via `addContainer`, `removeContainer`, `reorderContainers`).

When the orchestrator applies section changes (`enableSections`, `disableSections`, `sectionOrder`), the hook in `use-orchestrator.ts` **must** call `reorderContainers` — not `enableSection`/`reorderSections` — so that both models update atomically. Calling only the section-level actions leaves `containers` stale and the canvas unchanged.

---

## Skill System

Skills are markdown files under `apps/studio/lib/skills/*/SKILL.md`. They are loaded from disk at runtime and embedded in the AI system prompt. No orchestrator code changes are needed when skills are added or updated.

### Tag-based loading

Each SKILL.md declares a `## Tags` section. The orchestrator loads only skills whose tags match the current request:

```markdown
## Tags

always
```

| Tag          | Loaded when                                                               |
| ------------ | ------------------------------------------------------------------------- |
| `always`     | Every request                                                             |
| `vision`     | Request has `context.imageData` or `context.visionUrl`                    |
| `content`    | Goal contains words like copy, content, message, voice, description       |
| `conversion` | Goal contains words like convert, conversion, sale, checkout, cta, funnel |

Skills with no `## Tags` section are always loaded (backwards-compatible).

### Skill Inventory

| Skill                    | Tag          | Purpose                                                                                                                                                                                                                 |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **planner**              | `always`     | Defines the three-phase workflow (Understand → Propose → Execute). Brand archetype → config inference rules. Embeds as the main workflow instruction in the system prompt.                                              |
| **theme_generator**      | `always`     | Maps `dominantStyle` + `targetAesthetic` to a full `ThemeConfig` including `navStyle`, `colorScheme`, `fontStyle`. 10 preset rows. Supports `componentStyleChanges` for per-section background/text/fontSize overrides. |
| **layout_planner**       | `always`     | Selects hero variant (`split\|centered\|editorial`), produces `heroBadge`, `heroTextAlign`, `heroCtaVariant`. 15-row category × style decision matrix.                                                                  |
| **section_composer**     | `always`     | Populates section data payloads. Defines 5 archetype composition guides (dark-luxury, organic, bold-playful, editorial, health).                                                                                        |
| **ui_extractor**         | `vision`     | Extracts `dominantStyle`, `navStyle`, `colorScheme`, `fontStyle`, `heroLayout`, section order from a URL or image. Maps to 10 brand archetypes.                                                                         |
| **content_analyzer**     | `content`    | Analyzes copy tone and produces hero title/subtitle/badge/CTA text. Tone × copy style table covering 5 voice types.                                                                                                     |
| **conversion_optimizer** | `conversion` | Conversion playbooks by brand archetype — which sections, testimonial layouts, newsletter incentives, and trust badge placements maximize purchase intent.                                                              |

### Skill template interpolation

SKILL.md files use `{{VAR}}` placeholders that are replaced at load time with values from `SKILL_TEMPLATE_VARS` in `schema.ts`. This keeps prompt schemas in sync with TypeScript types automatically.

```markdown
<!-- In SKILL.md -->

"heroVariant": "{{HERO_LAYOUTS}}"

<!-- Rendered as -->

"heroVariant": "split | centered | editorial"
```

Available template variables: `{{HERO_LAYOUTS}}`, `{{DOMINANT_STYLES}}`, `{{NAV_STYLES}}`, `{{COLOR_SCHEMES}}`, `{{FONT_STYLES}}`, `{{BORDER_RADII}}`, `{{HERO_CTA_VARIANTS}}`, `{{FONT_SIZES}}`, `{{GRID_COLUMNS}}`, `{{SOURCE_LAYOUT_TYPES}}`.

### Workflow Phases (driven by `planner/SKILL.md`)

The planner skill defines three phases:

1. **Understand** — call `analyze_vision_input` (if vision source provided) → `generate_theme` → `plan_layout`
2. **Propose (HITL gate)** — call `plan_feedback` with a rich proposal. Stream stops. Client resumes after user responds.
3. **Execute** — after approved, call `apply_config_update` with all computed values in a single call.

The orchestrator builds the system prompt with:

- `planner/SKILL.md` verbatim as the main workflow instruction
- All other loaded skills embedded in full under a `## Skill References` section (not just name + purpose)
- Pre-computed vision tokens (if image supplied — see Vision Pipeline below)
- MCP tool schemas and current `StorefrontConfig`

The AI decides which MCP tools to call and in what order based on the planner instructions.

---

## Orchestrator (`apps/studio/lib/design-studio/orchestrator.ts`)

A stateless async generator that:

1. Loads SKILL.md files from disk, filtered by tag for this request
2. Discovers MCP tools via `tools/list` JSON-RPC call
3. **(If image supplied)** Runs vision pre-analysis with `grok-4-0709` → extracts exact hex colors + design tokens
4. Builds the system prompt: planner skill (full) + supporting skills (full, under `## Skill References`) + pre-computed vision tokens + MCP tool schemas + current config
5. Runs a multi-turn `generateText` loop (AI SDK v6) using the primary model (`grok-3`)
6. Intercepts `plan_feedback` tool calls → emits `plan_description` SSE event → stops the stream
7. Intercepts `apply_config_update` → emits `config_update` SSE event
8. Forwards all other tool calls to the MCP endpoint dynamically

### Vision pipeline (two-step)

`grok-3` (primary model) is text-only. When `context.imageData` is present, the orchestrator first calls `grok-2-vision-1212` to extract structured design tokens:

```json
{
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "borderRadius": "none|sm|md|lg|xl|full",
  "fontStyle": "modern-sans|editorial-serif|...",
  "navStyle": "bordered|transparent|filled",
  "colorScheme": "light|dark",
  "dominantStyle": "dark-luxury|organic|...",
  "heroLayout": "split|centered|...",
  "sectionOrder": ["hero", ...],
  "targetAesthetic": "string"
}
```

These tokens are injected into the system prompt under a `## Pre-Computed Design Tokens` heading. The planner skill instructs the AI to use these values directly (skipping the MCP `analyze_vision_input` call) so the exact extracted colors are preserved through to `apply_config_update`.

### Dynamic MCP tool registration

MCP tools are registered at runtime from the `tools/list` response — the orchestrator has **no hardcoded tool schemas**. New tools added to the MCP server are automatically available without orchestrator changes:

```typescript
const dynamicMcpTools = Object.fromEntries(
  mcpTools.map((t) => [
    t.name,
    tool({
      description: `${t.description}\n\nSchema: ${JSON.stringify(t.inputSchema)}`,
      inputSchema: z.record(z.string(), z.unknown()),
    }),
  ]),
);
```

### Internal tools (handled by orchestrator directly, never forwarded to MCP)

| Tool            | Purpose                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plan_feedback` | HITL gate — presents proposal to the user and stops the SSE stream. Includes `navStyleProposal`, `colorSchemeProposal`, `plannedChanges[]` (per-field items). |

### MCP tools (discovered dynamically, forwarded via HTTP)

`apply_config_update` is now a **MCP tool**. When the AI calls it the orchestrator:

1. Forwards the call to `POST /api/mcp` (same as all other MCP tools)
2. Still intercepts the tool result to emit a `config_update` SSE event to the UI

This means `apply_config_update` is externally reachable — any MCP client can drive storefront changes.

---

## MCP Server (`apps/studio/app/api/mcp/route.ts`)

JSON-RPC 2.0 server implementing 5 tools. All tools are discovered at runtime by the orchestrator via `tools/list` — no hardcoded schemas in the orchestrator.

### `analyze_vision_input`

Extracts design signals from a URL or description. Detects 10 brand archetypes from keyword patterns and returns:

```json
{
  "primaryColors": ["#hex"],
  "fontStyle": "modern-sans | editorial-serif | mono-tech",
  "layoutType": "editorial | centered | split",
  "borderRadius": "none | md | full",
  "dominantStyle": "dark-luxury | organic | editorial | bold-playful | clean | earthy | maximalist | minimalist | mission-driven | tech-precision",
  "colorScheme": "light | dark",
  "navStyle": "bordered | transparent | filled",
  "targetAesthetic": "string"
}
```

### `generate_theme`

Maps `dominantStyle` + optional `targetAesthetic` / `colorScheme` / `navStyle` to a full theme preset. 10 presets keyed by `dominantStyle`:

| dominantStyle  | primaryColor | secondaryColor | radius | navStyle    | scheme | fontStyle       |
| -------------- | ------------ | -------------- | ------ | ----------- | ------ | --------------- |
| dark-luxury    | `#0a0a0a`    | `#c9a84c`      | none   | transparent | dark   | modern-sans     |
| organic        | `#2d4a22`    | `#7cb87a`      | md     | bordered    | light  | modern-sans     |
| editorial      | `#1a1a1a`    | `#e8b84b`      | none   | bordered    | light  | editorial-serif |
| bold-playful   | `#1a1a1a`    | `#f97316`      | full   | bordered    | light  | modern-sans     |
| clean          | `#0f4c35`    | `#22c55e`      | md     | bordered    | light  | modern-sans     |
| earthy         | `#3d2b1f`    | `#a16207`      | md     | bordered    | light  | modern-sans     |
| minimalist     | `#111827`    | `#6366f1`      | none   | bordered    | light  | modern-sans     |
| maximalist     | `#1a1a1a`    | `#f97316`      | full   | bordered    | light  | modern-sans     |
| mission-driven | `#1e3a5f`    | `#0ea5e9`      | md     | filled      | light  | editorial-serif |
| tech-precision | `#0f172a`    | `#3b82f6`      | none   | transparent | dark   | mono-tech       |

`borderRadius` valid values (expanded): `none`, `sm`, `md`, `lg`, `xl`, `full`

`fontStyle` valid values: `modern-sans`, `geometric-sans`, `humanist-sans`, `editorial-serif`, `display-serif`, `slab-serif`, `mono-tech`, `handwritten`, `condensed`, `rounded`

### `plan_layout`

Returns hero variant and all micro-parameters:

```json
{
  "heroVariant": "split | centered | editorial",
  "heroBadge": "string | null",
  "heroTextAlign": "left | center",
  "heroCtaVariant": "solid | outline | ghost",
  "heroOverlayOpacity": 0.0,
  "sectionOrder": ["hero", "benefits-bar", "product-grid", "..."],
  "productGridColumns": 3
}
```

### `get_storefront_config`

Reads and returns the current live `StorefrontConfig` from `store-config.json` (or KV if configured). Allows external agents and the AI to inspect the full configuration before proposing changes — rather than relying on the summary string embedded in the system prompt.

### `apply_config_update`

Accepts a design patch (same shape as the `apply_config_update` args in the orchestrator — `themeChanges`, `heroChanges`, `sectionOrder`, `componentStyleChanges`, etc.), validates it, and echoes it back. The orchestrator intercepts this tool result to emit a `config_update` SSE event to the studio UI, which triggers the Zustand store update. Disk persistence happens when the user clicks Save.

**Why in MCP:** External agents (or future automation) can call `apply_config_update` directly over the MCP protocol to drive storefront design changes without going through the studio UI.

---

## HITL (Human-in-the-Loop) Flow

```
1. User submits goal (URL or free text + optional image)
        │
        ▼
2. Orchestrator runs Phase 1 — calls analyze_vision_input → generate_theme → plan_layout
        │
        ▼
3. Orchestrator calls plan_feedback → emits plan_description SSE event → stream stops
        │
        ▼
4. InlinePlanApproval renders in left sidebar:
   ┌──────────────────────────────────────────┐
   │ [description text]                       │
   │                                          │
   │ ☑ Color & Theme — "<colorProposal>"      │
   │ ☑ Layout — "<layoutProposal>"            │
   │ ☑ NavStyle — "<navStyleProposal>"        │
   │   (or explicit PlanChange[] items)       │
   │                                          │
   │ Add your own idea: [textarea]            │
   │                                          │
   │ [Approve All]  [Cancel]                  │
   └──────────────────────────────────────────┘
        │
        ├─ Approved → agent calls apply_config_update → config_update SSE → DONE
        │
        └─ Rejected / modified → approved: false
              modifications = synthesized from rejected items + suggestion
              → resumeWithFeedback() → orchestrator re-runs from Phase 2 (Revise)
              → loop repeats
```

`resumeWithFeedback` embeds the previous plan in `PlanFeedback.previousPlan` (including `navStyleProposal` and `colorSchemeProposal`) so the AI has full revision context on stateless re-runs.

---

## AI Stack

| Layer         | Technology                                                           |
| ------------- | -------------------------------------------------------------------- |
| Primary LLM   | xAI Grok-3 via `@ai-sdk/xai` (text-only)                             |
| Vision LLM    | `grok-4-0709` — image pre-analysis only                              |
| AI SDK        | Vercel AI SDK v6 (`ai@6.0.152`)                                      |
| Transport     | Server-Sent Events (SSE) at `/api/orchestrate`                       |
| Tool protocol | MCP server at `/api/mcp` (JSON-RPC 2.0)                              |
| Skill loading | `lib/skills/*/SKILL.md` — read from disk at runtime, filtered by tag |

### SSE event types

```typescript
type OrchestratorEvent =
  | { type: "progress"; agentStep: AgentStep; message: string }
  | { type: "audit"; entry: Omit<AuditLogEntry, "id" | "timestamp"> }
  | { type: "plan_description"; plan: Omit<AgentPlan, "approved"> }
  | { type: "config_update"; configUpdate: OrchestratorConfigUpdate }
  | { type: "complete"; agentStep: "complete" }
  | { type: "error"; error: string };
```

---

## Brand Archetype System

The skill system understands 10 brand archetypes. Each maps to a full config combination:

| Archetype                             | dominantStyle  | navStyle    | colorScheme | heroLayout | fontStyle       | borderRadius |
| ------------------------------------- | -------------- | ----------- | ----------- | ---------- | --------------- | ------------ |
| Dark luxury (Master & Dynamic)        | dark-luxury    | transparent | dark        | editorial  | modern-sans     | none         |
| Organic/natural (Rocky Mountain Soap) | organic        | bordered    | light       | split      | modern-sans     | md           |
| Editorial/artisan (Holstee)           | editorial      | bordered    | light       | editorial  | editorial-serif | none         |
| Bold/playful (Outdoor Voices)         | bold-playful   | bordered    | light       | centered   | modern-sans     | full         |
| Health/clinical (Kettle & Fire)       | clean          | bordered    | light       | centered   | modern-sans     | md           |
| Earthy/rustic (Dr. Squatch)           | earthy         | bordered    | light       | split      | modern-sans     | md           |
| Minimal/modern (Kit and Ace)          | minimalist     | bordered    | light       | split      | modern-sans     | none         |
| Mission/cause (United By Blue)        | mission-driven | filled      | light       | centered   | editorial-serif | md           |
| Tech/precision (hardware stores)      | tech-precision | transparent | dark        | editorial  | mono-tech       | none         |

---

## Config Persistence

```
Studio edits config in Zustand (in-memory)
        │
        ├── Agent completes → use-orchestrator fires PUT /api/store-config (non-blocking)
        │
        └── User clicks "Save to Web" → PUT /api/store-config
                │
                ▼
        apps/studio/app/api/store-config/route.ts
        writes → apps/web/data/store-config.json
                │
                ▼
        apps/web/app/page.tsx  (force-dynamic)
        reads store-config.json via readStoreConfig()
        renders <StorefrontPreview config={config} />
```

The web app always reflects the last saved config. No database — the JSON file is the store.

---

## Web App (`apps/web`)

Minimal Next.js app. No studio UI — purely a config-driven storefront renderer. Every page uses `StorefrontPreview` with a page-specific `sections` array; there are no separate page templates.

```
apps/web/
├── app/
│   ├── page.tsx                   # Home — renders StorefrontPreview with config.sections
│   ├── products/page.tsx          # Products listing — sections: config.pagesSections.products
│   ├── products/[id]/page.tsx     # Product detail — sections: config.pagesSections.product-detail
│   ├── cart/page.tsx              # Cart — sections: config.pagesSections.cart
│   ├── [slug]/page.tsx            # Custom pages — sections: customPages[slug].sections
│   ├── globals.css                # Tailwind import + @source directives
│   └── api/store-config/route.ts  # GET/PUT for storefront config
├── lib/
│   ├── store-config.ts            # readStoreConfig() / writeStoreConfig() helpers
│   ├── cart-context.tsx           # CartContext — items, addToCart, updateQty, removeFromCart
│   └── use-config.ts              # useConfig() hook — fetches store-config.json client-side
└── data/
    └── store-config.json          # Source of truth for live storefront config
```

### All-pages config pattern

Every web page follows the same pattern:

```tsx
const pageConfig = {
  ...config,
  sections: config.pagesSections?.["products"] ?? DEFAULT_SECTIONS,
};
return (
  <StorefrontPreview
    config={pageConfig}
    cartItems={items}
    onAddToCart={addToCart}
  />
);
```

`StorefrontPreview` handles section types `products-listing`, `cart-content`, and `product-detail-content` by rendering the corresponding page component (`ProductsPage`, `CartPage`, `ProductDetailPage`) with `showNav={false}` so the outer navbar isn't duplicated.

Default sections (used when `pagesSections` hasn't been saved by the studio):

| Page           | Default sections                                |
| -------------- | ----------------------------------------------- |
| products       | `products-listing`, `footer`                    |
| product-detail | `product-detail-content`, `footer`              |
| cart           | `cart-content`, `footer`                        |
| custom `slug`  | whatever was saved in `customPages[i].sections` |

---

## Viewport System (Studio Only)

Center canvas scales the storefront preview to simulate device widths.

| Viewport | Simulated width |
| -------- | --------------- |
| Desktop  | 1440px          |
| Tablet   | 768px           |
| Mobile   | 375px           |

The canvas uses CSS `transform: scale()` to fit the simulated width into the available panel width.

---

## Audit Trail

Every state change and tool call is logged in JSON-RPC method convention format.

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  method: string; // e.g. "tools/call", "tools/result", "skills/load"
  params: Record<string, unknown>;
  result?: unknown;
}
```

The audit trail panel is collapsible and scrollable, pinned to the bottom of the studio layout.

---

## Key Design Decisions

1. **Shared rendering engine** — `packages/storefront-components` is the single source of truth. The studio canvas and the live web app render identical output from the same components and the same `StorefrontConfig`.

2. **Config-driven components** — All storefront components are pure functions of `StorefrontConfig`. No component manages its own persistent state.

3. **Skill-driven workflow** — The agent's workflow phases, brand archetype mappings, and decision rules live in SKILL.md files, not in the orchestrator. Adding or changing workflow behavior requires only editing a markdown file.

4. **Dynamic MCP tool registration** — The orchestrator registers MCP tools at runtime from `tools/list`. New tools are available immediately without any orchestrator code changes.

5. **SSE over WebSocket** — One-directional agent → client event stream keeps the server stateless between requests.

6. **HITL loop** — The agent never applies changes without approval. Partial approvals and free-text suggestions flow back as `PlanFeedback` with the previous proposal embedded, triggering a revision loop.

7. **File-based persistence** — `store-config.json` is intentionally simple. No database dependency for the config store.

8. **Dark studio, light storefront** — The studio shell uses a zinc-950 dark theme. The storefront preview renders in its own context driven by `ThemeConfig.colorScheme`.

9. **Mobile-first storefront, desktop-only studio** — Storefront components use responsive Tailwind classes. The studio UI assumes a wide desktop viewport.

10. **Per-component style controls in edit panel** — Background color, text color, and font size overrides for each section (hero, product grid, categories, footer) are exposed inside that section's own edit panel in the right sidebar — not in a separate "Section Styles" panel. The navbar color controls live in the Navigation panel. This keeps editing contextual: you change a section's style while looking at its other settings.

11. **All web pages are config-driven** — Every page in the web app (home, products, product-detail, cart, custom slug pages) uses `StorefrontPreview` with a page-specific `sections` array from `StorefrontConfig`. There are no standalone page templates. Section types `products-listing`, `cart-content`, and `product-detail-content` render their respective page components with `showNav={false}` to avoid double navbars.

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
├── navbar.tsx               # 3 navStyle variants + hamburger mobile menu
├── hero.tsx                 # 5 layout variants: split, centered, minimal, fullbleed, editorial
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

### Core config

```typescript
interface StorefrontConfig {
  theme: ThemeConfig;
  sections: LayoutSection[]; // ordered, enabled/disabled
  hero: HeroConfig;
  productGrid: ProductGridConfig;
  sectionData: StorefrontSectionData; // keyed by SectionType
}

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: "none" | "md" | "full";
  navStyle?: "bordered" | "transparent" | "filled";
  colorScheme?: "light" | "dark";
  fontStyle?: "modern-sans" | "editorial-serif" | "mono-tech";
}

interface HeroConfig {
  layout: "split" | "centered" | "minimal" | "fullbleed" | "editorial";
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
  badge?: string;           // eyebrow pill label above headline
  textAlign?: "left" | "center";
  overlayOpacity?: number;  // 0–1 for fullbleed/editorial overlay
  ctaVariant?: "solid" | "outline" | "ghost";
}
```

### Section data types

Key section config interfaces (all in `packages/types/src/index.ts`):

```typescript
interface AnnouncementBarConfig {
  text: string;
  backgroundColor: string;
  textColor: string;
  scrolling?: boolean;   // marquee repeat for promotional bars
  emoji?: string;        // prefix emoji for playful brands
  link?: string | null;
  dismissible?: boolean;
}

interface BenefitItem {
  icon: "truck" | "shield" | "refresh" | "award" | "clock" | "leaf"
      | "star" | "heart" | "check" | "zap" | "globe" | "tag";
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
  incentive?: string;    // e.g. "Get 10% off your first order"
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
│       ├── mcp/route.ts             # MCP server endpoint (3 tools: analyze_vision_input,
│       │                            #   generate_theme, plan_layout)
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
│   │
│   │  ── Component editor (editor pane, slides in from bottom of right sidebar)
│   ├── component-editor.tsx         # Main dispatch + custom-text / custom-image editors
│   ├── prebuilt-editor.tsx          # Hero, ProductGrid, and all SectionData editors
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

| File | Lines | Responsibility |
|---|---|---|
| `left-sidebar.tsx` | ~146 | Orchestration shell only |
| `vision-input.tsx` | ~80 | URL + image drop zone |
| `execution-trace.tsx` | ~50 | Step list UI |
| `plan-approval.tsx` | ~190 | HITL approval card |
| `applied-summary.tsx` | ~107 | Post-apply diff display |
| `right-sidebar.tsx` | ~64 | Editor shell + Save button |
| `theme-panel.tsx` | ~71 | Theme controls |
| `containers-panel.tsx` | ~64 | Container list |
| `container-node.tsx` | ~166 | Recursive tree node |
| `container-layout-config.tsx` | ~122 | Layout mode picker |
| `component-editor.tsx` | ~108 | Custom editor dispatch |
| `prebuilt-editor.tsx` | ~185 | All prebuilt section editors |
| `wysiwyg-editor.tsx` | ~60 | Rich text editor |
| `advanced-section.tsx` | ~54 | Tailwind class manager |

### State management (Zustand)

```typescript
// apps/studio/lib/store.ts
interface StudioStore {
  config: StorefrontConfig; // Live config driving the canvas preview
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
}
```

---

## Skill System

Skills are markdown files under `apps/studio/lib/skills/*/SKILL.md`. They are loaded from disk at runtime and embedded in the AI system prompt. No orchestrator code changes are needed when skills are added or updated.

### Skill Inventory

| Skill | Purpose |
|---|---|
| **planner** | Defines the three-phase workflow (Understand → Propose → Execute). Brand archetype → config inference rules. Embeds as the main workflow instruction in the system prompt. |
| **ui_extractor** | Extracts `dominantStyle`, `navStyle`, `colorScheme`, `fontStyle`, `heroLayout`, section order from a URL or image. Maps to 10 brand archetypes. |
| **theme_generator** | Maps `dominantStyle` + `targetAesthetic` to a full `ThemeConfig` including `navStyle`, `colorScheme`, `fontStyle`. 10 preset rows. |
| **layout_planner** | Selects hero variant, produces `heroBadge`, `heroTextAlign`, `heroCtaVariant`, `heroOverlayOpacity`. 15-row category × style decision matrix. |
| **section_composer** | Populates section data payloads. Defines 5 archetype composition guides (dark-luxury, organic, bold-playful, editorial, health). |
| **content_analyzer** | Analyzes copy tone and produces hero title/subtitle/badge/CTA text. Tone × copy style table covering 5 voice types. |
| **conversion_optimizer** | Conversion playbooks by brand archetype — which sections, testimonial layouts, newsletter incentives, and trust badge placements maximize purchase intent. |

### Workflow Phases (driven by `planner/SKILL.md`)

The planner skill defines three phases:

1. **Understand** — call `analyze_vision_input` (if vision source provided) → `generate_theme` → `plan_layout`
2. **Propose (HITL gate)** — call `plan_feedback` with a rich proposal. Stream stops. Client resumes after user responds.
3. **Execute** — after approved, call `apply_config_update` with all computed values in a single call.

The orchestrator embeds `planner/SKILL.md` verbatim in the system prompt. All other skills are listed by name + purpose only. The AI decides which MCP tools to call and in what order based on the planner instructions.

---

## Orchestrator (`apps/studio/lib/design-studio/orchestrator.ts`)

A stateless async generator that:

1. Loads all SKILL.md files from disk
2. Discovers MCP tools via `tools/list` JSON-RPC call
3. Builds the system prompt: planner skill (full content) + other skills (name + purpose) + MCP tool schemas + current config
4. Runs a multi-turn `generateText` loop (AI SDK v6)
5. Intercepts `plan_feedback` tool calls → emits `plan_description` SSE event → stops the stream
6. Intercepts `apply_config_update` → emits `config_update` SSE event
7. Forwards all other tool calls to the MCP endpoint dynamically

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

### Internal tools (handled by orchestrator directly, not forwarded to MCP)

| Tool | Schema key additions vs. previous |
|---|---|
| `plan_feedback` | + `navStyleProposal`, + `colorSchemeProposal` |
| `apply_config_update` | `themeChanges` now includes `navStyle`, `colorScheme`, `fontStyle`; `heroChanges` now includes `badge`, `textAlign`, `ctaVariant`, `overlayOpacity`, `ctaText`, `ctaSecondaryText`; + `enableSections`, `disableSections`, `sectionData` |

---

## MCP Server (`apps/studio/app/api/mcp/route.ts`)

JSON-RPC 2.0 server implementing 3 tools:

### `analyze_vision_input`

Extracts design signals from a URL or description. Detects 10 brand archetypes from keyword patterns and returns:

```json
{
  "primaryColors": ["#hex"],
  "fontStyle": "modern-sans | editorial-serif | mono-tech",
  "layoutType": "fullbleed | editorial | centered | split | minimal",
  "borderRadius": "none | md | full",
  "dominantStyle": "dark-luxury | organic | editorial | bold-playful | clean | earthy | maximalist | minimalist | mission-driven | tech-precision",
  "colorScheme": "light | dark",
  "navStyle": "bordered | transparent | filled",
  "targetAesthetic": "string"
}
```

### `generate_theme`

Maps `dominantStyle` + optional `targetAesthetic` / `colorScheme` / `navStyle` to a full theme preset. 10 presets keyed by `dominantStyle`:

| dominantStyle | primaryColor | secondaryColor | radius | navStyle | scheme | fontStyle |
|---|---|---|---|---|---|---|
| dark-luxury | `#0a0a0a` | `#c9a84c` | none | transparent | dark | modern-sans |
| organic | `#2d4a22` | `#7cb87a` | md | bordered | light | modern-sans |
| editorial | `#1a1a1a` | `#e8b84b` | none | bordered | light | editorial-serif |
| bold-playful | `#1a1a1a` | `#f97316` | full | bordered | light | modern-sans |
| clean | `#0f4c35` | `#22c55e` | md | bordered | light | modern-sans |
| earthy | `#3d2b1f` | `#a16207` | md | bordered | light | modern-sans |
| minimalist | `#111827` | `#6366f1` | none | bordered | light | modern-sans |
| mission-driven | `#1e3a5f` | `#0ea5e9` | md | filled | light | editorial-serif |
| tech-precision | `#0f172a` | `#3b82f6` | none | transparent | dark | mono-tech |

### `plan_layout`

Returns hero variant and all micro-parameters:

```json
{
  "heroVariant": "split | centered | minimal | fullbleed | editorial",
  "heroBadge": "string | null",
  "heroTextAlign": "left | center",
  "heroCtaVariant": "solid | outline | ghost",
  "heroOverlayOpacity": 0.0,
  "sectionOrder": ["hero", "benefits-bar", "product-grid", "..."],
  "productGridColumns": 3
}
```

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

| Layer | Technology |
|---|---|
| LLM provider | xAI Grok via `@ai-sdk/xai` |
| AI SDK | Vercel AI SDK v6 (`ai@6.0.152`) |
| Transport | Server-Sent Events (SSE) at `/api/orchestrate` |
| Tool protocol | MCP server at `/api/mcp` (JSON-RPC 2.0) |
| Skill loading | `lib/skills/*/SKILL.md` — read from disk at runtime |

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

| Archetype | dominantStyle | navStyle | colorScheme | heroLayout | fontStyle | borderRadius |
|---|---|---|---|---|---|---|
| Dark luxury (Master & Dynamic) | dark-luxury | transparent | dark | fullbleed | modern-sans | none |
| Organic/natural (Rocky Mountain Soap) | organic | bordered | light | split | modern-sans | md |
| Editorial/artisan (Holstee) | editorial | bordered | light | editorial | editorial-serif | none |
| Bold/playful (Outdoor Voices) | bold-playful | bordered | light | centered | modern-sans | full |
| Health/clinical (Kettle & Fire) | clean | bordered | light | centered | modern-sans | md |
| Earthy/rustic (Dr. Squatch) | earthy | bordered | light | split | modern-sans | md |
| Minimal/modern (Kit and Ace) | minimalist | bordered | light | minimal | modern-sans | none |
| Mission/cause (United By Blue) | mission-driven | filled | light | fullbleed | editorial-serif | md |
| Tech/precision (hardware stores) | tech-precision | transparent | dark | editorial | mono-tech | none |

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

Minimal Next.js app. No studio UI — purely a storefront renderer.

```
apps/web/
├── app/
│   ├── page.tsx                   # force-dynamic, reads store-config.json, renders StorefrontPreview
│   ├── globals.css                # Tailwind import + @source directives
│   └── api/store-config/route.ts  # GET/PUT for storefront config
├── lib/
│   └── store-config.ts            # readStoreConfig() / writeStoreConfig() helpers
└── data/
    └── store-config.json          # Source of truth for live storefront config
```

---

## Viewport System (Studio Only)

Center canvas scales the storefront preview to simulate device widths.

| Viewport | Simulated width |
|---|---|
| Desktop | 1440px |
| Tablet | 768px |
| Mobile | 375px |

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

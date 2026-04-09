# AI Storefront Design Studio — Architecture

## Overview

A monorepo containing two Next.js applications sharing a common rendering engine and type system. The **Studio** app is an AI-powered design tool where an agent proposes and applies storefront changes with human-in-the-loop approval. The **Web** app is the live storefront that always reflects the latest saved configuration.

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

Single source of truth for all storefront UI. Both apps import from `@ai-storefront/storefront-components`. Neither app has its own copy of storefront components.

```
packages/storefront-components/src/
├── storefront-preview.tsx   # Master renderer — takes StorefrontConfig, renders sorted sections
├── navbar.tsx               # Mobile hamburger + desktop nav
├── hero.tsx                 # 4 layout variants: split, centered, minimal, fullbleed
├── product-grid.tsx         # Responsive grid (1 → 2 → 3/4 cols)
├── categories.tsx           # Category grid (2 → 4 cols)
├── extra-sections.tsx       # Switch-based per-section renderer (announcement-bar, benefits-bar,
│                            #   featured-collection, testimonials, newsletter, trust-badges, brand-strip)
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
  fontFamily?: "sans" | "serif" | "mono";
}

interface HeroConfig {
  layout: "split" | "centered" | "minimal" | "fullbleed";
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
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
  approved: boolean | null;
  plannedChanges?: PlanChange[]; // Explicit per-change checklist
}

interface PlanFeedback {
  approved: boolean;
  modifications?: string; // Synthesized from rejected changes + suggestion
  userSuggestion?: string; // Raw free-text from the user
  previousPlan?: { description; layoutProposal; colorProposal };
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
│       ├── mcp/route.ts             # MCP server endpoint
│       ├── orchestrate/route.ts     # SSE orchestrator stream
│       ├── skills/route.ts          # Skill manifest loader
│       └── store-config/route.ts   # GET/PUT — reads/writes apps/web/data/store-config.json
│
├── components/studio/
│   ├── studio-layout.tsx            # Three-pane shell
│   ├── left-sidebar.tsx             # Orchestrator panel + HITL approval
│   ├── right-sidebar.tsx            # Live editor panels + Save button
│   ├── center-canvas.tsx            # Viewport scaler + StorefrontPreview
│   └── audit-trail.tsx              # Collapsible JSON-RPC log
│
├── hooks/
│   └── use-orchestrator.ts         # SSE stream handler, resumeWithFeedback
│
├── lib/
│   ├── store.ts                    # Zustand store (imports types from @ai-storefront/types)
│   └── design-studio/
│       └── orchestrator.ts         # Agent orchestration logic
│
└── lib/skills/*/SKILL.md           # AI skill definitions loaded at runtime
```

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

## HITL (Human-in-the-Loop) Flow

The agent loops until the user fully approves the plan.

```
1. User submits goal (URL or free text + optional image)
        │
        ▼
2. Agent streams SSE events → plan_description event carries AgentPlan
        │
        ▼
3. InlinePlanApproval renders in left sidebar
   ┌──────────────────────────────────────────┐
   │ [description text]                       │
   │                                          │
   │ ☑ Color & Theme — "<colorProposal>"      │
   │ ☑ Layout & Structure — "<layoutProposal>"│
   │   (or explicit PlanChange[] items)       │
   │                                          │
   │ Add your own idea: [textarea]            │
   │                                          │
   │ [Approve All]  [Cancel]                  │
   └──────────────────────────────────────────┘
        │
        ├─ All checked, no suggestion → approved: true → agent applies changes → DONE
        │
        └─ Any unchecked OR has suggestion → approved: false
              modifications = "Approved: X. Rejected: Y. Also: <suggestion>"
              → resumeWithFeedback() → re-runs orchestrator with PlanFeedback
              → loop repeats from step 2
```

### Feedback composition

`resumeWithFeedback` embeds the previous plan in `PlanFeedback.previousPlan` so the AI has full revision context on re-runs.

---

## AI Stack

| Layer         | Technology                                               |
| ------------- | -------------------------------------------------------- |
| LLM provider  | xAI Grok via `@ai-sdk/xai`                               |
| AI SDK        | Vercel AI SDK v6 (`ai@6.0.152`)                          |
| Transport     | Server-Sent Events (SSE) at `/api/orchestrate`           |
| Tool protocol | MCP server at `/api/mcp`                                 |
| Skill loading | `lib/skills/*/SKILL.md` — markdown files read at runtime |

### SSE event types

```typescript
type OrchestratorEvent =
  | { type: "progress"; agentStep: AgentStep }
  | { type: "audit"; entry: AuditLogEntry }
  | { type: "plan_description"; plan: Omit<AgentPlan, "approved"> }
  | { type: "config_update"; configUpdate: OrchestratorConfigUpdate }
  | { type: "complete" }
  | { type: "error"; error: string };
```

---

## Config Persistence

```
Studio edits config in Zustand (in-memory)
        │
        ├── Agent completes → use-orchestrator fires PUT /api/store-config (non-blocking)
        │
        └── User clicks "Save to Web" in right sidebar → PUT /api/store-config
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
│   ├── page.tsx                  # force-dynamic, reads store-config.json, renders StorefrontPreview
│   ├── globals.css               # Tailwind import + @source directives
│   └── api/store-config/route.ts # GET/PUT for storefront config (used by external consumers)
├── lib/
│   └── store-config.ts           # readStoreConfig() / writeStoreConfig() helpers
└── data/
    └── store-config.json         # Source of truth for live storefront config
```

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

Every state change is logged. Format follows JSON-RPC method conventions.

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  method: string; // e.g. "agent/approvePlan", "config/updateTheme"
  params: Record<string, unknown>;
  result?: unknown;
}
```

The audit trail panel is collapsible and scrollable, pinned to the bottom of the studio layout.

---

## Key Design Decisions

1. **Shared rendering engine** — `packages/storefront-components` is the single source of truth. The studio canvas and the live web app render identical output from the same components and the same `StorefrontConfig`.

2. **Config-driven components** — All storefront components are pure functions of `StorefrontConfig`. No component manages its own persistent state.

3. **SSE over WebSocket** — One-directional agent → client event stream keeps the server stateless between requests.

4. **HITL loop** — The agent never applies changes without approval. Partial approvals and free-text suggestions flow back as `PlanFeedback` and trigger a new orchestrator run with full revision context.

5. **File-based persistence** — `store-config.json` is intentionally simple. No database dependency for the config store.

6. **Mobile-first storefront, desktop-only studio** — Storefront components use responsive Tailwind classes. The studio UI assumes a wide desktop viewport and is not designed for mobile use.

7. **Dark studio, light storefront** — The studio shell uses a zinc-950 dark theme. The storefront preview renders in its own light context driven by `StorefrontConfig.theme`.

## Overview

A state-of-the-art AI-powered storefront design studio with real-time preview and agentic workflows. The application follows a three-pane layout pattern optimized for design tool workflows.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Studio Layout Shell                                │
├──────────────────┬────────────────────────────────┬─────────────────────────┤
│   Left Sidebar   │        Center Canvas           │     Right Sidebar       │
│   (320px fixed)  │       (flex-1 fluid)           │     (380px fixed)       │
├──────────────────┼────────────────────────────────┼─────────────────────────┤
│                  │                                │                         │
│  - Vision Input  │  ┌────────────────────────┐   │  - Theme Panel          │
│  - Skill Loader  │  │   Viewport Toolbar     │   │  - Layout Panel         │
│  - AI Trigger    │  ├────────────────────────┤   │  - Content Panel        │
│  - Agent Status  │  │                        │   │  - Component Editing    │
│                  │  │   Storefront Preview   │   │                         │
│                  │  │   (iframe-style)       │   │                         │
│                  │  │                        │   │                         │
│                  │  └────────────────────────┘   │                         │
│                  │                                │                         │
├──────────────────┴────────────────────────────────┴─────────────────────────┤
│                         Audit Trail (Collapsible)                           │
│                    JSON-RPC style message stream                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
├── app/
│   ├── globals.css          # Dark theme tokens (zinc-950 base)
│   ├── layout.tsx           # Root layout with dark mode
│   └── page.tsx             # Entry point
│
├── components/
│   ├── studio/
│   │   ├── studio-layout.tsx    # Three-pane shell
│   │   ├── left-sidebar.tsx     # Orchestrator panel
│   │   ├── right-sidebar.tsx    # CMS/editing panel
│   │   ├── center-canvas.tsx    # Preview container
│   │   ├── plan-approval.tsx    # HITL approval card
│   │   └── audit-trail.tsx      # Action log stream
│   │
│   └── storefront/
│       ├── storefront-preview.tsx  # Main preview wrapper
│       ├── navbar.tsx              # Store navigation
│       ├── hero.tsx                # Hero section (3 variants)
│       ├── product-grid.tsx        # Product cards with skeletons
│       ├── categories.tsx          # Category showcase
│       └── footer.tsx              # Store footer
│
└── lib/
    ├── types.ts             # TypeScript interfaces
    ├── store.ts             # Zustand state management
    ├── mock-db.ts           # Mock product/category data
    └── utils.ts             # Utility functions
```

---

## State Management

### Zustand Store (`lib/store.ts`)

Single global store managing all application state:

```typescript
interface StudioStore {
  // Theme Configuration
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;

  // Layout Management
  layout: LayoutConfig;
  setLayout: (layout: Partial<LayoutConfig>) => void;
  reorderSections: (from: number, to: number) => void;

  // Content Management
  content: ContentConfig;
  setContent: (content: Partial<ContentConfig>) => void;

  // Viewport Control
  viewport: "desktop" | "tablet" | "mobile";
  setViewport: (viewport: string) => void;

  // Agentic State
  agentState: AgentState;
  setAgentState: (state: Partial<AgentState>) => void;
  startAgentLoop: () => void;
  approveStep: () => void;
  rejectStep: () => void;

  // Selection State
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;

  // Audit Trail
  auditLog: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
}
```

### State Flow

```
User Action → Store Update → Component Re-render → Audit Log Entry
     ↓
Agent Trigger → Planning Phase → HITL Approval → Execution → Preview Update
```

---

## Component Architecture

### Storefront Components

All storefront components are **configuration-driven** and receive their data from the Zustand store:

| Component     | Props Source                         | Variants                 |
| ------------- | ------------------------------------ | ------------------------ |
| `Navbar`      | `content.storeName`, `theme`         | Standard                 |
| `Hero`        | `content.hero`, `layout.heroVariant` | centered, split, minimal |
| `ProductGrid` | `mock-db.products`, `theme`          | With skeleton loading    |
| `Categories`  | `mock-db.categories`                 | Grid layout              |
| `Footer`      | `content.storeName`                  | Standard                 |

### Section Reordering

The layout supports drag-and-drop style reordering via the `sectionOrder` array:

```typescript
sectionOrder: ["hero", "products", "categories", "footer"];
```

Components render in the order specified, enabling non-destructive layout changes.

---

## Agentic Workflow

### Agent States

```typescript
type AgentStatus =
  | "idle"
  | "planning"
  | "awaiting_approval"
  | "executing"
  | "complete";
```

### Workflow Sequence

```
1. IDLE
   └── User clicks "Simulate AI Design"

2. PLANNING
   └── Agent analyzes current state
   └── Generates proposed changes
   └── Audit: "Agent planning design changes..."

3. AWAITING_APPROVAL (HITL)
   └── Plan card overlay appears
   └── Shows proposed changes with diff preview
   └── User can Approve or Reject

4. EXECUTING
   └── Sequential step execution
   └── Each step updates store
   └── Real-time preview updates
   └── Audit: Step-by-step logging

5. COMPLETE
   └── All changes applied
   └── Agent returns to idle
```

### Plan Approval Card

The HITL interface shows:

- Current step number and total
- Action type (theme, layout, content)
- Before/after comparison
- Approve (green) / Reject (red) buttons

---

## Theming System

### Design Tokens

```css
/* Dark Studio Theme (zinc-950 base) */
--background: oklch(0.09 0 0); /* Near black */
--card: oklch(0.12 0 0); /* Elevated surfaces */
--border: oklch(0.22 0 0); /* Crisp borders */
--muted-foreground: oklch(0.6 0 0); /* Secondary text */
```

### Runtime Theme Config

```typescript
interface ThemeConfig {
  primaryColor: string; // Brand color
  backgroundColor: string; // Store background
  textColor: string; // Body text
  accentColor: string; // Highlights
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
}
```

Theme changes propagate via CSS custom properties and Tailwind classes.

---

## Viewport System

Three viewport sizes with animated transitions:

| Viewport | Width | Use Case           |
| -------- | ----- | ------------------ |
| Desktop  | 100%  | Full-width preview |
| Tablet   | 768px | Tablet simulation  |
| Mobile   | 375px | Phone simulation   |

Transitions powered by Framer Motion for smooth resizing.

---

## Audit Trail

### Entry Structure

```typescript
interface AuditEntry {
  id: string;
  timestamp: Date;
  type: "info" | "action" | "agent" | "error";
  message: string;
  details?: Record<string, unknown>;
}
```

### Display Format

JSON-RPC style with color-coded entries:

- `info` (blue): System information
- `action` (green): User actions
- `agent` (amber): AI agent actions
- `error` (red): Error states

---

## Key Design Decisions

1. **Single Store Pattern**: All state in one Zustand store for predictable updates and easy debugging.

2. **Configuration-Driven Components**: Storefront components read from store, enabling non-destructive editing.

3. **HITL by Default**: Agent changes require explicit approval before execution.

4. **Audit Everything**: Every state change logs to the audit trail for transparency.

5. **Dark Studio UI**: Professional dark theme (zinc-950) with high contrast for extended use.

6. **Responsive Preview**: Live viewport switching without page reload.

---

## Future Enhancements

- [ ] Drag-and-drop section reordering
- [ ] Undo/redo stack
- [ ] Export to code
- [ ] Real AI integration (replace mock agent)
- [ ] Collaborative editing
- [ ] Version history
- [ ] Custom component injection

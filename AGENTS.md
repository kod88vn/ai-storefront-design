# Coding Agent Instructions — AI Storefront Design Studio

## Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## UI Library Rules

All interactive UI must use **plain HTML elements + Tailwind CSS**. No third-party component library primitives.

| Pattern                 | Implementation                           |
| ----------------------- | ---------------------------------------- |
| Scrollable area         | `<div className="overflow-y-auto">`      |
| Select / dropdown       | `<select>` native element                |
| Collapsible / accordion | `useState` + conditional render          |
| Tooltip                 | CSS `title` attr or custom hover `<div>` |
| Modal / sheet           | `<div>` with fixed position overlay      |
| Divider                 | `<hr>` or `border-t` class               |

**Allowed:**

- Plain HTML elements
- Tailwind CSS classes
- Framer Motion (`motion.*`, `AnimatePresence`)
- Lucide icons
- `@/components/ui/button.tsx` (thin Tailwind wrapper)
- `@/components/ui/input.tsx` (thin Tailwind wrapper)
- `@/components/ui/label.tsx` (thin Tailwind wrapper)

## Component Size Rule

Keep every component **under ~80 lines**. Break larger components into focused named sub-components in the same file or a separate file. Each sub-component should do one thing.

## data-testid Rule

Every meaningful UI element **must** have a `data-testid` attribute using descriptive kebab-case names.

```tsx
// Good
<div data-testid="audit-trail">
<button data-testid="simulate-button">
<input data-testid="vision-url-input">
<div data-testid="execution-trace">
<div data-testid="plan-approval-card">
<div data-testid="audit-trail-entry">
<div data-testid="theme-panel">
<div data-testid="layout-panel">
<div data-testid="content-panel">
```

## Scrollable Container Pattern

```tsx
// Parent must have a fixed height for overflow to work
<div className="flex h-full flex-col">
  <div
    data-testid="sidebar-header"
    className="shrink-0 border-b border-border p-4"
  >
    {/* fixed height header */}
  </div>
  <div data-testid="sidebar-content" className="min-h-0 flex-1 overflow-y-auto">
    {/* scrollable content */}
  </div>
  <div
    data-testid="sidebar-footer"
    className="shrink-0 border-t border-border p-4"
  >
    {/* fixed height footer */}
  </div>
</div>
```

## Collapsible Panel Pattern

```tsx
function Panel({ title, icon: Icon, testId, children }: PanelProps) {
  const [open, setOpen] = useState(true);
  return (
    <div data-testid={testId}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50"
        data-testid={`${testId}-toggle`}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div data-testid={`${testId}-body`} className="px-3 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
```

## Select Pattern

```tsx
<select
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  data-testid="my-select"
>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

## Project Stack

- **Package manager**: Yarn 1 (Classic) — always use `yarn`, never `npm` or `pnpm`
- **Monorepo**: Turborepo with Yarn workspaces (`apps/*`, `packages/*`)
- **Framework**: Next.js 16 App Router, TypeScript
- **Styling**: Tailwind CSS (no inline styles unless dynamic values like colors)
- **State**: Zustand (`@/lib/store.ts`)
- **AI**: Vercel AI SDK v6 (`ai@6.0.152`), xAI Grok (`@ai-sdk/xai`)
- **Architecture**: MCP server at `/api/mcp`, orchestrator at `lib/design-studio/orchestrator.ts`, SSE at `/api/orchestrate`

## Package Manager Rules

- Use `yarn` for all installs: `yarn add <pkg>`, `yarn add -D <pkg>`
- Use `yarn workspace <name> add <pkg>` to install into a specific workspace
- Use `yarn workspaces run build` or `turbo build` to build all packages
- Never commit `pnpm-lock.yaml` or `package-lock.json`
- Lock file is `yarn.lock` at the repo root

## Workspace Layout

```
apps/studio/            Next.js Studio app (AI orchestrator UI)
apps/web/               Next.js Web app (standalone storefront)
packages/types/         Shared TypeScript types (@ai-storefront/types)
packages/ui/            Base UI primitives (@ai-storefront/ui)
packages/storefront-components/  Storefront section components
```

## File Locations

```
app/                    Next.js pages and API routes
components/studio/      Studio UI (sidebar, canvas, audit trail, plan approval)
components/storefront/  Storefront preview components
components/ui/          Base UI primitives (button, input, label only)
lib/                    Store, types, utilities, orchestrator
lib/skills/*/SKILL.md   AI skill definitions (loaded at runtime)
hooks/                  Client hooks (use-orchestrator, use-toast)
```

## Single Source of Truth — `packages/types/src/schema.ts`

**All option arrays (hero layouts, dominant styles, nav styles, font styles, etc.) live exclusively in `schema.ts`.** Do not redeclare them anywhere else.

```ts
// packages/types/src/schema.ts
export const HERO_LAYOUTS = ["split", "centered", "editorial"] as const;
export const DOMINANT_STYLES = ["minimalist", "maximalist", ...] as const;
export const NAV_STYLES = ["bordered", "transparent", "filled"] as const;
export const FONT_STYLES = ["modern-sans", "geometric-sans", ...] as const;
// ... BORDER_RADII, COLOR_SCHEMES, HERO_CTA_VARIANTS, FONT_SIZES, etc.
```

When you add or remove a hero layout (or any other option):

1. **Edit only `schema.ts`** — the array + `SKILL_TEMPLATE_VARS` entry
2. Everything else updates automatically:
   - TypeScript unions: `type HeroLayout = typeof HERO_LAYOUTS[number]`
   - MCP route enums: `import { HERO_LAYOUTS } from "@ai-storefront/types"`
   - Studio dropdowns: `import { HERO_LAYOUTS } from "@ai-storefront/types"`
   - SKILL.md prompts: `{{HERO_LAYOUTS}}` interpolated at load time by the orchestrator

**Never** hardcode `"split" | "centered" | "editorial"` inline in interfaces, MCP enums, or UI arrays. Always import from `@ai-storefront/types`.

## Storefront Component Rules

Hero has **3 layouts** (`split`, `centered`, `editorial`).

Each storefront section supports **per-section style overrides** (`ComponentStyle`) that take precedence over the global theme:

```ts
interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: "sm" | "base" | "lg" | "xl"; // FontSize
}
```

These overrides are stored in `config.hero`, `config.nav`, `config.productGrid`, `config.categories`, and `config.footer`. When rendering, always check the override before falling back to the theme value.

## AI Skill Rules

SKILL.md files under `lib/skills/*/SKILL.md` use `{{VAR}}` template placeholders that are replaced at load time:

```markdown
"heroVariant": "{{HERO_LAYOUTS}}"
→ rendered as →
"heroVariant": "split | centered | editorial"
```

Available variables: `{{HERO_LAYOUTS}}`, `{{DOMINANT_STYLES}}`, `{{NAV_STYLES}}`, `{{COLOR_SCHEMES}}`, `{{FONT_STYLES}}`, `{{BORDER_RADII}}`, `{{HERO_CTA_VARIANTS}}`, `{{FONT_SIZES}}`, `{{GRID_COLUMNS}}`, `{{SOURCE_LAYOUT_TYPES}}`.

When editing schema option values, update the corresponding SKILL.md placeholders to use `{{VAR}}` if they don't already — never hardcode the list directly in the markdown.

## Hero Layout Keying Rule

When rendering `StorefrontHero` in the studio canvas or preview, always key it on `config.hero.layout`:

```tsx
<StorefrontHero
  key={config.hero.layout}
  config={config.hero}
  theme={config.theme}
/>
```

This forces a full DOM remount on layout change, preventing stale `data-original-class` caches from the viewport-stripping `useEffect` in `center-canvas.tsx` from corrupting the new layout's classes.

## Agent Lessons

### Architecture Principles (owner-confirmed)

- The two-model vision pipeline exists for two reasons: (1) **provider decoupling** — the orchestrator LLM doesn't need vision capability, so swapping the primary model remains a one-env-var change even if the new model has no image support; (2) **quality** — a dedicated vision call focused solely on pixel analysis (hex colors, layout type, design tokens) produces better results than asking the orchestrator to simultaneously analyze an image and plan a multi-step workflow. The extracted tokens inject as pre-computed structured JSON; the orchestrator never sees the raw image.
- The **Orchestrator is stateless by design**; full context (including the previous plan) re-travels with every HITL feedback request. This is intentional — not a limitation — enabling horizontal scaling and full resumability after rejection loops.
- **Skills ≠ MCP tools.** The relationship is many-to-many. A skill (SKILL.md) is domain knowledge that wraps one or more MCP tools with opinionated rules and prompting. One MCP tool can be guided by multiple skills; one skill can reference multiple tools. Do not conflate the two layers.

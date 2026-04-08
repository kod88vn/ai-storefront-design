# Coding Agent Instructions — AI Storefront Design Studio

## UI Library Rules

**No Radix UI primitives.** Replace every Radix component with plain HTML + Tailwind CSS.

| Radix component | Replace with |
|---|---|
| `ScrollArea` | `<div className="overflow-y-auto">` |
| `Select / SelectTrigger / SelectContent` | `<select>` native element |
| `Collapsible / CollapsibleContent` | `useState` + conditional render |
| `Tooltip*` | CSS `title` attr or custom hover `<div>` |
| `Dialog / Sheet` | `<div>` with fixed position overlay |
| `Separator` | `<hr>` or `border-t` class |

**Allowed:**
- Plain HTML elements
- Tailwind CSS classes
- Framer Motion (`motion.*`, `AnimatePresence`)
- Lucide icons
- `@/components/ui/button.tsx` (thin wrapper, no Radix)
- `@/components/ui/input.tsx` (thin wrapper, no Radix)
- `@/components/ui/label.tsx` (thin wrapper, no Radix)

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
  <div data-testid="sidebar-header" className="shrink-0 border-b border-border p-4">
    {/* fixed height header */}
  </div>
  <div data-testid="sidebar-content" className="min-h-0 flex-1 overflow-y-auto">
    {/* scrollable content */}
  </div>
  <div data-testid="sidebar-footer" className="shrink-0 border-t border-border p-4">
    {/* fixed height footer */}
  </div>
</div>
```

## Collapsible Panel Pattern (no Radix)

```tsx
function Panel({ title, icon: Icon, testId, children }: PanelProps) {
  const [open, setOpen] = useState(true)
  return (
    <div data-testid={testId}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50"
        data-testid={`${testId}-toggle`}
      >
        <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div data-testid={`${testId}-body`} className="px-3 pb-4">{children}</div>}
    </div>
  )
}
```

## Select Pattern (no Radix)

```tsx
<select
  value={value}
  onChange={e => onChange(e.target.value)}
  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  data-testid="my-select"
>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

## Project Stack

- **Framework**: Next.js 16 App Router, TypeScript
- **Styling**: Tailwind CSS (no inline styles unless dynamic values like colors)
- **State**: Zustand (`@/lib/store.ts`)
- **AI**: Vercel AI SDK v6 (`ai@6.0.152`), xAI Grok (`@ai-sdk/xai`)
- **Architecture**: MCP server at `/api/mcp`, orchestrator at `lib/design-studio/orchestrator.ts`, SSE at `/api/orchestrate`

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

# AI Storefront Design Studio - Architecture

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
  viewport: 'desktop' | 'tablet' | 'mobile';
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
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
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

| Component | Props Source | Variants |
|-----------|--------------|----------|
| `Navbar` | `content.storeName`, `theme` | Standard |
| `Hero` | `content.hero`, `layout.heroVariant` | centered, split, minimal |
| `ProductGrid` | `mock-db.products`, `theme` | With skeleton loading |
| `Categories` | `mock-db.categories` | Grid layout |
| `Footer` | `content.storeName` | Standard |

### Section Reordering

The layout supports drag-and-drop style reordering via the `sectionOrder` array:

```typescript
sectionOrder: ['hero', 'products', 'categories', 'footer']
```

Components render in the order specified, enabling non-destructive layout changes.

---

## Agentic Workflow

### Agent States

```typescript
type AgentStatus = 'idle' | 'planning' | 'awaiting_approval' | 'executing' | 'complete';
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
--background: oklch(0.09 0 0);      /* Near black */
--card: oklch(0.12 0 0);            /* Elevated surfaces */
--border: oklch(0.22 0 0);          /* Crisp borders */
--muted-foreground: oklch(0.6 0 0); /* Secondary text */
```

### Runtime Theme Config

```typescript
interface ThemeConfig {
  primaryColor: string;    // Brand color
  backgroundColor: string; // Store background
  textColor: string;       // Body text
  accentColor: string;     // Highlights
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}
```

Theme changes propagate via CSS custom properties and Tailwind classes.

---

## Viewport System

Three viewport sizes with animated transitions:

| Viewport | Width | Use Case |
|----------|-------|----------|
| Desktop | 100% | Full-width preview |
| Tablet | 768px | Tablet simulation |
| Mobile | 375px | Phone simulation |

Transitions powered by Framer Motion for smooth resizing.

---

## Audit Trail

### Entry Structure

```typescript
interface AuditEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'action' | 'agent' | 'error';
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

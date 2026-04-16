# AI Storefront Design Studio

An AI-powered storefront design studio with real-time preview and agentic workflows. Built as a Turborepo monorepo with Yarn workspaces.

---

## Workspace layout

```
apps/
  studio/                    Next.js app — AI orchestrator UI (port 3001)
  web/                       Next.js app — standalone storefront renderer (port 3000)
packages/
  types/                     Shared TypeScript types  (@ai-storefront/types)
  ui/                        UI primitives (@ai-storefront/ui)
  storefront-components/     Storefront section components (@ai-storefront/storefront-components)
```

---

## Prerequisites

- Node.js 18+
- Yarn 1 (Classic) — this repo uses Yarn workspaces, **do not use npm or pnpm**

---

## Environment variables

Create `apps/studio/.env.local` with either a direct xAI key or a Vercel AI Gateway key.

```bash
# Option A: direct xAI access
XAI_API_KEY=your_xai_key_here
AI_MODEL=grok-4-1-fast-reasoning

# Option B: Vercel AI Gateway for testing different providers/models
AI_GATEWAY_API_KEY=your_gateway_key_here
AI_MODEL=openai/gpt-4.1-mini
# Example alternatives:
# AI_MODEL=anthropic/claude-sonnet-4-5
# AI_MODEL=xai/grok-4.1-mini

# Optional vision override (defaults to AI_MODEL)
# VISION_MODEL=openai/gpt-4.1-mini
```

---

## Getting started

Install all dependencies from the repo root:

```bash
yarn install
```

### Run both apps together (recommended)

```bash
yarn dev
```

This runs `turbo dev`, starting both apps in parallel with Turbopack:

| App    | URL                   |
| ------ | --------------------- |
| Web    | http://localhost:3000 |
| Studio | http://localhost:3001 |

### Run a single app

```bash
# Studio only
yarn studio

# Web storefront only
yarn web
```

### Build

```bash
yarn build
```

---

## App: Studio (`apps/studio`)

The AI orchestrator UI. Three-pane layout: left sidebar (vision input + agent status), center canvas (live storefront preview), right sidebar (theme/layout/content panels).

**Key routes:**

| Route              | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `/`                | Studio shell                                      |
| `/api/mcp`         | MCP tool server (analyze, compose, update config) |
| `/api/orchestrate` | SSE stream — AI orchestrator events               |
| `/api/skills`      | Skill manifest loader                             |

**AI skills** live in `apps/studio/lib/skills/*/SKILL.md`. Each file is loaded at runtime and passed to the orchestrator.

**State** is managed with Zustand in `apps/studio/lib/store.ts`.

---

## App: Web (`apps/web`)

Standalone storefront renderer. Reads a persisted JSON config and renders the live storefront sections.

**Key routes:**

| Route               | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `/`                 | Live storefront (reads config)                   |
| `/api/store-config` | `GET` / `PUT` persisted store config             |
| `/api/mcp`          | MCP tool server — get/update config and metadata |

**Config persistence:** `apps/web/data/store-config.json` is the source of truth for the rendered storefront. The studio calls `apps/web/api/mcp` to update it.

---

## Packages

### `@ai-storefront/types` — `packages/types`

Shared TypeScript interfaces for store config, sections, theme, and orchestrator events.

### `@ai-storefront/ui` — `packages/ui`

UI primitives: `Button`, `Input`, `Label`, `Textarea`.

### `@ai-storefront/storefront-components` — `packages/storefront-components`

Reusable storefront section components: `Navbar`, `Hero`, `ProductGrid`, `Categories`, `Footer`, `ExtraSections`, `StorefrontPreview`. Used by both `apps/web` and the preview inside `apps/studio`.

---

## Tech stack

| Concern     | Choice                      |
| ----------- | --------------------------- |
| Monorepo    | Turborepo + Yarn workspaces |
| Framework   | Next.js 16 App Router       |
| Language    | TypeScript 5.7              |
| Styling     | Tailwind CSS v4             |
| Animation   | Framer Motion               |
| Icons       | Lucide React                |
| State       | Zustand                     |
| AI SDK      | Vercel AI SDK v6 + xAI Grok |
| Build speed | Turbopack (dev)             |

---

## Project conventions

- **Components ≤ 80 lines** — split into named sub-components if larger
- **`data-testid`** on every meaningful UI element (kebab-case)
- **Yarn only** — never `npm install` or `pnpm`; use `yarn workspace <name> add <pkg>` to add to a specific app

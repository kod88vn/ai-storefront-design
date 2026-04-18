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

### Deploy to Vercel

This repository is a monorepo with **two separate Next.js apps**, so each app should be imported into Vercel as its **own Project**:

- **Studio project** → Root Directory: `apps/studio`
- **Web storefront project** → Root Directory: `apps/web`

To avoid the "routes-manifest.json couldn't be found" error:

1. Set the Vercel **Root Directory** to the app you want to deploy
2. Leave **Output Directory** empty unless you explicitly changed Next.js `distDir`
3. Keep the app build command on the default `next build` (or the package `build` script)

Do **not** deploy the repository root as a single Next.js app, because the build outputs live inside each app folder rather than at the repo root.

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

---

## AI workspace customizations

This repository now includes a shared, editor-agnostic AI setup:

- **`.vscode/mcp.json`** configures workspace MCP servers for:
  - `nextjs-studio` → local studio MCP endpoint
  - `nextjs-web` → local storefront MCP endpoint
  - `context7` → version-aware docs lookup
  - `playwright` → browser automation and verification
- **`.github/copilot-instructions.md`** provides repository-wide guidance for GitHub Copilot.
- **`.github/instructions/*.instructions.md`** adds focused rules for Next.js and MCP-related files.
- **`.github/skills/*`** adds reusable agent skills for docs lookup, Next.js work, and UI verification.
- **`.github/copilot/agents/*`** adds specialist Copilot agents for both E2E flows and general productivity work, including planner, executor, reviewer, generator, and healer roles.
- **`.github/prompts/*`** adds reusable slash prompts for common verification flows.

### How to use it

1. Open the repo in VS Code.
2. Run `yarn dev` from the repo root if you want to use the local MCP endpoints.
3. Trust and start the configured MCP servers from the MCP or Chat UI.
4. Use the shared skills, Copilot agents, and prompts directly in chat.
5. For browser test authoring, use the planner → generator → healer flow.
6. For general coding tasks, use the planner → executor → reviewer flow.

The old assistant-specific `.claude` folder is intentionally no longer used so the setup stays shareable across tools.

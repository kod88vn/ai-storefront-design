# GitHub Copilot Instructions

This repository is a Yarn 1 Turborepo for an AI storefront design studio.

## Working rules

- Always use Yarn from the repository root. Do not use npm or pnpm.
- Main apps:
  - `apps/studio` — Next.js 16 App Router studio UI on port 3001
  - `apps/web` — Next.js 16 storefront renderer on port 3000
- Shared packages live in `packages/types`, `packages/ui`, and `packages/storefront-components`.
- Use the smallest possible change that solves the task.

## UI conventions

- Use plain HTML elements plus Tailwind CSS.
- Do not introduce third-party component primitives for selects, dialogs, tooltips, accordions, or scroll areas.
- Keep components focused and small when practical.
- Add `data-testid` attributes to meaningful UI elements.

## Type and schema rules

- The single source of truth for option arrays and enum-style values is `packages/types/src/schema.ts`.
- Do not redeclare hero layouts, nav styles, dominant styles, or font styles inline.

## Validation

- Install dependencies with `yarn install`.
- Run both apps with `yarn dev`.
- Build with `yarn build`.
- Lint with `yarn lint`.
- Test with `yarn test`.

## Bug-fix verification strategy

- Prefer the cheapest reliable proof first.
- For bugs and regressions, create the smallest failing unit or integration repro before fixing when practical.
- Make the repro assert real user-visible behavior, not internal implementation details alone.
- After the fix, rerun that same test and only use live browser verification for high-risk or clearly visual flows.
- Avoid repeated guess-and-check loops when a targeted regression test can lock the issue down faster.

## Preferred AI workflow

When MCP servers are available:
1. Use `nextjs-studio` or `nextjs-web` for project-aware MCP calls.
2. Use `context7` for version-aware framework docs.
3. Use `playwright` for browser verification and UI regressions.

When editing the studio AI flow:
- Skills are loaded from `apps/studio/lib/skills/*/SKILL.md`.
- Skills are domain guidance and are not the same thing as MCP tools.
- Keep the orchestrator stateless.

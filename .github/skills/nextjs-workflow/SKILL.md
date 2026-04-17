---
name: nextjs-workflow
description: Use this skill for implementing or debugging Next.js App Router work in this monorepo, especially when the task spans the studio app, web app, shared packages, and MCP routes.
---

# Next.js Workflow

This repository has two Next.js 16 apps plus shared workspace packages.

## Project map

- `apps/studio` is the AI design studio app.
- `apps/web` is the live storefront.
- `packages/storefront-components` contains shared storefront rendering.
- `packages/types` contains the shared schema and config types.

## Workflow

1. Identify whether the change belongs in `apps/studio`, `apps/web`, or a shared package.
2. Prefer existing App Router patterns already used nearby.
3. Keep shared logic in packages when both apps depend on it.
4. Use the local MCP servers in `.vscode/mcp.json` when project-aware tools are helpful.
5. Use Context7 for framework specifics and Playwright for final browser verification.

## Guardrails

- Default to server components unless client behavior is required.
- Do not hardcode duplicated config enums.
- Match the existing file and naming conventions.
- Validate the affected app before claiming the work is done.

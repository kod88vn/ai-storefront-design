---
applyTo: "apps/**/*.ts,apps/**/*.tsx,packages/**/*.ts,packages/**/*.tsx"
---

Follow the repository conventions in AGENTS.md and the root Copilot instructions.

For this monorepo:
- Use Next.js App Router patterns.
- Prefer server components by default; add `"use client"` only when local state, effects, or browser-only APIs are required.
- Keep shared rendering in `packages/storefront-components` and shared types in `packages/types`.
- Use plain HTML plus Tailwind CSS for interactive UI.
- Every meaningful UI surface should keep or add a descriptive `data-testid`.
- Import shared option arrays from `packages/types/src/schema.ts` instead of hardcoding unions or arrays.

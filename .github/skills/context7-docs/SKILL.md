---
name: context7-docs
description: Use this skill when you need accurate, version-aware docs for Next.js, React, Tailwind, TypeScript, Vercel AI SDK, or Playwright before editing code.
---

# Context7 Docs

Use this skill whenever a task depends on framework behavior, library APIs, routing patterns, or configuration details.

## Workflow

1. Query Context7 before changing code when the API or behavior is uncertain.
2. Prefer docs that match this repo stack: Next.js 16 App Router, React 19, Tailwind v4, TypeScript 5, Vercel AI SDK v6, and Playwright.
3. Extract only the rules that matter to the current task.
4. Apply the smallest repo-consistent change.
5. Verify the result with the lightest relevant command.

## Repo reminders

- Use Yarn only.
- Shared option arrays live in `packages/types/src/schema.ts`.
- UI work must stay on plain HTML + Tailwind.

## When not to use this skill

- Do not spend time on docs lookup when the codebase already shows a working local pattern.
- Do not guess APIs when Context7 can confirm them quickly.

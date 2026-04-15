# Code Review — File Size & Maintainability

**Date:** April 14, 2026  
**Scope:** Current studio codebase, with emphasis on file size, cohesion, and long-term maintainability.

---

## Summary Verdict

Yes — the codebase is starting to accumulate **real file-size risk**.

The issue is not just that some files are long. The bigger problem is that several of the largest files combine **multiple responsibilities**: UI rendering, orchestration logic, validation, state mutation, persistence, and domain heuristics. That will slow future changes and make regressions more likely.

---

## Verified Hotspots

| File                                                                                                   | Lines | Review                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [apps/studio/lib/store.ts](apps/studio/lib/store.ts)                                                   |  1126 | Biggest risk. One Zustand store is handling config, pages, cart, audit log, HITL state, undo/redo, and designer containers.                    |
| [apps/studio/lib/design-studio/orchestrator.ts](apps/studio/lib/design-studio/orchestrator.ts)         |   809 | Too many concerns in one controller: skill loading, MCP discovery, vision pre-processing, prompt building, tool interception, and stream loop. |
| [apps/studio/app/api/mcp/route.ts](apps/studio/app/api/mcp/route.ts)                                   |   703 | Tool registry, JSON schemas, presets, heuristics, and execution all live in one route file.                                                    |
| [apps/studio/hooks/use-orchestrator.ts](apps/studio/hooks/use-orchestrator.ts)                         |   464 | Labeled as a “thin client hook”, but it now contains substantial business logic and state syncing.                                             |
| [apps/studio/components/studio/prebuilt-editor.tsx](apps/studio/components/studio/prebuilt-editor.tsx) |   382 | Multiple editors plus a large section dispatcher in one file. Hard to extend safely.                                                           |

> Not every large file is bad. Type-heavy files can be larger. The real problem here is **behavior-heavy** files growing too large.

---

## Key Findings

### 1. Store is too monolithic

[apps/studio/lib/store.ts](apps/studio/lib/store.ts) is doing the work of several modules:

- storefront config updates
- nav and page editing
- cart preview state
- HITL plan state
- audit logging
- undo/redo persistence
- designer container tree mutations
- orchestration resume context

This is the clearest refactor target.

**Recommendation:** split into Zustand slices:

- `config-slice.ts`
- `designer-slice.ts`
- `agent-slice.ts`
- `history-slice.ts`
- `audit-slice.ts`

Also move pure helpers like `patchItemInTree` and `syncSectionsFromContainers` into separate utility modules so they can be tested independently.

---

### 2. Orchestrator needs modular boundaries

[apps/studio/lib/design-studio/orchestrator.ts](apps/studio/lib/design-studio/orchestrator.ts) is currently the brain, router, tool client, prompt compiler, and vision preprocessor all in one file.

That makes the architecture conceptually strong but implementation-wise too dense.

**Recommendation:** extract into:

- `skill-loader.ts`
- `mcp-client.ts`
- `vision-preprocess.ts`
- `prompt-builder.ts`
- `run-orchestrator.ts`

The public generator can stay small while the internal mechanics move into focused helpers.

---

### 3. MCP route is mixing contract and business logic

[apps/studio/app/api/mcp/route.ts](apps/studio/app/api/mcp/route.ts) currently contains:

- tool metadata
- input schemas
- preset tables
- heuristic keyword matching
- execution switch logic

This is too much for one API route.

**Important architecture issue:** some enum values are still hardcoded in the route schema instead of being fully sourced from the shared schema constants. That creates **drift risk** against the project’s single-source-of-truth rule.

**Recommendation:**

- move each MCP tool into its own file under a `tools/` folder
- centralize schema fragments from shared constants
- keep the route file only as a JSON-RPC dispatcher

---

### 4. The orchestrator hook is no longer “thin”

[apps/studio/hooks/use-orchestrator.ts](apps/studio/hooks/use-orchestrator.ts) says “no business logic lives here”, but in reality it now does:

- event routing
- before/after summary accumulation
- section order reconciliation
- container rebuilding
- config synchronization across multiple surfaces

That comment is now out of date.

**Recommendation:** move event-to-state transformation into a reducer or store action layer. The hook should mostly open the stream and dispatch events.

---

### 5. Prebuilt editor should use a registry pattern

[apps/studio/components/studio/prebuilt-editor.tsx](apps/studio/components/studio/prebuilt-editor.tsx) contains many focused editors, but they are still bundled behind a large branch-based dispatcher.

That means every new section type requires editing one growing file.

**Recommendation:** create a `section-editors/` folder and register editors in a map:

- `hero-editor.tsx`
- `product-grid-editor.tsx`
- `categories-editor.tsx`
- `footer-editor.tsx`
- `announcement-bar-editor.tsx`
- etc.

Then `SectionDataEditor` becomes a small lookup instead of a growing `if` chain.

---

### 6. There appears to be duplicate / stale studio code

There are parallel files such as [components/studio/left-sidebar.tsx](components/studio/left-sidebar.tsx) and [apps/studio/components/studio/left-sidebar.tsx](apps/studio/components/studio/left-sidebar.tsx).

The active studio layout imports the app-scoped version, which means the root-level version is either legacy or at least easy to confuse with the active one.

**Recommendation:** remove, archive, or clearly label legacy root-level studio files. Otherwise future edits will keep landing in the wrong place.

---

## Priority Refactor Plan

| Priority  | Action                                                                                                                                      | Why                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 🔴 High   | Split [apps/studio/lib/store.ts](apps/studio/lib/store.ts) into slices                                                                      | Biggest concentration of mutable logic            |
| 🔴 High   | Break [apps/studio/app/api/mcp/route.ts](apps/studio/app/api/mcp/route.ts) into per-tool modules                                            | Reduces drift and makes tools easier to evolve    |
| 🔴 High   | Extract internals from [apps/studio/lib/design-studio/orchestrator.ts](apps/studio/lib/design-studio/orchestrator.ts)                       | Keeps the core controller readable                |
| 🟡 Medium | Turn [apps/studio/components/studio/prebuilt-editor.tsx](apps/studio/components/studio/prebuilt-editor.tsx) into registry-based sub-editors | Easier extension and smaller diffs                |
| 🟡 Medium | Shrink [apps/studio/hooks/use-orchestrator.ts](apps/studio/hooks/use-orchestrator.ts) to event transport only                               | Better separation of transport vs. business logic |
| 🟢 Low    | Clean up duplicate root-level studio files                                                                                                  | Reduces confusion and wrong-file edits            |

---

## Bottom Line

Your instinct is correct: the main maintainability risk is **not styling or framework choice** — it is **behavior getting concentrated into a few oversized control files**.

If you only tackle three things next, make them:

1. split the store
2. split the MCP route
3. split the orchestrator internals

Those three changes will buy the biggest improvement in readability, safety, and future velocity.

---

# Presentation Review — `presentation-technical.html`

**Date:** April 14, 2026
**Scope:** `presentation-technical.html` — 8-slide technical deck. What's missing or weak, and what concrete changes would make it a killer presentation.

---

## Overall Verdict

The deck has good bones: dark theme, consistent color system, correct slide order, and the architecture diagram is working. But it reads more like **a reference doc that happens to be full-screen** than a presentation that builds a case. A killer technical presentation needs a narrative arc, visual hierarchy that guides the eye, and moments that make the audience lean in. Several slides are overly dense, the most important insight (the HITL rejection loop) is buried in a footnote, and the opening slide does not hook anyone.

---

## What's Working

- Dark design with a consistent 5-color system (indigo/sky/amber/emerald/violet) — looks professional
- Architecture diagram on slide 2 is the right call and the box-chip layout reads clearly
- HITL slide headline ("The LLM never publishes without explicit human approval") is the strongest sentence in the deck
- Skill tag badges (`always` / `vision` / `content` / `conversion`) give instant scannable context
- Navigation (dots, arrows, keyboard) is complete

---

## Improvements (Priority Order)

### 1. 🔴 The opening slide has no hook

**Current:** Badge pill + big title + a one-paragraph feature description.

The subtitle reads like a README intro: _"An agentic design system where an LLM orchestrates…"_. By the time the audience finishes parsing it, they already don't care.

**Fix:** Replace the subtitle with a sharp **problem statement + contrast**, e.g.:

> _Design agencies spend days in Figma iterating on storefront layouts. This system does it in one conversation — and the human stays in control of every change._

Or even shorter — a single provocative question: _"What if you could give an AI a brand URL and get a live storefront in one approval cycle?"_ Then the feature description drops below as a secondary line.

The title slide is the **first impression**. It should make someone want to see slide 2.

---

### 2. 🔴 The architecture diagram is missing the LLM↔Orchestrator connection

**Current:** The top row shows `User ←→ [gap] ←→ LLM` as if they communicate directly. The Orchestrator box sits below with no visible upward arrow connecting it to the LLM node.

This is architecturally wrong visually — the LLM doesn't talk to the User directly. The Orchestrator mediates both relationships.

**Fix:** Add a vertical connector from the Orchestrator box up to both the User node and the LLM node. The top-row `←→` arrow should be labelled _"via Orchestrator"_ or removed in favour of downward arrows from each node into the Orchestrator.

---

### 3. 🔴 HITL rejection loop is buried in a footnote

The HITL slide headline is the best in the deck. But the **most interesting part — that rejection re-submits full context and loops back through Phase 2** — is in a small amber footnote box at the bottom, below the fold for anyone not on a tall screen.

**Fix:** Promote the rejection loop to a visual element inside the main flow. Add a curved "↩ Revise loop" arrow that visually loops from the "Human reviews" node back to "LLM runs workflow". The footnote text can stay but the loop arc makes it stick.

---

### 4. 🟡 Slide 3 (Orchestrator) is too dense

Six panels of 3–4 lines each on one slide. A technical audience can read it, but in a live presentation they'll be reading panel 3 while you're talking about panel 5.

**Fix:** Split into two slides:

- **Slide 3a — Runtime behaviour:** Skill loading, Dynamic MCP registration, streamText loop (the "how it boots and runs")
- **Slide 3b — Control plane:** Tool interception (guardrail), Two-model vision pipeline, Stateless/resumable (the "how it stays safe and scalable")

Each slide gets 3 panels with more whitespace — easier to follow and gives you a natural speaking pause.

---

### 5. 🟡 Slide 7 (Sequence) is a wall of text rows

Seven identical-height rows with the same background and text size. No visual rhythm. Difficult to see at a glance where the interesting moment (step 4 — HITL fires) is.

**Fix:** Give step 4 and 5 (the HITL gate and human decision) a visually distinct treatment — wider row, amber left-border, or slightly taller. The `n-a` amber number is already there; extend the amber accent as a left border stripe on those two rows so the eye jumps to the human-in-the-loop moment immediately.

---

### 6. 🟡 The Skills slide footnote is actually a key insight

The footnote at the bottom of slide 5:

> _"Skills use `{{HERO_LAYOUTS}}`, `{{DOMINANT_STYLES}}` etc. — interpolated from `schema.ts` at load time. Single source of truth for all enums."_

This is one of the most elegant aspects of the design — one file drives types, UI dropdowns, MCP enums, and AI prompts simultaneously. It deserves more than gray 0.67rem text.

**Fix:** Turn it into a highlighted callout box with an indigo border, labelled something like **"One schema, zero drift"**, similar in style to the amber HITL note on slide 6.

---

### 7. 🟡 Slide 8 (Extensibility) production roadmap is unreadable

**Current:** All future items are collapsed into a single wall-of-text gray paragraph separated only by `·` bullets.

**Fix:** Show as a 2-column grid of smaller cards, or a simple checklist with coloured status dots — green for done, grey for planned. The contrast between "done" and "next" is itself a story worth visualising.

---

### 8. 🟢 No slide for the actual UI

The deck explains the system from the inside out — orchestrator, MCP, skills — but never shows what the user actually sees. A technical audience can visualise it, but **a screenshot or mockup of the 3-pane studio layout** (left sidebar with vision input, center canvas with live storefront, right sidebar with plan approval) would make everything concrete in 2 seconds.

This could be a 9th slide immediately after the title, or embedded as a small inset on the title slide itself.

---

### 9. 🟢 No keyboard hint for first-time viewers

The deck supports arrow keys and spacebar, but there's no hint. A first-time viewer sharing their screen will click the edges trying to advance. Add a one-time "Press → to advance" tooltip that fades after 4 seconds.

---

### 10. 🟢 Unicode arrows look rough in the architecture connector column

The middle column between MCP and the HITL/Store stack uses `▲▼` Unicode characters and inline `height` hacks for the connecting lines. On high-DPI screens they render slightly misaligned.

**Fix:** Replace with a thin SVG `<line>` or a single-pixel `border-left` CSS rule on a flex container. Cleaner and resolution-independent.

---

## Slide-by-Slide Priority Fix List

| Slide             | Issue                                         | Fix                                                            |
| ----------------- | --------------------------------------------- | -------------------------------------------------------------- |
| 1 — Title         | No hook, describes not provokes               | Lead with a problem statement or provocative question          |
| 2 — Architecture  | LLM↔Orchestrator arrow missing                | Add vertical connectors from Orchestrator up to both top nodes |
| 3 — Orchestrator  | 6 panels too dense                            | Split into 3a (runtime) + 3b (control plane)                   |
| 4 — MCP           | Good, minor: left/right column weights uneven | Even up the bullet line-heights                                |
| 5 — Skills        | Single-source footnote is undersold           | Promote to a highlighted callout box                           |
| 6 — HITL          | Rejection loop buried in footnote             | Add a visible loop arc in the flow diagram                     |
| 7 — Sequence      | No visual emphasis on the HITL moment         | Amber left-border stripe on steps 4–5                          |
| 8 — Extensibility | Roadmap is unreadable wall                    | 2-col checklist with done/planned dots                         |
| _(missing)_       | No UI visual                                  | Add a screenshot/mockup slide after the title                  |

---

# Architecture Review — AI Storefront Design Studio

**Date:** April 8, 2026  
**Reviewer:** GitHub Copilot  
**Scope:** Compared against modern React/Next.js UI architecture best practices (2024–2026)

---

## Summary Verdict

The project has a solid conceptual foundation — monorepo, shared types, SSE-based streaming, HITL approval flow. The main issues are in **component size and cohesion**: three files (`left-sidebar.tsx` at 613 lines, `right-sidebar.tsx` at 488 lines, `component-editor.tsx` at 410 lines) each contain multiple distinct UI responsibilities bundled together. This makes them hard to test, navigate, and extend.

---

## Strengths

| Area                         | Assessment                                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo structure**       | Clean Turborepo setup with proper workspace isolation. Shared types and components packages prevent drift. ✅               |
| **Shared rendering engine**  | Single source of truth in `packages/storefront-components` — both apps render from the same code. ✅                        |
| **State management**         | Zustand with granular updaters (`updateTheme`, `updateHero`, `setProductGridColumns`). No unnecessary re-renders. ✅        |
| **SSE streaming**            | Stateless orchestrator as async generator emitting typed events is a clean pattern. ✅                                      |
| **HITL flow**                | Plan → approval gate → resume is architecturally sound. `resumeWithFeedback` embedding previous plan context is correct. ✅ |
| **Skill system**             | SKILL.md files loaded at runtime — no orchestrator code changes needed for new skills. Good separation. ✅                  |
| **Tailwind v4**              | `@source` directives for cross-package scanning is the right approach. ✅                                                   |
| **`data-testid` discipline** | Consistent kebab-case attributes on all meaningful elements. ✅                                                             |

---

## Issues & Gaps

### 1. Component Size Violations (Critical)

The project's own rule says **"keep every component under ~80 lines"**. All three major studio files break this:

| File                   | Lines | Sub-components bundled                                                                                                                                  |
| ---------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `left-sidebar.tsx`     | 613   | `InlinePlanApproval`, `ValueRow`, `AppliedSummaryPanel`, `LeftSidebar` + all helpers                                                                    |
| `right-sidebar.tsx`    | 488   | `ThemePanel`, `ContainerLayoutConfig`, `ComponentRow`, `ComponentPickerInline`, `ContainerNode`, `ContainersPanel`, `RightSidebar`                      |
| `component-editor.tsx` | 410   | `AdvancedSection`, `WysiwygEditor`, `ToolBtn`, `HeroEditor`, `ProductGridEditor`, `SectionDataEditor` (6 variants), `PrebuiltEditor`, `ComponentEditor` |

**Modern practice:** Each named sub-component should live in its own file or be explicitly co-located in a clearly scoped file with a single exported component. Files beyond ~150 lines should be split.

---

### 2. No Custom Hooks for Complex State Logic

`LeftSidebar` contains orchestration logic (`handleSimulate`, `handleReset`, `readImageFile`, `handleDrop`) inline inside the component. This mixes UI and behavior.

**Modern practice:** Extract to a `use-left-sidebar.ts` hook that returns derived state and handlers. The component renders only.

---

### 3. `SectionDataEditor` is a God Dispatcher

`SectionDataEditor` in `component-editor.tsx` has 7 `if (sectionKey === '...')` branches, each rendering a different form. Adding a new section type requires editing this function.

**Modern practice:** A registry pattern — a `Record<string, React.FC<SectionEditorProps>>` keyed by `sectionKey` — makes extension O(1) and keeps each editor isolated and testable.

---

### 4. `execCommand` Deprecation in WYSIWYG Editor

`WysiwygEditor` uses `document.execCommand()` which is deprecated in all major browsers (MDN: "This feature is no longer recommended"). It will eventually stop working.

**Modern practice:** Use a lightweight headless editor library (e.g. `@tiptap/react` with minimal extensions) or a `contentEditable` + `Selection`/`Range` API approach. For this project's scope, a simple `<textarea>` with markdown-lite parsing is more robust than `execCommand`.

---

### 5. Missing Error Boundaries

The canvas and sidebar panels have no React error boundaries. A bad config value (e.g., a malformed `sectionData` entry) will unmount the entire 3-pane layout.

**Modern practice:** Wrap each pane (`LeftSidebar`, `CenterCanvas`, `RightSidebar`) in an `ErrorBoundary` that catches render errors and shows a recovery UI without crashing the shell.

---

### 6. No Loading / Skeleton States on Canvas

The canvas renders immediately from Zustand state, but when the AI applies a `config_update`, the entire preview re-renders in one synchronous frame — potentially causing a flash or jank with large configs.

**Modern practice:** Wrap `StorefrontPreview` in a `Suspense` boundary or apply an optimistic loading shimmer when `agentStep === 'updating'`.

---

### 7. `crypto.randomUUID()` Called at Render Time in JSX

In `ComponentPickerInline`, container and component items use `id: crypto.randomUUID()` inside JSX button `onClick` handlers. This is fine, but nested `key={crypto.randomUUID()}` calls (if any were added) would cause issues. The current implementation is safe but worth noting as a footgun.

---

### 8. Config Persistence Has No Conflict Resolution

The `PUT /api/store-config` writes `apps/web/data/store-config.json` directly. There's no locking, versioning, or conflict detection. If the Studio and another process both write simultaneously, the last write wins silently.

**Modern practice:** For a local dev tool this is acceptable, but documenting this limitation and adding a `ETag`/`last-modified` check on save would prevent accidental overwrites in a multi-user scenario.

---

### 9. `packages/ui` is Underutilized

`packages/ui` exists as a workspace package but only `Button`, `Input`, and `Label` from `@/components/ui/` (local copies) are used in Studio. The shared `packages/ui` package appears unused.

**Modern practice:** Either remove `packages/ui` or migrate the local `components/ui/` primitives into it so both apps share the same source.

---

### 10. No Type Guard on `sectionData` Access

In `SectionDataEditor`:

```typescript
const data = (config.sectionData as Record<string, unknown>)[sectionKey] ?? {};
```

This bypasses the typed `StorefrontSectionData` interface. If `sectionKey` doesn't exist, `data` is `{}` with no type safety, and all `d.field` accesses are unchecked casts.

**Modern practice:** Use a typed accessor function with a type guard per section type, or use Zod to validate section data at the boundary.

---

## Refactoring Roadmap (Priority Order)

| Priority  | Action                                                                                                                                                | Impact                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 🔴 High   | Split `left-sidebar.tsx` into `plan-approval.tsx`, `applied-summary.tsx`, `vision-input.tsx`, `execution-trace.tsx`                                   | Biggest file, 4 concerns |
| 🔴 High   | Split `right-sidebar.tsx` into `theme-panel.tsx`, `containers-panel.tsx`, `container-node.tsx`, `container-layout-config.tsx`, `component-picker.tsx` | 6 concerns               |
| 🔴 High   | Split `component-editor.tsx`: move `SectionDataEditor` branches into a `section-editors/` folder with a registry                                      | 8 concerns               |
| 🟡 Medium | Extract `LeftSidebar` orchestration logic into `use-left-sidebar.ts` hook                                                                             | Testability              |
| 🟡 Medium | Add React `ErrorBoundary` wrapper around each sidebar pane                                                                                            | Resilience               |
| 🟡 Medium | Replace `execCommand` WYSIWYG with safer alternative                                                                                                  | Deprecation risk         |
| 🟢 Low    | Typed `sectionData` accessor with Zod or type guards                                                                                                  | Type safety              |
| 🟢 Low    | Consolidate `packages/ui` vs local `components/ui/`                                                                                                   | DRY                      |

---

## Component Size After Refactor Target

| Current file                 | Target files                                                                                                                                | Lines each   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `left-sidebar.tsx` (613)     | `left-sidebar.tsx`, `plan-approval.tsx`, `applied-summary.tsx`, `vision-input.tsx`, `execution-trace.tsx`                                   | ~80–120 each |
| `right-sidebar.tsx` (488)    | `right-sidebar.tsx`, `theme-panel.tsx`, `containers-panel.tsx`, `container-node.tsx`, `container-layout-config.tsx`, `component-picker.tsx` | ~60–100 each |
| `component-editor.tsx` (410) | `component-editor.tsx`, `wysiwyg-editor.tsx`, `advanced-section.tsx`, `section-editors/index.tsx` + individual editors                      | ~40–80 each  |

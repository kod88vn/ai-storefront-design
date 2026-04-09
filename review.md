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

"use client";

import { useCallback, useRef } from "react";
import { useStudioStore } from "@/lib/store";
import type {
  OrchestratorContext,
  OrchestratorEvent,
  PlanFeedback,
  AppliedSummary,
  StorefrontConfig,
  ThemeConfig,
  HeroConfig,
} from "@ai-storefront/types";

/**
 * Thin client hook — no business logic lives here.
 * It opens an SSE stream to /api/orchestrate and routes events to the store.
 */
export function useOrchestrator() {
  // Snapshot of config taken at run start — used for before/after ValueChange
  const beforeConfig = useRef<StorefrontConfig | null>(null);

  // Accumulate config changes across the run so we can build a summary
  const accTheme = useRef<Partial<ThemeConfig>>({});
  const accHero = useRef<Partial<HeroConfig>>({});
  const accGridCols = useRef<2 | 3 | 4 | null>(null);
  const accSectionOrder = useRef<string[] | null>(null);
  const accPlanDescription = useRef<string | null>(null);

  function resetAccumulators() {
    beforeConfig.current = null;
    accTheme.current = {};
    accHero.current = {};
    accGridCols.current = null;
    accSectionOrder.current = null;
    accPlanDescription.current = null;
  }

  // ── Event handler (stable — uses getState() to avoid stale closures) ────────

  const handleEvent = useCallback((event: OrchestratorEvent) => {
    const s = useStudioStore.getState();

    // Drive the execution trace from agentStep embedded in events
    if (event.agentStep) {
      s.setAgentStep(event.agentStep);
    }

    switch (event.type) {
      case "progress":
        // agentStep already handled above
        break;

      case "audit":
        if (event.entry) {
          s.addAuditEntry(event.entry);
        }
        break;

      case "plan_description":
        if (event.plan) {
          s.setAgentPlan({ ...event.plan, approved: null });
          accPlanDescription.current = event.plan.description;
        }
        break;

      case "config_update": {
        if (!event.configUpdate) break;
        const u = event.configUpdate;
        if (u.themeChanges) {
          accTheme.current = { ...accTheme.current, ...u.themeChanges };
          s.updateTheme(u.themeChanges);
        }
        if (u.heroChanges) {
          accHero.current = { ...accHero.current, ...u.heroChanges };
          s.updateHero(u.heroChanges);
        }
        if (u.productGridColumns) {
          accGridCols.current = u.productGridColumns;
          s.setProductGridColumns(u.productGridColumns);
        }

        // ── Section updates: sync both config.sections AND containers ────────
        // The canvas renders from `containers`; the web preview renders from
        // `config.sections`. We must keep both in sync.
        const hasSectionChanges =
          u.sectionOrder || u.enableSections || u.disableSections;

        if (hasSectionChanges) {
          // Step 1: enable/disable sections in config first
          if (u.enableSections) {
            for (const type of u.enableSections) s.enableSection(type);
          }
          if (u.disableSections) {
            for (const type of u.disableSections) s.disableSection(type);
          }

          // Step 2: build the full ordered+enabled section list
          const currentState = useStudioStore.getState();
          const allSections = currentState.config.sections;

          // Determine display order: use AI-provided sectionOrder if given,
          // otherwise keep current order
          const orderedIds: string[] = u.sectionOrder
            ? [
                ...u.sectionOrder,
                // append any sections not mentioned in sectionOrder at the end
                ...allSections
                  .filter((sec) => !u.sectionOrder!.includes(sec.id))
                  .sort((a, b) => a.order - b.order)
                  .map((sec) => sec.id),
              ]
            : allSections
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((sec) => sec.id);

          if (u.sectionOrder) {
            accSectionOrder.current = orderedIds;
          }

          // Step 3: rebuild containers to match — one container per enabled section
          const existingContainers =
            currentState.pageContainers[currentState.currentPage] ?? [];
          const newContainers = orderedIds
            .map((id) => {
              const sec = allSections.find((sec) => sec.id === id);
              if (!sec?.enabled) return null;
              // Reuse existing container if there is one, otherwise create new
              const existing = existingContainers.find(
                (c) =>
                  c.components.length > 0 &&
                  c.components[0].kind === "prebuilt" &&
                  c.components[0].sectionType === id,
              );
              if (existing) return existing;
              const label = id
                .split("-")
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(" ");
              return {
                id: `c-${id}`,
                label,
                layoutMode: "block" as const,
                flexConfig: {
                  direction: "row" as const,
                  wrap: false,
                  justify: "start" as const,
                  align: "start" as const,
                  gap: 4,
                },
                gridConfig: { cols: 2, gap: 4 },
                components: [
                  {
                    kind: "prebuilt" as const,
                    id,
                    sectionType:
                      id as import("@ai-storefront/types").SectionType,
                    customClasses: "",
                  },
                ],
              };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null);

          s.reorderContainers(newContainers);
        }

        if (u.sectionData) {
          s.updateSectionData(u.sectionData);
        }
        if (u.navChanges) {
          if (u.navChanges.brandName !== undefined) {
            s.updateNavBrandName(u.navChanges.brandName);
          }
          // Apply visual style fields from navChanges (same as componentStyleChanges.navbar)
          if (
            u.navChanges.backgroundColor !== undefined ||
            u.navChanges.textColor !== undefined ||
            u.navChanges.fontSize !== undefined
          ) {
            s.updateNavStyle({
              backgroundColor: u.navChanges.backgroundColor,
              textColor: u.navChanges.textColor,
              fontSize: u.navChanges.fontSize,
            });
          }
        }
        if (u.productsPageChanges) {
          s.updateProductsPageConfig(u.productsPageChanges);
        }
        if (u.cartPageChanges) {
          s.updateCartPageConfig(u.cartPageChanges);
        }
        if (u.componentStyleChanges) {
          const cs = u.componentStyleChanges as Record<
            string,
            Record<string, string | undefined>
          >;
          if (cs.navbar)
            s.updateNavStyle(
              cs.navbar as Parameters<typeof s.updateNavStyle>[0],
            );
          if (cs.hero) s.updateHero(cs.hero);
          if (cs.productGrid) s.updateProductGrid(cs.productGrid);
          if (cs.categories) s.updateCategoriesConfig(cs.categories);
          if (cs.footer) s.updateFooterConfig(cs.footer);
        }
        break;
      }

      case "complete": {
        const before = beforeConfig.current;
        const afterState = useStudioStore.getState();

        // Build theme ValueChange — only include fields that actually changed
        let themeChange: AppliedSummary["theme"] = null;
        if (before && Object.keys(accTheme.current).length > 0) {
          themeChange = {};
          if (accTheme.current.primaryColor !== undefined) {
            themeChange.primaryColor = {
              before: before.theme.primaryColor,
              after: accTheme.current.primaryColor,
            };
          }
          if (accTheme.current.secondaryColor !== undefined) {
            themeChange.secondaryColor = {
              before: before.theme.secondaryColor,
              after: accTheme.current.secondaryColor,
            };
          }
          if (accTheme.current.borderRadius !== undefined) {
            themeChange.borderRadius = {
              before: before.theme.borderRadius,
              after: accTheme.current.borderRadius,
            };
          }
          if (accTheme.current.fontStyle !== undefined) {
            themeChange.fontStyle = {
              before: before.theme.fontStyle ?? "modern-sans",
              after: accTheme.current.fontStyle,
            };
          }
          if (accTheme.current.navStyle !== undefined) {
            themeChange.navStyle = {
              before: before.theme.navStyle ?? "bordered",
              after: accTheme.current.navStyle,
            };
          }
          if (accTheme.current.colorScheme !== undefined) {
            themeChange.colorScheme = {
              before: before.theme.colorScheme ?? "light",
              after: accTheme.current.colorScheme,
            };
          }
          if (Object.keys(themeChange).length === 0) themeChange = null;
        }

        // Build hero ValueChange
        let heroChange: AppliedSummary["hero"] = null;
        if (before && Object.keys(accHero.current).length > 0) {
          heroChange = {};
          if (accHero.current.layout !== undefined) {
            heroChange.layout = {
              before: before.hero.layout,
              after: accHero.current.layout,
            };
          }
          if (accHero.current.title !== undefined) {
            heroChange.title = {
              before: before.hero.title,
              after: accHero.current.title,
            };
          }
          if (accHero.current.subtitle !== undefined) {
            heroChange.subtitle = {
              before: before.hero.subtitle,
              after: accHero.current.subtitle,
            };
          }
          if (Object.keys(heroChange).length === 0) heroChange = null;
        }

        const summary: AppliedSummary = {
          sourceUrl: afterState.visionUrl || null,
          planDescription: accPlanDescription.current,
          theme: themeChange,
          hero: heroChange,
          productGridColumns:
            accGridCols.current !== null && before
              ? {
                  before: before.productGrid.columns,
                  after: accGridCols.current,
                }
              : null,
          sectionOrder:
            accSectionOrder.current !== null && before
              ? {
                  before: before.sections
                    .sort((a, b) => a.order - b.order)
                    .map((s) => s.id),
                  after: accSectionOrder.current,
                }
              : null,
          sectionsEnabled: before
            ? (() => {
                const beforeEnabled = before.sections
                  .filter((s) => s.enabled)
                  .map((s) => s.id)
                  .sort();
                const afterEnabled = afterState.config.sections
                  .filter((s) => s.enabled)
                  .map((s) => s.id)
                  .sort();
                const changed =
                  JSON.stringify(beforeEnabled) !==
                  JSON.stringify(afterEnabled);
                return changed
                  ? { before: beforeEnabled, after: afterEnabled }
                  : null;
              })()
            : null,
        };
        afterState.setAppliedSummary(summary);
        afterState.setAgentStep("complete");
        afterState.setAgentPlan(null);
        resetAccumulators();
        break;
      }

      case "error":
        s.addAuditEntry({
          method: "agent/error",
          params: { error: event.error ?? "Unknown error" },
        });
        s.setAgentStep("idle");
        resetAccumulators();
        break;
    }
  }, []);

  // ── Start a new orchestrator run ─────────────────────────────────────────────

  const startOrchestrator = useCallback(
    async (goal: string, context: OrchestratorContext) => {
      const s = useStudioStore.getState();
      s.setOrchestratorGoal(goal);
      s.setOrchestratorContext(context);
      s.setAgentStep("thinking");
      s.setAppliedSummary(null);
      // Reset accumulators FIRST, then snapshot config so the snapshot isn't wiped
      resetAccumulators();
      beforeConfig.current = structuredClone(s.config);

      s.addAuditEntry({
        method: "agent/start",
        params: { goal, visionUrl: context.visionUrl ?? null },
      });

      let response: Response;
      try {
        response = await fetch("/api/orchestrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, context }),
        });
      } catch (err) {
        useStudioStore.getState().setAgentStep("idle");
        useStudioStore.getState().addAuditEntry({
          method: "agent/error",
          params: { error: (err as Error).message },
        });
        return;
      }

      if (!response.ok) {
        let body = "";
        try {
          body = await response.text();
        } catch {
          /* ignore */
        }
        useStudioStore.getState().setAgentStep("idle");
        useStudioStore.getState().addAuditEntry({
          method: "agent/error",
          params: {
            error: `HTTP ${response.status} ${response.statusText}`,
            body: body.slice(0, 500),
          },
        });
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Split on double-newline SSE frame delimiter
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            if (!frame.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(frame.slice(6)) as OrchestratorEvent;
              handleEvent(event);
            } catch (parseErr) {
              console.error(
                "[orchestrator] Failed to parse SSE frame:",
                frame.slice(0, 200),
                parseErr,
              );
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
    [handleEvent],
  );

  // ── Resume after HITL (stateless — re-posts full goal + context) ─────────────

  const resumeWithFeedback = useCallback(
    (feedback: PlanFeedback) => {
      const s = useStudioStore.getState();
      const goal = s.orchestratorGoal;
      const ctx = s.orchestratorContext;
      const plan = s.agentPlan;

      if (!goal || !ctx) return;

      // Embed the previous plan so the AI can remember what it proposed
      const enrichedFeedback: PlanFeedback = {
        ...feedback,
        previousPlan: plan
          ? {
              description: plan.description,
              layoutProposal: plan.layoutProposal,
              colorProposal: plan.colorProposal,
            }
          : undefined,
      };

      startOrchestrator(goal, { ...ctx, planFeedback: enrichedFeedback });
    },
    [startOrchestrator],
  );

  return { startOrchestrator, resumeWithFeedback };
}

"use client";

import { useCallback, useRef } from "react";
import { useStudioStore } from "@/lib/store";
import type {
  OrchestratorContext,
  OrchestratorEvent,
  PlanFeedback,
  AppliedSummary,
  ThemeConfig,
  HeroConfig,
} from "@/lib/types";

/**
 * Thin client hook — no business logic lives here.
 * It opens an SSE stream to /api/orchestrate and routes events to the store.
 */
export function useOrchestrator() {
  // Accumulate config changes across the run so we can build a summary
  const accTheme = useRef<Partial<ThemeConfig>>({});
  const accHero = useRef<Partial<HeroConfig>>({});
  const accGridCols = useRef<2 | 3 | 4 | null>(null);
  const accSectionOrder = useRef<string[] | null>(null);
  const accPlanDescription = useRef<string | null>(null);

  function resetAccumulators() {
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
        if (u.sectionOrder) {
          accSectionOrder.current = u.sectionOrder;
          const current = [...s.config.sections];
          const reordered = u.sectionOrder
            .map((id, order) => {
              const found = current.find((sec) => sec.id === id);
              return found ? { ...found, order } : null;
            })
            .filter((sec): sec is NonNullable<typeof sec> => Boolean(sec));
          if (reordered.length === current.length) {
            s.reorderSections(reordered);
          }
        }
        break;
      }

      case "complete": {
        const summary: AppliedSummary = {
          sourceUrl: useStudioStore.getState().visionUrl || null,
          planDescription: accPlanDescription.current,
          themeChanges: Object.keys(accTheme.current).length > 0 ? { ...accTheme.current } : null,
          heroChanges: Object.keys(accHero.current).length > 0 ? { ...accHero.current } : null,
          productGridColumns: accGridCols.current,
          sectionOrder: accSectionOrder.current,
        };
        useStudioStore.getState().setAppliedSummary(summary);
        useStudioStore.getState().setAgentStep("complete");
        useStudioStore.getState().setAgentPlan(null);
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
      resetAccumulators();

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
            } catch {
              // skip malformed frame
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

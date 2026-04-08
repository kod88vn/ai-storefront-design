"use client";

import { create } from "zustand";
import type {
  StorefrontConfig,
  AgentStep,
  AgentPlan,
  AuditLogEntry,
  Viewport,
  ThemeConfig,
  HeroConfig,
  LayoutSection,
  LoadedSkill,
  OrchestratorContext,
  AppliedSummary,
} from "./types";

interface StudioState {
  // Storefront Configuration
  config: StorefrontConfig;

  // Viewport
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;

  // Theme
  updateTheme: (theme: Partial<ThemeConfig>) => void;

  // Hero
  updateHero: (hero: Partial<HeroConfig>) => void;

  // Product Grid
  setProductGridColumns: (columns: 2 | 3 | 4) => void;

  // Layout Sections
  reorderSections: (sections: LayoutSection[]) => void;
  toggleSection: (sectionId: string) => void;

  // Agent State
  agentStep: AgentStep;
  agentPlan: AgentPlan | null;
  setAgentStep: (step: AgentStep) => void;
  setAgentPlan: (plan: AgentPlan | null) => void;
  approvePlan: () => void;
  rejectPlan: (feedback: string) => void;

  // Audit Log
  auditLog: AuditLogEntry[];
  addAuditEntry: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  clearAuditLog: () => void;

  // Vision Input
  visionUrl: string;
  setVisionUrl: (url: string) => void;

  // Skills
  activeSkills: string[];
  toggleSkill: (skill: string) => void;

  // Loaded Skill Definitions
  loadedSkills: LoadedSkill[];
  setLoadedSkills: (skills: LoadedSkill[]) => void;

  // Orchestrator resume state (persisted for stateless HITL resume)
  orchestratorGoal: string | null;
  orchestratorContext: OrchestratorContext | null;
  setOrchestratorGoal: (goal: string | null) => void;
  setOrchestratorContext: (context: OrchestratorContext | null) => void;

  // Applied summary (shown after flow completes)
  appliedSummary: AppliedSummary | null;
  setAppliedSummary: (summary: AppliedSummary | null) => void;
}

const defaultConfig: StorefrontConfig = {
  theme: {
    primaryColor: "#1a1a1a",
    secondaryColor: "#22c55e",
    borderRadius: "md",
  },
  sections: [
    { id: "hero", type: "hero", enabled: true, order: 0 },
    { id: "product-grid", type: "product-grid", enabled: true, order: 1 },
    { id: "categories", type: "categories", enabled: true, order: 2 },
    { id: "footer", type: "footer", enabled: true, order: 3 },
  ],
  hero: {
    layout: "split",
    title: "Curated Home Essentials",
    subtitle: "Discover timeless pieces for modern living",
    ctaText: "Shop Collection",
  },
  productGrid: {
    columns: 3,
  },
};

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial State
  config: defaultConfig,
  viewport: "desktop",
  agentStep: "idle",
  agentPlan: null,
  auditLog: [],
  visionUrl: "",
  activeSkills: ["ui_extractor", "theme_generator", "layout_planner"],
  loadedSkills: [],
  orchestratorGoal: null,
  orchestratorContext: null,
  appliedSummary: null,

  // Viewport
  setViewport: (viewport) => {
    set({ viewport });
    get().addAuditEntry({
      method: "viewport/change",
      params: { viewport },
    });
  },

  // Theme
  updateTheme: (theme) => {
    set((state) => ({
      config: {
        ...state.config,
        theme: { ...state.config.theme, ...theme },
      },
    }));
    get().addAuditEntry({
      method: "theme/update",
      params: { changes: theme },
    });
  },

  // Hero
  updateHero: (hero) => {
    set((state) => ({
      config: {
        ...state.config,
        hero: { ...state.config.hero, ...hero },
      },
    }));
    get().addAuditEntry({
      method: "hero/update",
      params: { changes: hero },
    });
  },

  // Product Grid
  setProductGridColumns: (columns) => {
    set((state) => ({
      config: {
        ...state.config,
        productGrid: { columns },
      },
    }));
    get().addAuditEntry({
      method: "productGrid/setColumns",
      params: { columns },
    });
  },

  // Layout Sections
  reorderSections: (sections) => {
    set((state) => ({
      config: {
        ...state.config,
        sections,
      },
    }));
    get().addAuditEntry({
      method: "layout/reorder",
      params: { newOrder: sections.map((s) => s.id) },
    });
  },

  toggleSection: (sectionId) => {
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((s) =>
          s.id === sectionId ? { ...s, enabled: !s.enabled } : s,
        ),
      },
    }));
    get().addAuditEntry({
      method: "layout/toggleSection",
      params: { sectionId },
    });
  },

  // Agent
  setAgentStep: (agentStep) => set({ agentStep }),
  setAgentPlan: (agentPlan) => set({ agentPlan }),

  approvePlan: () => {
    const plan = get().agentPlan;
    if (plan) {
      set({ agentPlan: { ...plan, approved: true } });
      get().addAuditEntry({
        method: "agent/approvePlan",
        params: { planId: plan.id },
        result: { approved: true },
      });
    }
  },

  rejectPlan: (feedback) => {
    const plan = get().agentPlan;
    if (plan) {
      set({ agentPlan: { ...plan, approved: false } });
      get().addAuditEntry({
        method: "agent/rejectPlan",
        params: { planId: plan.id, feedback },
        result: { approved: false },
      });
    }
  },

  // Audit Log
  addAuditEntry: (entry) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    set((state) => ({
      auditLog: [...state.auditLog, newEntry],
    }));
  },

  clearAuditLog: () => set({ auditLog: [] }),

  // Vision
  setVisionUrl: (visionUrl) => set({ visionUrl }),

  // Skills
  toggleSkill: (skill) => {
    set((state) => ({
      activeSkills: state.activeSkills.includes(skill)
        ? state.activeSkills.filter((s) => s !== skill)
        : [...state.activeSkills, skill],
    }));
  },

  // Loaded Skills
  setLoadedSkills: (loadedSkills) => set({ loadedSkills }),

  // Orchestrator resume
  setOrchestratorGoal: (orchestratorGoal) => set({ orchestratorGoal }),
  setOrchestratorContext: (orchestratorContext) => set({ orchestratorContext }),

  // Applied summary
  setAppliedSummary: (appliedSummary) => set({ appliedSummary }),
}));

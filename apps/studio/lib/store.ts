"use client";

import { create } from "zustand";
import type {
  StorefrontConfig,
  StorefrontSectionData,
  SectionType,
  AgentStep,
  AgentPlan,
  AuditLogEntry,
  Viewport,
  ThemeConfig,
  HeroConfig,
  ProductGridConfig,
  LayoutSection,
  LoadedSkill,
  OrchestratorContext,
  AppliedSummary,
} from "@ai-storefront/types";
import type {
  DesignerContainer,
  ComponentItem,
  SelectedComponentRef,
  FlexContainerConfig,
  GridContainerConfig,
  ContainerLayoutMode,
} from "@/lib/types";
import { DEFAULT_FLEX_CONFIG, DEFAULT_GRID_CONFIG } from "@/lib/types";

// ─── Container helpers ────────────────────────────────────────────────────────

/** Recursively patches a component inside nested container trees. */
function patchItemInTree(
  items: ComponentItem[],
  containerId: string,
  componentId: string,
  patch: Record<string, unknown>,
): ComponentItem[] {
  return items.map((item) => {
    if (item.kind !== "container") return item;
    if (item.id === containerId) {
      return {
        ...item,
        components: item.components.map((c) =>
          c.id === componentId ? ({ ...c, ...patch } as ComponentItem) : c,
        ),
      };
    }
    return {
      ...item,
      components: patchItemInTree(
        item.components,
        containerId,
        componentId,
        patch,
      ),
    };
  });
}

function syncSectionsFromContainers(
  containers: DesignerContainer[],
): LayoutSection[] {
  const sections: LayoutSection[] = [];
  let order = 0;
  for (const container of containers) {
    for (const comp of container.components) {
      if (comp.kind === "prebuilt") {
        sections.push({
          id: comp.sectionType,
          type: comp.sectionType,
          enabled: true,
          order: order++,
        });
      }
    }
  }
  return sections;
}

function makeBlock(
  id: string,
  label: string,
  sectionType: SectionType,
): DesignerContainer {
  return {
    id,
    label,
    layoutMode: "block",
    flexConfig: { ...DEFAULT_FLEX_CONFIG },
    gridConfig: { ...DEFAULT_GRID_CONFIG },
    components: [
      { kind: "prebuilt", id: sectionType, sectionType, customClasses: "" },
    ],
  };
}

const defaultContainers: DesignerContainer[] = [
  makeBlock("c-hero", "Hero", "hero"),
  makeBlock("c-products", "Product Grid", "product-grid"),
  makeBlock("c-categories", "Categories", "categories"),
  makeBlock("c-footer", "Footer", "footer"),
];

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
  updateProductGrid: (patch: Partial<ProductGridConfig>) => void;

  // Layout Sections
  reorderSections: (sections: LayoutSection[]) => void;
  toggleSection: (sectionId: string) => void;
  enableSection: (type: SectionType) => void;
  disableSection: (type: SectionType) => void;
  updateSectionData: (data: Partial<StorefrontSectionData>) => void;

  // Designer Containers
  containers: DesignerContainer[];
  selectedComponent: SelectedComponentRef;
  addContainer: () => void;
  removeContainer: (id: string) => void;
  updateContainerLabel: (id: string, label: string) => void;
  updateContainerLayoutMode: (id: string, mode: ContainerLayoutMode) => void;
  updateContainerFlexConfig: (
    id: string,
    patch: Partial<FlexContainerConfig>,
  ) => void;
  updateContainerGridConfig: (
    id: string,
    patch: Partial<GridContainerConfig>,
  ) => void;
  addComponentToContainer: (containerId: string, comp: ComponentItem) => void;
  removeComponentFromContainer: (
    containerId: string,
    componentId: string,
  ) => void;
  reorderContainerComponents: (
    containerId: string,
    components: ComponentItem[],
  ) => void;
  updateComponentInContainer: (
    containerId: string,
    componentId: string,
    patch: Record<string, unknown>,
  ) => void;
  reorderContainers: (containers: DesignerContainer[]) => void;
  setSelectedComponent: (ref: SelectedComponentRef) => void;

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
  sectionData: {},
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
  containers: defaultContainers,
  selectedComponent: null,

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
        productGrid: { ...state.config.productGrid, columns },
      },
    }));
    get().addAuditEntry({
      method: "productGrid/setColumns",
      params: { columns },
    });
  },

  updateProductGrid: (patch) => {
    set((state) => ({
      config: {
        ...state.config,
        productGrid: { ...state.config.productGrid, ...patch },
      },
    }));
    get().addAuditEntry({
      method: "productGrid/update",
      params: { changes: patch },
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

  enableSection: (type) => {
    set((state) => {
      const exists = state.config.sections.find((s) => s.id === type);
      if (exists) {
        return {
          config: {
            ...state.config,
            sections: state.config.sections.map((s) =>
              s.id === type ? { ...s, enabled: true } : s,
            ),
          },
        };
      }
      const maxOrder = Math.max(
        ...state.config.sections.map((s) => s.order),
        -1,
      );
      return {
        config: {
          ...state.config,
          sections: [
            ...state.config.sections,
            { id: type, type, enabled: true, order: maxOrder + 1 },
          ],
        },
      };
    });
    get().addAuditEntry({ method: "layout/enableSection", params: { type } });
  },

  disableSection: (type) => {
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((s) =>
          s.id === type ? { ...s, enabled: false } : s,
        ),
      },
    }));
    get().addAuditEntry({ method: "layout/disableSection", params: { type } });
  },

  updateSectionData: (data) => {
    set((state) => ({
      config: {
        ...state.config,
        sectionData: { ...state.config.sectionData, ...data },
      },
    }));
    get().addAuditEntry({
      method: "sectionData/update",
      params: { keys: Object.keys(data) },
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

  // ─── Designer container actions ───────────────────────────────────────────

  setSelectedComponent: (ref) => set({ selectedComponent: ref }),

  addContainer: () => {
    const id = `c-${crypto.randomUUID().slice(0, 8)}`;
    const n = get().containers.length + 1;
    const newContainer: DesignerContainer = {
      id,
      label: `Container ${n}`,
      layoutMode: "block",
      flexConfig: { ...DEFAULT_FLEX_CONFIG },
      gridConfig: { ...DEFAULT_GRID_CONFIG },
      components: [],
    };
    set((state) => {
      const containers = [...state.containers, newContainer];
      return {
        containers,
        config: {
          ...state.config,
          sections: syncSectionsFromContainers(containers),
        },
      };
    });
  },

  removeContainer: (id) => {
    set((state) => {
      const containers = state.containers.filter((c) => c.id !== id);
      return {
        containers,
        selectedComponent:
          state.selectedComponent?.containerId === id
            ? null
            : state.selectedComponent,
        config: {
          ...state.config,
          sections: syncSectionsFromContainers(containers),
        },
      };
    });
  },

  updateContainerLabel: (id, label) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === id ? { ...c, label } : c,
      ),
    }));
  },

  updateContainerLayoutMode: (id, mode) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === id ? { ...c, layoutMode: mode } : c,
      ),
    }));
  },

  updateContainerFlexConfig: (id, patch) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === id ? { ...c, flexConfig: { ...c.flexConfig, ...patch } } : c,
      ),
    }));
  },

  updateContainerGridConfig: (id, patch) => {
    set((state) => ({
      containers: state.containers.map((c) =>
        c.id === id ? { ...c, gridConfig: { ...c.gridConfig, ...patch } } : c,
      ),
    }));
  },

  addComponentToContainer: (containerId, comp) => {
    set((state) => {
      const containers = state.containers.map((c) =>
        c.id === containerId
          ? { ...c, components: [...c.components, comp] }
          : c,
      );
      return {
        containers,
        config: {
          ...state.config,
          sections: syncSectionsFromContainers(containers),
        },
      };
    });
  },

  removeComponentFromContainer: (containerId, componentId) => {
    set((state) => {
      const containers = state.containers.map((c) =>
        c.id === containerId
          ? {
              ...c,
              components: c.components.filter(
                (comp) => comp.id !== componentId,
              ),
            }
          : c,
      );
      return {
        containers,
        selectedComponent:
          state.selectedComponent?.containerId === containerId &&
          state.selectedComponent.componentId === componentId
            ? null
            : state.selectedComponent,
        config: {
          ...state.config,
          sections: syncSectionsFromContainers(containers),
        },
      };
    });
  },

  reorderContainerComponents: (containerId, components) => {
    set((state) => {
      const containers = state.containers.map((c) =>
        c.id === containerId ? { ...c, components } : c,
      );
      return {
        containers,
        config: {
          ...state.config,
          sections: syncSectionsFromContainers(containers),
        },
      };
    });
  },

  updateComponentInContainer: (containerId, componentId, patch) => {
    set((state) => {
      const containers = state.containers.map((c) => {
        if (c.id === containerId) {
          // Direct parent is a top-level container
          return {
            ...c,
            components: c.components.map((comp) =>
              comp.id === componentId
                ? ({ ...comp, ...patch } as ComponentItem)
                : comp,
            ),
          };
        }
        // Search inside nested containers
        return {
          ...c,
          components: patchItemInTree(
            c.components,
            containerId,
            componentId,
            patch,
          ),
        };
      });
      return {
        containers,
        config: {
          ...state.config,
          sections: syncSectionsFromContainers(containers),
        },
      };
    });
  },

  reorderContainers: (containers) => {
    set((state) => ({
      containers,
      config: {
        ...state.config,
        sections: syncSectionsFromContainers(containers),
      },
    }));
  },
}));

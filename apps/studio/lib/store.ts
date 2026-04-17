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
  NavConfig,
  NavLink,
  PageType,
  ProductsPageConfig,
  ProductDetailPageConfig,
  CartPageConfig,
  CartItem,
  CategoriesConfig,
  FooterConfig,
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
import { patchItemInTree, syncSectionsFromContainers } from "@/lib/store/container-helpers";
import { defaultConfig, defaultNavConfig, defaultPageContainers } from "@/lib/store/defaults";
import { loadHistory, loadHistoryIndex, MAX_HISTORY, saveHistory } from "@/lib/store/history";

interface StudioState {
  // Storefront Configuration
  config: StorefrontConfig;

  // Current page being edited (string so custom page IDs like "custom-abc" work)
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Custom pages
  customPages: Array<{ id: string; name: string; slug: string }>;
  addCustomPage: () => void;
  removeCustomPage: (id: string) => void;
  updateCustomPage: (
    id: string,
    patch: { name?: string; slug?: string },
  ) => void;

  // Nav config
  updateNavBrandName: (name: string) => void;
  addNavLink: () => void;
  updateNavLink: (id: string, patch: Partial<NavLink>) => void;
  removeNavLink: (id: string) => void;
  reorderNavLinks: (links: NavLink[]) => void;
  updateNavStyle: (
    patch: Pick<NavConfig, "backgroundColor" | "textColor" | "fontSize">,
  ) => void;

  // Cart (for AI preview)
  cartItems: CartItem[];
  addCartItem: (item: CartItem) => void;
  removeCartItem: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;

  // Pages config
  updateProductsPageConfig: (patch: Partial<ProductsPageConfig>) => void;
  updateProductDetailPageConfig: (
    patch: Partial<ProductDetailPageConfig>,
  ) => void;
  updateCartPageConfig: (patch: Partial<CartPageConfig>) => void;

  // Component-level style configs
  updateCategoriesConfig: (patch: Partial<CategoriesConfig>) => void;
  updateFooterConfig: (patch: Partial<FooterConfig>) => void;

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

  // Designer Containers (per-page)
  pageContainers: Record<string, DesignerContainer[]>;
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

  // Config history (undo/redo)
  configHistory: StorefrontConfig[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  /** Push current config onto the history stack (called automatically by pushingSet) */
  _pushHistory: (prev: StorefrontConfig) => void;
  undo: () => void;
  redo: () => void;

  // Thinking stream
  thinkingText: string;
  appendThinkingText: (chunk: string) => void;
  clearThinkingText: () => void;

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


export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial State
  config: defaultConfig,
  viewport: "desktop",
  agentStep: "idle",
  agentPlan: null,
  configHistory: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  thinkingText: "",
  auditLog: [],
  visionUrl: "",
  activeSkills: ["ui_extractor", "theme_generator", "layout_planner"],
  loadedSkills: [],
  orchestratorGoal: null,
  orchestratorContext: null,
  appliedSummary: null,
  pageContainers: defaultPageContainers,
  selectedComponent: null,
  currentPage: "home",
  customPages: [],
  cartItems: [],

  // Current page
  setCurrentPage: (currentPage) => set({ currentPage }),

  // Custom pages
  addCustomPage: () => {
    const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
    const n = get().customPages.length + 1;
    const name = `Page ${n}`;
    const slug = `/page-${n}`;
    set((state) => ({
      customPages: [...state.customPages, { id, name, slug }],
      pageContainers: { ...state.pageContainers, [id]: [] },
      currentPage: id,
    }));
  },
  removeCustomPage: (id) => {
    set((state) => {
      const { [id]: _removed, ...rest } = state.pageContainers;
      return {
        customPages: state.customPages.filter((p) => p.id !== id),
        pageContainers: rest,
        currentPage: state.currentPage === id ? "home" : state.currentPage,
      };
    });
  },
  updateCustomPage: (id, patch) => {
    set((state) => ({
      customPages: state.customPages.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    }));
  },

  // Nav config
  updateNavBrandName: (brandName) => {
    set((state) => ({
      config: { ...state.config, nav: { ...state.config.nav!, brandName } },
    }));
  },
  addNavLink: () => {
    const id = `nav-${crypto.randomUUID().slice(0, 8)}`;
    set((state) => ({
      config: {
        ...state.config,
        nav: {
          ...state.config.nav!,
          links: [
            ...state.config.nav!.links,
            { id, label: "New Link", href: "/" },
          ],
        },
      },
    }));
  },
  updateNavLink: (id, patch) => {
    set((state) => ({
      config: {
        ...state.config,
        nav: {
          ...state.config.nav!,
          links: state.config.nav!.links.map((l) =>
            l.id === id ? { ...l, ...patch } : l,
          ),
        },
      },
    }));
  },
  removeNavLink: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        nav: {
          ...state.config.nav!,
          links: state.config.nav!.links.filter((l) => l.id !== id),
        },
      },
    }));
  },
  reorderNavLinks: (links) => {
    set((state) => ({
      config: { ...state.config, nav: { ...state.config.nav!, links } },
    }));
  },
  updateNavStyle: (patch) => {
    set((state) => ({
      config: { ...state.config, nav: { ...state.config.nav!, ...patch } },
    }));
  },

  // Cart
  addCartItem: (item) => {
    set((state) => {
      const exists = state.cartItems.find(
        (i) => i.productId === item.productId,
      );
      if (exists) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { cartItems: [...state.cartItems, item] };
    });
  },
  removeCartItem: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.productId !== productId),
    }));
  },
  updateCartQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeCartItem(productId);
      return;
    }
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.productId === productId ? { ...i, qty } : i,
      ),
    }));
  },

  // Pages config
  updateProductsPageConfig: (patch) => {
    set((state) => ({
      config: {
        ...state.config,
        pages: {
          ...state.config.pages,
          products: {
            columns: 3,
            showFilters: true,
            heading: "All Products",
            ...state.config.pages?.products,
            ...patch,
          },
        },
      },
    }));
  },
  updateProductDetailPageConfig: (patch) => {
    set((state) => ({
      config: {
        ...state.config,
        pages: {
          ...state.config.pages,
          productDetail: {
            showReviews: true,
            showRelated: true,
            ...state.config.pages?.productDetail,
            ...patch,
          },
        },
      },
    }));
  },
  updateCartPageConfig: (patch) => {
    set((state) => ({
      config: {
        ...state.config,
        pages: {
          ...state.config.pages,
          cart: {
            emptyMessage: "Your cart is empty.",
            checkoutButtonText: "Checkout",
            ...state.config.pages?.cart,
            ...patch,
          },
        },
      },
    }));
  },

  // Component-level style configs
  updateCategoriesConfig: (patch) => {
    set((state) => ({
      config: {
        ...state.config,
        categories: { ...state.config.categories, ...patch },
      },
    }));
  },
  updateFooterConfig: (patch) => {
    set((state) => ({
      config: { ...state.config, footer: { ...state.config.footer, ...patch } },
    }));
  },

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

  appendThinkingText: (chunk) =>
    set((state) => ({ thinkingText: state.thinkingText + chunk })),
  clearThinkingText: () => set({ thinkingText: "" }),

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

  // Config history (undo/redo)
  _pushHistory: (prev) => {
    set((state) => {
      // Truncate any redo future when a new change is made
      const base = state.configHistory.slice(0, state.historyIndex + 1);
      const next = [...base, prev].slice(-MAX_HISTORY);
      const idx = next.length - 1;
      saveHistory(next, idx);
      return {
        configHistory: next,
        historyIndex: idx,
        canUndo: idx >= 0,
        canRedo: false,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex < 0) return {};
      const updated = [...state.configHistory];
      updated[state.historyIndex + 1] = state.config;
      const restoredConfig = state.configHistory[state.historyIndex];
      const newIndex = state.historyIndex - 1;
      saveHistory(updated, newIndex);
      return {
        configHistory: updated,
        config: restoredConfig,
        historyIndex: newIndex,
        canUndo: newIndex >= 0,
        canRedo: true,
      };
    });
  },

  redo: () => {
    set((state) => {
      const redoIdx = state.historyIndex + 2;
      if (redoIdx >= state.configHistory.length) return {};
      const restoredConfig = state.configHistory[redoIdx];
      const newIndex = redoIdx - 1;
      saveHistory(state.configHistory, newIndex);
      return {
        config: restoredConfig,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex + 2 < state.configHistory.length,
      };
    });
  },

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
    const page = get().currentPage;
    const id = `c-${crypto.randomUUID().slice(0, 8)}`;
    const currentContainers = get().pageContainers[page] ?? [];
    const n = currentContainers.length + 1;
    const newContainer: DesignerContainer = {
      id,
      label: `Container ${n}`,
      layoutMode: "block",
      flexConfig: { ...DEFAULT_FLEX_CONFIG },
      gridConfig: { ...DEFAULT_GRID_CONFIG },
      components: [],
    };
    set((state) => {
      const newContainers = [
        ...(state.pageContainers[page] ?? []),
        newContainer,
      ];
      const pageContainers = { ...state.pageContainers, [page]: newContainers };
      return {
        pageContainers,
        ...(page === "home"
          ? {
              config: {
                ...state.config,
                sections: syncSectionsFromContainers(newContainers),
              },
            }
          : {}),
      };
    });
  },

  removeContainer: (id) => {
    const page = get().currentPage;
    set((state) => {
      const newContainers = (state.pageContainers[page] ?? []).filter(
        (c) => c.id !== id,
      );
      const pageContainers = { ...state.pageContainers, [page]: newContainers };
      return {
        pageContainers,
        selectedComponent:
          state.selectedComponent?.containerId === id
            ? null
            : state.selectedComponent,
        ...(page === "home"
          ? {
              config: {
                ...state.config,
                sections: syncSectionsFromContainers(newContainers),
              },
            }
          : {}),
      };
    });
  },

  updateContainerLabel: (id, label) => {
    const page = get().currentPage;
    set((state) => ({
      pageContainers: {
        ...state.pageContainers,
        [page]: (state.pageContainers[page] ?? []).map((c) =>
          c.id === id ? { ...c, label } : c,
        ),
      },
    }));
  },

  updateContainerLayoutMode: (id, mode) => {
    const page = get().currentPage;
    set((state) => ({
      pageContainers: {
        ...state.pageContainers,
        [page]: (state.pageContainers[page] ?? []).map((c) =>
          c.id === id ? { ...c, layoutMode: mode } : c,
        ),
      },
    }));
  },

  updateContainerFlexConfig: (id, patch) => {
    const page = get().currentPage;
    set((state) => ({
      pageContainers: {
        ...state.pageContainers,
        [page]: (state.pageContainers[page] ?? []).map((c) =>
          c.id === id ? { ...c, flexConfig: { ...c.flexConfig, ...patch } } : c,
        ),
      },
    }));
  },

  updateContainerGridConfig: (id, patch) => {
    const page = get().currentPage;
    set((state) => ({
      pageContainers: {
        ...state.pageContainers,
        [page]: (state.pageContainers[page] ?? []).map((c) =>
          c.id === id ? { ...c, gridConfig: { ...c.gridConfig, ...patch } } : c,
        ),
      },
    }));
  },

  addComponentToContainer: (containerId, comp) => {
    const page = get().currentPage;
    set((state) => {
      const newContainers = (state.pageContainers[page] ?? []).map((c) =>
        c.id === containerId
          ? { ...c, components: [...c.components, comp] }
          : c,
      );
      const pageContainers = { ...state.pageContainers, [page]: newContainers };
      return {
        pageContainers,
        ...(page === "home"
          ? {
              config: {
                ...state.config,
                sections: syncSectionsFromContainers(newContainers),
              },
            }
          : {}),
      };
    });
  },

  removeComponentFromContainer: (containerId, componentId) => {
    const page = get().currentPage;
    set((state) => {
      const newContainers = (state.pageContainers[page] ?? []).map((c) =>
        c.id === containerId
          ? {
              ...c,
              components: c.components.filter(
                (comp) => comp.id !== componentId,
              ),
            }
          : c,
      );
      const pageContainers = { ...state.pageContainers, [page]: newContainers };
      return {
        pageContainers,
        selectedComponent:
          state.selectedComponent?.containerId === containerId &&
          state.selectedComponent.componentId === componentId
            ? null
            : state.selectedComponent,
        ...(page === "home"
          ? {
              config: {
                ...state.config,
                sections: syncSectionsFromContainers(newContainers),
              },
            }
          : {}),
      };
    });
  },

  reorderContainerComponents: (containerId, components) => {
    const page = get().currentPage;
    set((state) => {
      const newContainers = (state.pageContainers[page] ?? []).map((c) =>
        c.id === containerId ? { ...c, components } : c,
      );
      const pageContainers = { ...state.pageContainers, [page]: newContainers };
      return {
        pageContainers,
        ...(page === "home"
          ? {
              config: {
                ...state.config,
                sections: syncSectionsFromContainers(newContainers),
              },
            }
          : {}),
      };
    });
  },

  updateComponentInContainer: (containerId, componentId, patch) => {
    const page = get().currentPage;
    set((state) => {
      const newContainers = (state.pageContainers[page] ?? []).map((c) => {
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
      const pageContainers = { ...state.pageContainers, [page]: newContainers };
      return {
        pageContainers,
        ...(page === "home"
          ? {
              config: {
                ...state.config,
                sections: syncSectionsFromContainers(newContainers),
              },
            }
          : {}),
      };
    });
  },

  reorderContainers: (containers) => {
    const page = get().currentPage;
    set((state) => ({
      pageContainers: { ...state.pageContainers, [page]: containers },
      ...(page === "home"
        ? {
            config: {
              ...state.config,
              sections: syncSectionsFromContainers(containers),
            },
          }
        : {}),
    }));
  },
}));

// ─── Config change watcher (undo/redo history) ────────────────────────────────
// Subscribe to config changes and push the previous value onto the history stack.
// Debounced 1 s so rapid edits (e.g. typing in a text field) are collapsed into
// one history entry rather than one per keystroke.
// Undo/redo themselves also update `config` — those are skipped by checking
// whether historyIndex changed in the same tick.
{
  let _prev: StorefrontConfig = useStudioStore.getState().config;
  // `_debounceBase` is the config snapshot taken at the START of a burst —
  // we push that as the undo point so undoing restores the pre-burst state.
  let _debounceBase: StorefrontConfig = _prev;
  let _timer: ReturnType<typeof setTimeout> | null = null;

  // Restore history from localStorage on first load
  const savedHistory = loadHistory();
  const savedIndex = loadHistoryIndex();
  if (savedHistory.length > 0) {
    useStudioStore.setState({
      configHistory: savedHistory,
      historyIndex: savedIndex,
      canUndo: savedIndex >= 0,
      canRedo: savedIndex + 1 < savedHistory.length,
    });
  }

  useStudioStore.subscribe((state, prevState) => {
    if (state.config === prevState.config) return; // nothing changed
    // undo/redo update config directly — skip (historyIndex changes in same tick)
    if (state.historyIndex !== prevState.historyIndex) {
      _prev = state.config;
      _debounceBase = state.config;
      if (_timer) {
        clearTimeout(_timer);
        _timer = null;
      }
      return;
    }

    _prev = state.config;

    // Start (or restart) the debounce timer
    if (!_timer) {
      // First change in this burst — lock in the snapshot to push
      _debounceBase = prevState.config;
    } else {
      clearTimeout(_timer);
    }

    _timer = setTimeout(() => {
      _timer = null;
      useStudioStore.getState()._pushHistory(_debounceBase);
      _debounceBase = useStudioStore.getState().config;
    }, 1000);
  });
}

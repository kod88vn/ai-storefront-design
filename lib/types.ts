// Storefront Configuration Types
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: "none" | "md" | "full";
}

export interface LayoutSection {
  id: string;
  type: "hero" | "product-grid" | "categories" | "footer";
  enabled: boolean;
  order: number;
}

export interface HeroConfig {
  layout: "split" | "centered" | "minimal";
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface ProductGridConfig {
  columns: 2 | 3 | 4;
}

export interface StorefrontConfig {
  theme: ThemeConfig;
  sections: LayoutSection[];
  hero: HeroConfig;
  productGrid: ProductGridConfig;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Agentic System Types
export type AgentStep =
  | "idle"
  | "thinking"
  | "decomposing"
  | "executing"
  | "updating"
  | "awaiting-approval"
  | "complete";

export interface AgentPlan {
  id: string;
  description: string;
  layoutProposal: string;
  colorProposal: string;
  approved: boolean | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  method: string;
  params: Record<string, unknown>;
  result?: unknown;
}

export interface LoadedSkill {
  name: string;
  content: string;
}

export type Viewport = "desktop" | "tablet" | "mobile";

export const viewportWidths: Record<Viewport, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

// ─── Orchestrator / SSE ──────────────────────────────────────────────────────

export interface PlanFeedback {
  approved: boolean;
  modifications?: string;
  /** Re-injected on stateless resume so the AI remembers what it proposed */
  previousPlan?: {
    description: string;
    layoutProposal: string;
    colorProposal: string;
  };
}

export interface OrchestratorContext {
  visionUrl?: string;
  imageData?: string | null;
  currentConfig: StorefrontConfig;
  planFeedback?: PlanFeedback | null;
}

export interface OrchestratorConfigUpdate {
  themeChanges?: Partial<ThemeConfig>;
  heroChanges?: Partial<HeroConfig>;
  productGridColumns?: 2 | 3 | 4;
  sectionOrder?: string[];
}

export type OrchestratorEventType =
  | "progress"
  | "audit"
  | "plan_description"
  | "config_update"
  | "complete"
  | "error";

export interface OrchestratorEvent {
  type: OrchestratorEventType;
  /** Optional: drives the execution trace progress indicator in the UI */
  agentStep?: AgentStep;
  message?: string;
  entry?: Omit<AuditLogEntry, "id" | "timestamp">;
  plan?: Omit<AgentPlan, "approved">;
  configUpdate?: OrchestratorConfigUpdate;
  error?: string;
}

export interface AppliedSummary {
  sourceUrl: string | null;
  planDescription: string | null;
  themeChanges: Partial<ThemeConfig> | null;
  heroChanges: Partial<HeroConfig> | null;
  productGridColumns: 2 | 3 | 4 | null;
  sectionOrder: string[] | null;
}

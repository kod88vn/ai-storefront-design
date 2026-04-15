import type {
  HeroLayout,
  SectionType,
  NavStyle,
  ColorScheme,
  FontStyle,
  BorderRadius,
} from "@ai-storefront/types";
export type { SectionType };

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: BorderRadius;
  fontFamily?: "sans" | "serif" | "mono";
  navStyle?: NavStyle;
  colorScheme?: ColorScheme;
  fontStyle?: FontStyle;
}

// ─── Section types ────────────────────────────────────────────────────────────

export interface LayoutSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroConfig {
  layout: HeroLayout;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
}

// ─── Product grid ─────────────────────────────────────────────────────────────

export interface ProductGridConfig {
  columns: 2 | 3 | 4;
  showRatings?: boolean;
  showBadges?: boolean;
}

// ─── New section data types ───────────────────────────────────────────────────

export interface AnnouncementBarConfig {
  text: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
  dismissible?: boolean;
}

export interface BenefitItem {
  icon: "truck" | "shield" | "refresh" | "award" | "clock" | "leaf";
  label: string;
  detail?: string;
}

export interface BenefitsBarConfig {
  items: BenefitItem[];
}

export interface FeaturedCollectionConfig {
  heading: string;
  subheading?: string;
  layout: "grid" | "horizontal-scroll";
  productIds?: string[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialsConfig {
  heading: string;
  layout: "grid" | "carousel";
  items: TestimonialItem[];
}

export interface NewsletterConfig {
  heading: string;
  subtext: string;
  placeholder?: string;
  buttonText: string;
  backgroundColor?: string;
}

export type TrustIcon =
  | "truck"
  | "shield"
  | "refresh"
  | "award"
  | "lock"
  | "phone";

export interface TrustBadgeItem {
  icon: TrustIcon;
  label: string;
  detail?: string;
}

export interface TrustBadgesConfig {
  items: TrustBadgeItem[];
}

export interface BrandStripConfig {
  heading?: string;
  brands: Array<{ name: string; logoText?: string }>;
}

// ─── Master section data map ──────────────────────────────────────────────────

export interface StorefrontSectionData {
  "announcement-bar"?: AnnouncementBarConfig;
  "benefits-bar"?: BenefitsBarConfig;
  "featured-collection"?: FeaturedCollectionConfig;
  testimonials?: TestimonialsConfig;
  newsletter?: NewsletterConfig;
  "trust-badges"?: TrustBadgesConfig;
  "brand-strip"?: BrandStripConfig;
}

// ─── Storefront config ────────────────────────────────────────────────────────

export interface StorefrontConfig {
  theme: ThemeConfig;
  sections: LayoutSection[];
  hero: HeroConfig;
  productGrid: ProductGridConfig;
  sectionData: StorefrontSectionData;
}

// ─── Product / category ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
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

export interface PlanChange {
  id: string;
  category: "theme" | "hero" | "layout" | "sections" | "content";
  label: string;
  description: string;
}

export interface AgentPlan {
  id: string;
  description: string;
  layoutProposal: string;
  colorProposal: string;
  navStyleProposal?: string;
  colorSchemeProposal?: string;
  plannedChanges?: PlanChange[];
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

export type PageType =
  | "home"
  | "products"
  | "product-detail"
  | "cart"
  | "custom";

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
    navStyleProposal?: string;
    colorSchemeProposal?: string;
  };
}

export interface UploadedImageTokens {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  sectionBackgroundColor?: string;
  colorScheme?: ColorScheme;
  dominantStyle?: import("@ai-storefront/types").DominantStyle;
  fontStyle?: FontStyle;
  navStyle?: NavStyle;
  borderRadius?: BorderRadius;
  heroLayout?: HeroLayout;
  productGridColumns?: 2 | 3 | 4;
  mood?: string;
  observations?: string;
}

export interface OrchestratorContext {
  visionUrl?: string;
  imageData?: string | null;
  uploadedImageTokens?: UploadedImageTokens | null;
  currentConfig: StorefrontConfig;
  planFeedback?: PlanFeedback | null;
  page?: PageType;
}

export interface ComponentStyleOverride {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: "sm" | "base" | "lg" | "xl";
}

export interface OrchestratorConfigUpdate {
  themeChanges?: Partial<ThemeConfig>;
  heroChanges?: Partial<HeroConfig>;
  productGridColumns?: 2 | 3 | 4;
  sectionOrder?: string[];
  enableSections?: SectionType[];
  disableSections?: SectionType[];
  sectionData?: Partial<StorefrontSectionData>;
  componentStyleChanges?: {
    navbar?: ComponentStyleOverride;
    hero?: ComponentStyleOverride;
    productGrid?: ComponentStyleOverride;
    categories?: ComponentStyleOverride;
    footer?: ComponentStyleOverride;
  };
}

export type OrchestratorEventType =
  | "progress"
  | "audit"
  | "plan_description"
  | "config_update"
  | "thinking"
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
  /** Streamed reasoning/text chunk from the model */
  thinking?: string;
  error?: string;
}

// ─── Before/after value comparison ─────────────────────────────────────────────────

export interface ValueChange<T> {
  before: T;
  after: T;
}

export interface AppliedSummary {
  sourceUrl: string | null;
  planDescription: string | null;
  theme: {
    primaryColor?: ValueChange<string>;
    secondaryColor?: ValueChange<string>;
    borderRadius?: ValueChange<string>;
  } | null;
  hero: {
    layout?: ValueChange<string>;
    title?: ValueChange<string>;
    subtitle?: ValueChange<string>;
  } | null;
  productGridColumns: ValueChange<number> | null;
  sectionOrder: ValueChange<string[]> | null;
  sectionsEnabled: ValueChange<string[]> | null;
}

// ─── Designer container types ─────────────────────────────────────────────────

export type ContainerLayoutMode = "block" | "flex" | "grid";

export interface FlexContainerConfig {
  direction: "row" | "column";
  wrap: boolean;
  justify: "start" | "center" | "end" | "between" | "around" | "evenly";
  align: "start" | "center" | "end" | "stretch" | "baseline";
  gap: number;
}

export interface GridContainerConfig {
  cols: number;
  gap: number;
}

export const DEFAULT_FLEX_CONFIG: FlexContainerConfig = {
  direction: "row",
  wrap: false,
  justify: "start",
  align: "start",
  gap: 4,
};

export const DEFAULT_GRID_CONFIG: GridContainerConfig = {
  cols: 2,
  gap: 4,
};

export type ComponentItem =
  | {
      kind: "prebuilt";
      id: string;
      sectionType: SectionType;
      customClasses: string;
    }
  | { kind: "custom-text"; id: string; html: string; customClasses: string }
  | {
      kind: "custom-image";
      id: string;
      src: string;
      alt: string;
      width: string;
      height: string;
      objectFit: "cover" | "contain" | "fill" | "auto";
      customClasses: string;
    }
  | {
      kind: "container";
      id: string;
      label: string;
      layoutMode: ContainerLayoutMode;
      flexConfig: FlexContainerConfig;
      gridConfig: GridContainerConfig;
      components: ComponentItem[];
      customClasses: string;
    };

export interface DesignerContainer {
  id: string;
  label: string;
  layoutMode: ContainerLayoutMode;
  flexConfig: FlexContainerConfig;
  gridConfig: GridContainerConfig;
  components: ComponentItem[];
}

export type SelectedComponentRef = {
  containerId: string;
  componentId: string;
} | null;

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: "none" | "md" | "full";
  fontFamily?: "sans" | "serif" | "mono";
}

// ─── Section types ────────────────────────────────────────────────────────────

export type SectionType =
  | "hero"
  | "product-grid"
  | "categories"
  | "footer"
  | "announcement-bar"
  | "benefits-bar"
  | "featured-collection"
  | "testimonials"
  | "newsletter"
  | "trust-badges"
  | "brand-strip";

export interface LayoutSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroConfig {
  layout: "split" | "centered" | "minimal" | "fullbleed";
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
  enableSections?: SectionType[];
  disableSections?: SectionType[];
  sectionData?: Partial<StorefrontSectionData>;
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

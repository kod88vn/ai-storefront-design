// ─── Theme ────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full";
  fontFamily?: "sans" | "serif" | "mono";
  /** Visual weight of navbar: white+border (default), transparent overlay, or solid brand color */
  navStyle?: "bordered" | "transparent" | "filled";
  /** Overall site color scheme — affects base background and text colors */
  colorScheme?: "light" | "dark";
  /**
   * Font personality applied as a font-family to the storefront preview wrapper.
   * modern-sans     → system-ui clean sans
   * geometric-sans  → Century Gothic / Futura style
   * humanist-sans   → Gill Sans / Optima style
   * editorial-serif → Georgia classic serif
   * display-serif   → Palatino dramatic serif
   * slab-serif      → Rockwell bold slab
   * mono-tech       → Courier New monospace
   * handwritten     → cursive script
   * condensed       → Arial Narrow / Impact compressed
   * rounded         → Varela Round friendly rounded
   */
  fontStyle?:
    | "modern-sans"
    | "geometric-sans"
    | "humanist-sans"
    | "editorial-serif"
    | "display-serif"
    | "slab-serif"
    | "mono-tech"
    | "handwritten"
    | "condensed"
    | "rounded";
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
  layout: "split" | "centered" | "minimal" | "fullbleed" | "editorial";
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundImage?: string;
  /** Eyebrow label above the headline — e.g. "New Collection" or "Free Shipping Over $50" */
  badge?: string;
  /** Text alignment inside split/centered/editorial layouts */
  textAlign?: "left" | "center";
  /** Overlay darkness for fullbleed (0–1, default 0.4) */
  overlayOpacity?: number;
  /** CTA button style — solid fills with secondaryColor, outline/ghost for dark or image backgrounds */
  ctaVariant?: "solid" | "outline" | "ghost";
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
  /** Marquee-style scrolling text for promotional animation */
  scrolling?: boolean;
  /** Optional emoji prefix shown before the text */
  emoji?: string;
}

export interface BenefitItem {
  icon:
    | "truck"
    | "shield"
    | "refresh"
    | "award"
    | "clock"
    | "leaf"
    | "star"
    | "heart"
    | "check"
    | "zap"
    | "globe"
    | "tag";
  label: string;
  detail?: string;
}

export interface BenefitsBarConfig {
  items: BenefitItem[];
  backgroundColor?: string;
  textColor?: string;
}

export interface FeaturedCollectionConfig {
  heading: string;
  subheading?: string;
  layout: "grid" | "horizontal-scroll";
  productIds?: string[];
  backgroundColor?: string;
  textColor?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialsConfig {
  heading: string;
  /** grid = 3-col cards, list = full-width quotes, featured = one large quote + smaller grid */
  layout: "grid" | "carousel" | "list" | "featured";
  items: TestimonialItem[];
  showRatings?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface NewsletterConfig {
  heading: string;
  subtext: string;
  placeholder?: string;
  buttonText: string;
  backgroundColor?: string;
  textColor?: string;
  /** Incentive hook shown above headline — e.g. "Get 10% off your first order" */
  incentive?: string;
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
  backgroundColor?: string;
  textColor?: string;
}

export interface BrandStripConfig {
  heading?: string;
  brands: Array<{ name: string; logoText?: string }>;
  backgroundColor?: string;
  textColor?: string;
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

// ─── Product / category ───────────────────────────────────────────────────────

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

// ─── Agent/orchestration ──────────────────────────────────────────────────────

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
  approved: boolean | null;
  plannedChanges?: PlanChange[];
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
  userSuggestion?: string;
  previousPlan?: {
    description: string;
    layoutProposal: string;
    colorProposal: string;
    navStyleProposal?: string;
    colorSchemeProposal?: string;
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
  agentStep?: AgentStep;
  message?: string;
  entry?: Omit<AuditLogEntry, "id" | "timestamp">;
  plan?: Omit<AgentPlan, "approved">;
  configUpdate?: OrchestratorConfigUpdate;
  error?: string;
}

// ─── Applied summary (shown after flow completes) ─────────────────────────────

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
    fontStyle?: ValueChange<string>;
    navStyle?: ValueChange<string>;
    colorScheme?: ValueChange<string>;
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

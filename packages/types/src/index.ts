import type {
  HeroLayout,
  HeroCtaVariant,
  BorderRadius,
  NavStyle,
  ColorScheme,
  FontStyle,
  SectionType,
  FontSize,
  BenefitIconType,
  CollectionLayout,
  TestimonialLayout,
  ProductGridLayout,
  DominantStyle,
} from "./schema";
export * from "./schema";

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: BorderRadius;
  fontFamily?: "sans" | "serif" | "mono";
  /** Visual weight of navbar: white+border (default), transparent overlay, or solid brand color */
  navStyle?: NavStyle;
  /** Overall site color scheme — affects base background and text colors */
  colorScheme?: ColorScheme;
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
  fontStyle?: FontStyle;
}

// ─── Section types ────────────────────────────────────────────────────────────

export type { SectionType };

export interface LayoutSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
}

// ─── Shared component style overrides ────────────────────────────────────────

/** Per-component style overrides that take precedence over theme defaults */
export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  /** Scales the section's body text: sm=0.75rem, base=1rem, lg=1.125rem, xl=1.25rem */
  fontSize?: FontSize;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroConfig {
  layout: HeroLayout;
  title: string;
  subtitle: string;
  ctaText: string;
  /** Destination for the primary CTA, e.g. /products or /collections */
  ctaHref?: string;
  ctaSecondaryText?: string;
  /** Destination for the secondary CTA */
  ctaSecondaryHref?: string;
  backgroundImage?: string;
  /** Eyebrow label above the headline — e.g. "New Collection" or "Free Shipping Over $50" */
  badge?: string;
  /** Text alignment inside split/centered/editorial layouts */
  textAlign?: "left" | "center";
  /** Overlay darkness for editorial layout heroes (0–1, default 0.4) */
  overlayOpacity?: number;
  /** CTA button style — solid fills with secondaryColor, outline/ghost for dark or image backgrounds */
  ctaVariant?: HeroCtaVariant;
  /** Per-hero style overrides */
  backgroundColor?: string;
  textColor?: string;
  fontSize?: FontSize;
}

// ─── Product grid ─────────────────────────────────────────────────────────────

export interface ProductGridConfig {
  columns: 2 | 3 | 4;
  /** grid = card grid, list = stacked comparison-friendly rows */
  layout?: ProductGridLayout;
  showRatings?: boolean;
  showBadges?: boolean;
  /** Section heading text */
  heading?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: FontSize;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface CategoriesConfig extends ComponentStyle {
  heading?: string;
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export interface FooterConfig extends ComponentStyle {
  tagline?: string;
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
  icon: BenefitIconType;
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
  layout: CollectionLayout;
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
  layout: TestimonialLayout;
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
  nav?: NavConfig;
  pages?: Partial<PagesConfig>;
  categories?: CategoriesConfig;
  footer?: FooterConfig;
  customPages?: Array<{
    id: string;
    name: string;
    slug: string;
    sections?: LayoutSection[];
  }>;
  /** Sections for each core page, saved from the studio's designer containers */
  pagesSections?: Partial<
    Record<"products" | "product-detail" | "cart", LayoutSection[]>
  >;
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
  description?: string;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface NavConfig {
  brandName: string;
  links: NavLink[];
  backgroundColor?: string;
  textColor?: string;
  fontSize?: "sm" | "base" | "lg" | "xl";
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

// ─── Page types ───────────────────────────────────────────────────────────────

export type PageType =
  | "home"
  | "products"
  | "product-detail"
  | "cart"
  | "custom";

export interface ProductsPageConfig {
  heading: string;
  subheading?: string;
  columns: 2 | 3 | 4;
  showFilters: boolean;
}

export interface ProductDetailPageConfig {
  showReviews: boolean;
  showRelated: boolean;
}

export interface CartPageConfig {
  emptyMessage: string;
  checkoutButtonText: string;
}

export interface CustomPageConfig {
  slug: string;
  title: string;
  content: string;
}

export interface PagesConfig {
  products: ProductsPageConfig;
  productDetail: ProductDetailPageConfig;
  cart: CartPageConfig;
  custom: CustomPageConfig;
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

export interface UploadedImageTokens {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  sectionBackgroundColor?: string;
  colorScheme?: ColorScheme;
  dominantStyle?: DominantStyle;
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
  /** The page being edited — drives per-page orchestrator selection */
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
  productGridLayout?: ProductGridLayout;
  sectionOrder?: string[];
  enableSections?: SectionType[];
  disableSections?: SectionType[];
  sectionData?: Partial<StorefrontSectionData>;
  navChanges?: Partial<NavConfig>;
  productsPageChanges?: Partial<ProductsPageConfig>;
  cartPageChanges?: Partial<CartPageConfig>;
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
  agentStep?: AgentStep;
  message?: string;
  entry?: Omit<AuditLogEntry, "id" | "timestamp">;
  plan?: Omit<AgentPlan, "approved">;
  configUpdate?: OrchestratorConfigUpdate;
  /** Streamed reasoning/text chunk from the model */
  thinking?: string;
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

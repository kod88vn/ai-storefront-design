import type {
  BorderRadius,
  CategoriesConfig,
  ColorScheme,
  DominantStyle,
  FooterConfig,
  FontStyle,
  HeroConfig,
  HeroLayout,
  ImageryStyle,
  NavStyle,
  ProductGridConfig,
  ProductGridLayout,
  SectionType,
  StorefrontSectionData,
  ThemeConfig,
} from '@ai-storefront/types'

export const QUESTIONS = [
  {
    id: 'category',
    q: 'What type of store is this?',
    opts: ['Fashion & Apparel', 'Beauty & Skincare', 'Food & Beverage', 'Home & Living', 'Electronics & Tech', 'Jewelry & Accessories', 'Sports & Outdoor', 'Health & Wellness'],
  },
  {
    id: 'personality',
    q: "What's the brand personality?",
    opts: ['Luxury & High-end', 'Natural & Organic', 'Bold & Energetic', 'Clean & Minimal', 'Playful & Fun', 'Professional & Clinical'],
  },
  {
    id: 'mood',
    q: 'What visual mood fits best?',
    opts: ['Dark & Moody', 'Light & Airy', 'Warm & Earthy', 'Cool & Professional', 'Vibrant & Colorful', 'Classic & Timeless'],
  },
  {
    id: 'typography',
    q: 'How should the text feel?',
    opts: ['Modern & Sharp', 'Editorial & Refined', 'Friendly & Approachable', 'Technical & Precise', 'Creative & Expressive'],
  },
  {
    id: 'customer',
    q: "Who's your target customer?",
    opts: ['Young adults 18–30', 'Professionals 25–45', 'Luxury shoppers', 'Outdoor enthusiasts', 'Health-conscious buyers', 'Families'],
  },
  {
    id: 'focus',
    q: 'What should the design prioritize?',
    opts: ['Conversions & Sales', 'Brand storytelling', 'Product discovery', 'Trust & Credibility', 'Community & Lifestyle'],
  },
  {
    id: 'heroTreatment',
    q: 'Pick a hero direction',
    opts: ['Bold campaign split', 'Centered conversion hero', 'Editorial storytelling'],
  },
  {
    id: 'density',
    q: 'How dense should the page feel?',
    opts: ['Spacious premium', 'Balanced', 'Dense discovery'],
  },
  {
    id: 'merchandising',
    q: 'Which merchandising modules matter most?',
    opts: ['Social proof + trust', 'Promotions + urgency', 'Collections + editorial curation'],
  },
] as const

export type QuestionId = typeof QUESTIONS[number]['id']
export type Answers = Partial<Record<QuestionId, string>>

export interface WizardDirectives {
  heroLayout: HeroLayout
  dominantStyle: DominantStyle
  navStyle: NavStyle
  colorScheme: ColorScheme
  fontStyle: FontStyle
  borderRadius: BorderRadius
  productGridColumns: 2 | 3 | 4
  productGridLayout: ProductGridLayout
  ctaStyle: 'utility-first' | 'promotion-first' | 'brand-first' | 'editorial-soft'
  imageryStyle: ImageryStyle
  headlineTone: 'urgent' | 'functional' | 'premium' | 'editorial'
  sectionOrder: SectionType[]
  modules: SectionType[]
}

export interface AnalyticBaseline {
  goal: string
  directives: WizardDirectives
  theme: Partial<ThemeConfig>
  hero: Partial<HeroConfig>
  productGrid: Partial<ProductGridConfig>
  categories: Partial<CategoriesConfig>
  footer: Partial<FooterConfig>
  sectionOrder: SectionType[]
  sectionData: Partial<StorefrontSectionData>
  summary: {
    title: string
    bullets: string[]
  }
}

const PALETTES: Record<DominantStyle, Record<ColorScheme, Pick<ThemeConfig, 'primaryColor' | 'secondaryColor'>>> = {
  minimalist: {
    light: { primaryColor: '#1f2937', secondaryColor: '#94a3b8' },
    dark: { primaryColor: '#f8fafc', secondaryColor: '#64748b' },
  },
  maximalist: {
    light: { primaryColor: '#be185d', secondaryColor: '#f59e0b' },
    dark: { primaryColor: '#fbcfe8', secondaryColor: '#fb923c' },
  },
  editorial: {
    light: { primaryColor: '#1f2937', secondaryColor: '#b45309' },
    dark: { primaryColor: '#f5efe6', secondaryColor: '#d4a373' },
  },
  clean: {
    light: { primaryColor: '#0f172a', secondaryColor: '#14b8a6' },
    dark: { primaryColor: '#e2e8f0', secondaryColor: '#2dd4bf' },
  },
  'dark-luxury': {
    light: { primaryColor: '#201a17', secondaryColor: '#c9a84c' },
    dark: { primaryColor: '#f5efe6', secondaryColor: '#d4af37' },
  },
  organic: {
    light: { primaryColor: '#355e3b', secondaryColor: '#84cc16' },
    dark: { primaryColor: '#ecfccb', secondaryColor: '#65a30d' },
  },
  'bold-playful': {
    light: { primaryColor: '#7c3aed', secondaryColor: '#f97316' },
    dark: { primaryColor: '#ede9fe', secondaryColor: '#fb923c' },
  },
  earthy: {
    light: { primaryColor: '#78350f', secondaryColor: '#c2410c' },
    dark: { primaryColor: '#fde68a', secondaryColor: '#f59e0b' },
  },
  'mission-driven': {
    light: { primaryColor: '#14532d', secondaryColor: '#0ea5e9' },
    dark: { primaryColor: '#dcfce7', secondaryColor: '#38bdf8' },
  },
  'tech-precision': {
    light: { primaryColor: '#0f172a', secondaryColor: '#2563eb' },
    dark: { primaryColor: '#e2e8f0', secondaryColor: '#60a5fa' },
  },
}

function humanize(value: string) {
  return value.replace(/-/g, ' ')
}

function baseCategoryLabel(input?: string) {
  return (input ?? 'retail').replace(/\s*&\s*/g, ' & ')
}

export function toDirectives(answers: Answers): WizardDirectives {
  const heroLayout: HeroLayout =
    answers.heroTreatment === 'Editorial storytelling'
      ? 'editorial'
      : answers.heroTreatment === 'Centered conversion hero'
        ? 'centered'
        : 'split'

  const dominantStyle: DominantStyle =
    answers.personality === 'Luxury & High-end'
      ? 'dark-luxury'
      : answers.personality === 'Natural & Organic'
        ? 'organic'
        : answers.personality === 'Bold & Energetic'
          ? 'bold-playful'
          : answers.personality === 'Playful & Fun'
            ? 'maximalist'
            : answers.personality === 'Professional & Clinical'
              ? 'tech-precision'
              : 'minimalist'

  const colorScheme: ColorScheme =
    answers.mood === 'Dark & Moody' ? 'dark' : 'light'

  const fontStyle: FontStyle =
    answers.typography === 'Editorial & Refined'
      ? 'editorial-serif'
      : answers.typography === 'Technical & Precise'
        ? 'mono-tech'
        : answers.typography === 'Creative & Expressive'
          ? 'display-serif'
          : answers.typography === 'Friendly & Approachable'
            ? 'rounded'
            : 'modern-sans'

  const navStyle: NavStyle =
    answers.focus === 'Product discovery' || answers.focus === 'Conversions & Sales'
      ? 'filled'
      : answers.personality === 'Luxury & High-end'
        ? 'transparent'
        : 'bordered'

  const borderRadius: BorderRadius =
    answers.personality === 'Luxury & High-end'
      ? 'none'
      : answers.personality === 'Playful & Fun'
        ? 'full'
        : 'md'

  const productGridColumns: 2 | 3 | 4 =
    answers.density === 'Spacious premium'
      ? 2
      : answers.density === 'Dense discovery'
        ? 4
        : 3

  const productGridLayout: ProductGridLayout =
    answers.density === 'Dense discovery' ||
    answers.category === 'Electronics & Tech' ||
    answers.category === 'Health & Wellness' ||
    answers.focus === 'Trust & Credibility'
      ? 'list'
      : 'grid'

  const ctaStyle: WizardDirectives['ctaStyle'] =
    answers.focus === 'Conversions & Sales'
      ? 'promotion-first'
      : answers.focus === 'Brand storytelling'
        ? 'editorial-soft'
        : answers.focus === 'Product discovery'
          ? 'utility-first'
          : 'brand-first'

  const imageryStyle: ImageryStyle =
    answers.category === 'Food & Beverage'
      ? 'restaurant-food'
      : answers.category === 'Electronics & Tech'
        ? 'app-ui'
        : answers.category === 'Fashion & Apparel'
          ? 'editorial-campaign'
          : 'lifestyle'

  const headlineTone: WizardDirectives['headlineTone'] =
    answers.focus === 'Conversions & Sales'
      ? 'urgent'
      : answers.focus === 'Trust & Credibility'
        ? 'functional'
        : answers.personality === 'Luxury & High-end'
          ? 'premium'
          : 'editorial'

  const modules: SectionType[] =
    answers.merchandising === 'Promotions + urgency'
      ? ['announcement-bar', 'benefits-bar', 'newsletter']
      : answers.merchandising === 'Collections + editorial curation'
        ? ['featured-collection', 'brand-strip', 'testimonials']
        : ['trust-badges', 'benefits-bar', 'testimonials']

  const sectionOrder: SectionType[] =
    answers.focus === 'Product discovery'
      ? ['hero', 'categories', 'product-grid', ...modules, 'footer']
      : answers.focus === 'Brand storytelling'
        ? ['hero', 'featured-collection', ...modules, 'product-grid', 'footer']
        : ['hero', ...modules, 'product-grid', 'categories', 'footer']

  return {
    heroLayout,
    dominantStyle,
    navStyle,
    colorScheme,
    fontStyle,
    borderRadius,
    productGridColumns,
    productGridLayout,
    ctaStyle,
    imageryStyle,
    headlineTone,
    sectionOrder,
    modules,
  }
}

export function synthesizeGoal(answers: Answers): string {
  const d = toDirectives(answers)
  const parts: string[] = []
  if (answers.category) parts.push(`This is a ${answers.category} store`)
  if (answers.personality) parts.push(`with a "${answers.personality}" brand personality`)
  if (answers.mood) parts.push(`The visual mood should be "${answers.mood}"`)
  if (answers.typography) parts.push(`Typography should feel "${answers.typography}"`)
  if (answers.customer) parts.push(`targeting ${answers.customer}`)
  if (answers.focus) parts.push(`Primary focus: ${answers.focus}`)
  return [
    parts.join('. ') + '.',
    'Create a cohesive storefront design that reflects these selections with clear visual differences.',
    'Hard directives (must follow unless accessibility fails):',
    `- heroLayout: ${d.heroLayout}`,
    `- dominantStyle: ${d.dominantStyle}`,
    `- navStyle: ${d.navStyle}`,
    `- colorScheme: ${d.colorScheme}`,
    `- fontStyle: ${d.fontStyle}`,
    `- borderRadius: ${d.borderRadius}`,
    `- productGridColumns: ${d.productGridColumns}`,
    `- productGridLayout: ${d.productGridLayout}`,
    `- ctaStyle: ${d.ctaStyle}`,
    `- imageryStyle: ${d.imageryStyle}`,
    `- headlineTone: ${d.headlineTone}`,
    `- prioritize sections: ${d.modules.join(', ')}`,
    `- target section order: ${d.sectionOrder.join(' > ')}`,
    'Please produce a plan that is visibly distinct from generic defaults and ties each major change back to these directives.',
  ].join('\n')
}

function heroCopy(answers: Answers, directives: WizardDirectives) {
  const category = baseCategoryLabel(answers.category)

  if (answers.focus === 'Product discovery') {
    return {
      title: `Find the right ${category.toLowerCase()} faster`,
      subtitle: 'Compare the top picks, scan the details, and move quickly from browsing to buying.',
      ctaText: 'Browse Best Sellers',
    }
  }

  if (answers.focus === 'Conversions & Sales') {
    return {
      title: `Shop our best ${category.toLowerCase()} now`,
      subtitle: 'A high-conversion storefront built to highlight value, urgency, and confident first clicks.',
      ctaText: 'Shop Now',
    }
  }

  if (answers.focus === 'Trust & Credibility') {
    return {
      title: `Trusted ${category.toLowerCase()} essentials`,
      subtitle: 'Clear product proof, strong reassurance, and a storefront that feels dependable at a glance.',
      ctaText: 'Explore Products',
    }
  }

  return {
    title: directives.heroLayout === 'editorial' ? `A more considered take on ${category.toLowerCase()}` : `Discover standout ${category.toLowerCase()}`,
    subtitle: 'A curated baseline with stronger visual hierarchy, clearer storytelling, and a more intentional first impression.',
    ctaText: directives.heroLayout === 'editorial' ? 'View Collection' : 'Explore Collection',
  }
}

export function buildAnalyticBaseline(answers: Answers): AnalyticBaseline {
  const directives = toDirectives(answers)
  const palette = PALETTES[directives.dominantStyle][directives.colorScheme]
  const copy = heroCopy(answers, directives)
  const category = baseCategoryLabel(answers.category)
  const goal = synthesizeGoal(answers)

  const sectionData: Partial<StorefrontSectionData> = {
    'announcement-bar': {
      text: answers.focus === 'Conversions & Sales' ? 'Limited-time launch offer — curated picks, sharper pricing, faster checkout.' : 'Designed baseline activated — refine the copy and visuals from here.',
      backgroundColor: palette.secondaryColor,
    },
    'featured-collection': {
      heading: answers.focus === 'Brand storytelling' ? 'Editor’s spotlight' : 'Featured collection',
      subheading: `A curated starting point for ${category.toLowerCase()}.`,
      layout: directives.productGridLayout === 'list' ? 'horizontal-scroll' : 'grid',
    },
    testimonials: {
      heading: 'What customers notice first',
      layout: directives.productGridLayout === 'list' ? 'list' : 'featured',
      showRatings: true,
      items: [
        { quote: 'Sharper hierarchy and easier browsing right away.', author: 'Studio Shopper', location: 'Online', rating: 5 },
        { quote: 'The layout feels more confident and easier to trust.', author: 'Early Customer', location: 'Web', rating: 5 },
        { quote: 'Great baseline for quick iteration and refinement.', author: 'Merch Lead', location: 'In-house', rating: 5 },
      ],
    },
    newsletter: {
      heading: 'Stay in the loop',
      subtext: 'Use this block for offers, launches, or subscriber perks.',
      buttonText: 'Subscribe',
      incentive: answers.focus === 'Conversions & Sales' ? 'Get 10% off your first order' : undefined,
    },
    'brand-strip': {
      heading: answers.personality === 'Luxury & High-end' ? 'As seen in' : 'Trusted by growing brands',
      brands: [
        { name: 'Northstar' },
        { name: 'Harbor' },
        { name: 'Aster' },
        { name: 'Pioneer' },
      ],
    },
    'trust-badges': {
      items: [
        { icon: 'shield', label: 'Secure checkout' },
        { icon: 'truck', label: 'Fast shipping' },
        { icon: 'refresh', label: 'Easy returns' },
        { icon: 'award', label: 'Top-rated products' },
      ],
    },
  }

  const summaryBullets = [
    `${humanize(directives.heroLayout)} hero with ${humanize(directives.navStyle)} navigation`,
    `${directives.colorScheme} theme using ${humanize(directives.fontStyle)}`,
    directives.productGridLayout === 'list'
      ? `comparison-friendly list layout with ${directives.productGridColumns} density settings`
      : `${directives.productGridColumns}-column grid for more visual browsing`,
    `priority modules: ${directives.modules.map(humanize).join(', ')}`,
  ]

  return {
    goal,
    directives,
    theme: {
      ...palette,
      navStyle: directives.navStyle,
      colorScheme: directives.colorScheme,
      fontStyle: directives.fontStyle,
      borderRadius: directives.borderRadius,
    },
    hero: {
      layout: directives.heroLayout,
      title: copy.title,
      subtitle: copy.subtitle,
      ctaText: copy.ctaText,
      badge: answers.personality === 'Luxury & High-end' ? 'Curated edit' : answers.focus === 'Conversions & Sales' ? 'Best sellers' : 'Recommended baseline',
      textAlign: directives.heroLayout === 'centered' ? 'center' : 'left',
      ctaVariant: directives.heroLayout === 'editorial' ? 'outline' : 'solid',
      overlayOpacity: directives.heroLayout === 'editorial' ? 0.35 : 0.15,
    },
    productGrid: {
      columns: directives.productGridColumns,
      layout: directives.productGridLayout,
      showRatings: directives.productGridLayout === 'list' || answers.focus === 'Trust & Credibility',
      showBadges: true,
      heading: answers.focus === 'Product discovery' ? 'Compare top picks' : 'Featured products',
    },
    categories: {
      heading: answers.focus === 'Product discovery' ? 'Shop by category' : 'Browse the collection',
    },
    footer: {
      tagline: answers.personality === 'Luxury & High-end' ? 'Crafted for a more considered storefront.' : 'A practical baseline built for fast iteration.',
    },
    sectionOrder: directives.sectionOrder,
    sectionData,
    summary: {
      title: `${category} baseline ready`,
      bullets: summaryBullets,
    },
  }
}

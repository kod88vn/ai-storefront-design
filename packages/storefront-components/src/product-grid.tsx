import type { ProductGridConfig, ThemeConfig, Product } from '@ai-storefront/types'
import { Star } from 'lucide-react'
import { pickAccessibleTextColor } from './accessibility'
import { sampleProducts } from './data'

interface ProductGridProps {
    config: ProductGridConfig
    theme: ThemeConfig
}

interface ProductItemProps {
    product: Product
    theme: ThemeConfig
    cardBg: string
    cardText: string
    metaText: string
    priceText: string
    badgeText: string
    showBadges: boolean
    showRatings: boolean
}

const FONT_SIZE_MAP = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' } as const

function ProductStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-3 w-3 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
            ))}
        </div>
    )
}

function GridCard({ product, theme, cardText, metaText, priceText, badgeText, showBadges, showRatings }: ProductItemProps) {
    return (
        <article data-testid="storefront-product-card" className="group cursor-pointer">
            <div className="relative aspect-square overflow-hidden bg-neutral-100" style={{ borderRadius: 'var(--storefront-radius)' }}>
                <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {product.badge && showBadges && (
                    <span className="absolute left-2 top-2 px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: theme.secondaryColor, borderRadius: 'var(--storefront-radius)', color: badgeText }}>
                        {product.badge}
                    </span>
                )}
            </div>
            <div className="mt-3 space-y-1">
                {showRatings && product.rating !== undefined && (
                    <div className="flex items-center gap-1.5">
                        <ProductStars rating={product.rating} />
                        {product.reviewCount !== undefined && <span className="text-xs" style={{ color: metaText }}>({product.reviewCount})</span>}
                    </div>
                )}
                <h3 className="text-sm font-medium" style={{ color: cardText }}>{product.title}</h3>
                <p className="text-sm font-semibold" style={{ color: priceText }}>${product.price.toFixed(2)}</p>
            </div>
        </article>
    )
}

function ListRow({ product, theme, cardBg, cardText, metaText, priceText, badgeText, showBadges, showRatings }: ProductItemProps) {
    return (
        <article data-testid="storefront-product-list-item" className="grid gap-4 overflow-hidden border p-3 sm:grid-cols-[140px_1fr_auto] sm:items-center" style={{ backgroundColor: cardBg, borderColor: `${metaText}33`, borderRadius: 'var(--storefront-radius)' }}>
            <div className="relative aspect-square overflow-hidden bg-neutral-100" style={{ borderRadius: 'var(--storefront-radius)' }}>
                <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                {product.badge && showBadges && (
                    <span className="absolute left-2 top-2 px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: theme.secondaryColor, borderRadius: 'var(--storefront-radius)', color: badgeText }}>
                        {product.badge}
                    </span>
                )}
            </div>
            <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold" style={{ color: cardText }}>{product.title}</h3>
                {showRatings && product.rating !== undefined && (
                    <div className="flex items-center gap-1.5">
                        <ProductStars rating={product.rating} />
                        {product.reviewCount !== undefined && <span className="text-xs" style={{ color: metaText }}>({product.reviewCount} reviews)</span>}
                    </div>
                )}
                {product.description && <p className="text-sm leading-relaxed" style={{ color: metaText }}>{product.description}</p>}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
                <p className="text-base font-semibold" style={{ color: priceText }}>${product.price.toFixed(2)}</p>
                <button data-testid="storefront-product-list-cta" className="rounded-md px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: theme.primaryColor, color: pickAccessibleTextColor(theme.primaryColor, '#ffffff') }}>
                    View Details
                </button>
            </div>
        </article>
    )
}

export function StorefrontProductGrid({ config, theme }: ProductGridProps) {
    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const isList = config.layout === 'list'
    const gridClass = isList ? 'grid-cols-1' : config.columns === 2 ? 'sm:grid-cols-2' : config.columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
    const effectiveBg = config.backgroundColor ?? (isDark ? '#111111' : '#ffffff')
    const cardBg = isDark ? '#1a1a1a' : '#ffffff'
    const effectiveText = pickAccessibleTextColor(effectiveBg, config.textColor ?? (isDark ? '#f5f5f5' : theme.primaryColor))
    const cardText = pickAccessibleTextColor(cardBg, isDark ? '#f5f5f5' : '#171717')
    const metaText = pickAccessibleTextColor(cardBg, isDark ? '#d4d4d4' : '#525252')
    const priceText = pickAccessibleTextColor(cardBg, theme.primaryColor)
    const badgeText = pickAccessibleTextColor(theme.secondaryColor, '#ffffff')
    const effectiveFontSize = config.fontSize ? FONT_SIZE_MAP[config.fontSize] : undefined
    const sharedProps = {
        theme,
        cardBg,
        cardText,
        metaText,
        priceText,
        badgeText,
        showBadges: config.showBadges !== false,
        showRatings: config.showRatings !== false,
    }

    return (
        <section data-testid="storefront-product-grid" className="px-4 py-12 sm:px-6" style={{ backgroundColor: effectiveBg, fontSize: effectiveFontSize }}>
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-semibold" style={{ color: effectiveText }}>{config.heading ?? 'Featured Products'}</h2>
                {isList ? (
                    <div data-testid="storefront-product-list" className="space-y-4">
                        {sampleProducts.map((product) => <ListRow key={product.id} product={product} {...sharedProps} />)}
                    </div>
                ) : (
                    <div data-testid="storefront-product-cards" className={`grid grid-cols-1 gap-6 ${gridClass}`}>
                        {sampleProducts.map((product) => <GridCard key={product.id} product={product} {...sharedProps} />)}
                    </div>
                )}
            </div>
        </section>
    )
}


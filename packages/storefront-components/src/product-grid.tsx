import type { ProductGridConfig, ThemeConfig } from '@ai-storefront/types'
import { Star } from 'lucide-react'
import { pickAccessibleTextColor } from './accessibility'
import { sampleProducts } from './data'

interface ProductGridProps {
    config: ProductGridConfig
    theme: ThemeConfig
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

export function StorefrontProductGrid({ config, theme }: ProductGridProps) {
    const gridClass = config.columns === 2 ? 'sm:grid-cols-2' : config.columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const effectiveBg = config.backgroundColor ?? (isDark ? '#111111' : '#ffffff')
    const cardBg = isDark ? '#2a2a2a' : '#ffffff'
    const effectiveText = pickAccessibleTextColor(effectiveBg, config.textColor ?? (isDark ? '#f5f5f5' : theme.primaryColor))
    const cardText = pickAccessibleTextColor(cardBg, isDark ? '#f5f5f5' : '#171717')
    const metaText = pickAccessibleTextColor(cardBg, isDark ? '#d4d4d4' : '#525252')
    const priceText = pickAccessibleTextColor(cardBg, theme.primaryColor)
    const badgeText = pickAccessibleTextColor(theme.secondaryColor, '#ffffff')
    const effectiveFontSize = config.fontSize ? FONT_SIZE_MAP[config.fontSize] : undefined

    return (
        <section data-testid="storefront-product-grid" className="px-4 py-12 sm:px-6" style={{ backgroundColor: effectiveBg, fontSize: effectiveFontSize }}>
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-semibold" style={{ color: effectiveText }}>{config.heading ?? 'Featured Products'}</h2>
                <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
                    {sampleProducts.map((product) => (
                        <article key={product.id} data-testid="storefront-product-card" className="group cursor-pointer">
                            <div className="relative aspect-square overflow-hidden bg-neutral-100" style={{ borderRadius: 'var(--storefront-radius)' }}>
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {product.badge && config.showBadges !== false && (
                                    <span
                                        className="absolute left-2 top-2 px-2 py-0.5 text-xs font-semibold"
                                        style={{ backgroundColor: theme.secondaryColor, borderRadius: 'var(--storefront-radius)', color: badgeText }}
                                    >
                                        {product.badge}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 space-y-1">
                                {config.showRatings !== false && product.rating !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <ProductStars rating={product.rating} />
                                        {product.reviewCount !== undefined && (
                                            <span className="text-xs" style={{ color: metaText }}>({product.reviewCount})</span>
                                        )}
                                    </div>
                                )}
                                <h3 className="text-sm font-medium" style={{ color: cardText }}>{product.title}</h3>
                                <p className="text-sm font-semibold" style={{ color: priceText }}>${product.price.toFixed(2)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}


'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import type { CartItem, NavConfig, ProductsPageConfig, ThemeConfig } from '@ai-storefront/types'
import { StorefrontNavbar } from '../navbar'
import { sampleCategories, sampleProducts } from '../data'

interface ProductsPageProps {
    theme: ThemeConfig
    navConfig?: NavConfig
    pagesConfig?: Partial<ProductsPageConfig>
    cartItems?: CartItem[]
    onAddToCart?: (productId: string) => void
}

function ProductStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-3 w-3 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
            ))}
        </div>
    )
}

export function ProductsPage({ theme, navConfig, pagesConfig, cartItems = [], onAddToCart }: ProductsPageProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const cfg: ProductsPageConfig = {
        heading: 'All Products',
        columns: 3,
        showFilters: true,
        ...pagesConfig,
    }

    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const bg = isDark ? '#0a0a0a' : '#ffffff'
    const bgMuted = isDark ? '#1a1a1a' : '#f5f5f5'
    const text = isDark ? '#f5f5f5' : '#0a0a0a'
    const mutedText = isDark ? '#a3a3a3' : '#737373'
    const cardBg = isDark ? '#1a1a1a' : '#ffffff'
    const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'

    const filtered = activeCategory
        ? sampleProducts.filter((p) => p.category === activeCategory)
        : sampleProducts

    const gridCls =
        cfg.columns === 2 ? 'grid-cols-1 sm:grid-cols-2'
            : cfg.columns === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

    const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

    const FONT_FAMILIES: Record<string, string> = {
        'modern-sans': 'system-ui, -apple-system, "Segoe UI", sans-serif',
        'editorial-serif': 'Georgia, "Times New Roman", serif',
        'mono-tech': '"SF Mono", "Roboto Mono", "Courier New", monospace',
    }
    const fontFamily = FONT_FAMILIES[theme.fontStyle ?? 'modern-sans'] ?? 'system-ui, sans-serif'
    const radiusMap: Record<string, string> = { none: '0px', sm: '4px', md: '8px', lg: '16px', xl: '24px', full: '9999px' }
    const radius = radiusMap[theme.borderRadius] ?? '8px'

    return (
        <div
            data-testid="products-page"
            className={`min-h-screen ${theme.navStyle === 'transparent' ? 'relative' : ''}`}
            style={{ backgroundColor: bg, color: text, fontFamily, ['--storefront-radius' as string]: radius }}
        >
            <StorefrontNavbar theme={theme} navConfig={navConfig} cartCount={cartCount} onCartClick={() => window.location.href = '/cart'} />

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <h1 className="text-3xl font-semibold" style={{ color: theme.primaryColor }}>{cfg.heading}</h1>
                {cfg.subheading && <p className="mt-2 text-sm" style={{ color: mutedText }}>{cfg.subheading}</p>}

                {cfg.showFilters && (
                    <div data-testid="category-filters" className="mt-6 flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            data-testid="filter-all"
                            className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                            style={!activeCategory ? { backgroundColor: theme.primaryColor, color: '#fff' } : { backgroundColor: bgMuted, color: mutedText, border: `1px solid ${borderColor}` }}
                        >
                            All
                        </button>
                        {sampleCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.slug)}
                                data-testid={`filter-${cat.slug}`}
                                className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors"
                                style={activeCategory === cat.slug ? { backgroundColor: theme.primaryColor, color: '#fff' } : { backgroundColor: bgMuted, color: mutedText, border: `1px solid ${borderColor}` }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className={`mt-8 grid gap-6 ${gridCls}`} data-testid="products-grid">
                    {filtered.map((product) => {
                        const inCart = cartItems.some((i) => i.productId === product.id)
                        return (
                            <article key={product.id} data-testid={`product-card-${product.id}`} className="group rounded-lg overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                                <a href={`/products/${product.id}`}>
                                    <div className="relative aspect-square overflow-hidden" style={{ borderRadius: `${radius} ${radius} 0 0` }}>
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {product.badge && (
                                            <span className="absolute left-3 top-3 px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: theme.secondaryColor, borderRadius: radius }}>
                                                {product.badge}
                                            </span>
                                        )}
                                    </div>
                                </a>
                                <div className="p-4">
                                    {product.rating !== undefined && (
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <ProductStars rating={product.rating} />
                                            {product.reviewCount !== undefined && (
                                                <span className="text-xs" style={{ color: mutedText }}>({product.reviewCount})</span>
                                            )}
                                        </div>
                                    )}
                                    <a href={`/products/${product.id}`}>
                                        <h2 className="text-sm font-medium" style={{ color: text }}>{product.title}</h2>
                                    </a>
                                    <p className="mt-1 text-sm font-semibold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</p>
                                    <button
                                        data-testid={`add-to-cart-${product.id}`}
                                        onClick={() => onAddToCart?.(product.id)}
                                        className="mt-3 w-full py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: inCart ? theme.secondaryColor : theme.primaryColor, borderRadius: radius }}
                                    >
                                        {inCart ? '✓ Added' : 'Add to Cart'}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}

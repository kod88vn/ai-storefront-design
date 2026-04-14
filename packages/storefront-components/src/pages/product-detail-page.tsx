'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ShoppingBag, Minus, Plus } from 'lucide-react'
import type { CartItem, NavConfig, ProductDetailPageConfig, ThemeConfig } from '@ai-storefront/types'
import { StorefrontNavbar } from '../navbar'
import { sampleProducts } from '../data'

interface ProductDetailPageProps {
    theme: ThemeConfig
    navConfig?: NavConfig
    productId?: string
    pagesConfig?: Partial<ProductDetailPageConfig>
    cartItems?: CartItem[]
    onAddToCart?: (productId: string, qty: number) => void
    showNav?: boolean
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
            ))}
        </div>
    )
}

export function ProductDetailPage({ theme, navConfig, productId, pagesConfig, cartItems = [], onAddToCart, showNav = true }: ProductDetailPageProps) {
    const [qty, setQty] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [added, setAdded] = useState(false)

    const cfg: ProductDetailPageConfig = { showReviews: true, showRelated: true, ...pagesConfig }

    const product = productId
        ? sampleProducts.find((p) => p.id === productId) ?? sampleProducts[0]
        : sampleProducts[0]

    const related = sampleProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3)

    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const bg = isDark ? '#0a0a0a' : '#ffffff'
    const bgMuted = isDark ? '#1a1a1a' : '#f5f5f5'
    const text = isDark ? '#f5f5f5' : '#0a0a0a'
    const mutedText = isDark ? '#a3a3a3' : '#737373'
    const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'

    const FONT_FAMILIES: Record<string, string> = {
        'modern-sans': 'system-ui, -apple-system, "Segoe UI", sans-serif',
        'editorial-serif': 'Georgia, "Times New Roman", serif',
        'mono-tech': '"SF Mono", "Roboto Mono", "Courier New", monospace',
    }
    const fontFamily = FONT_FAMILIES[theme.fontStyle ?? 'modern-sans'] ?? 'system-ui, sans-serif'
    const radiusMap: Record<string, string> = { none: '0px', sm: '4px', md: '8px', lg: '16px', xl: '24px', full: '9999px' }
    const radius = radiusMap[theme.borderRadius] ?? '8px'

    const images = product.images?.length ? product.images : [product.image]
    const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

    function handleAddToCart() {
        onAddToCart?.(product.id, qty)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div
            data-testid="product-detail-page"
            className={`min-h-screen ${theme.navStyle === 'transparent' ? 'relative' : ''}`}
            style={{ backgroundColor: bg, color: text, fontFamily, ['--storefront-radius' as string]: radius }}
        >
            {showNav && <StorefrontNavbar theme={theme} navConfig={navConfig} cartCount={cartCount} onCartClick={() => window.location.href = '/cart'} />}

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <a href="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm" style={{ color: mutedText }}>
                    <ChevronLeft className="h-4 w-4" />Back to products
                </a>

                <div className="grid gap-10 lg:grid-cols-2">
                    {/* Images */}
                    <div data-testid="product-images" className="space-y-3">
                        <div className="aspect-square overflow-hidden" style={{ borderRadius: radius, backgroundColor: bgMuted }}>
                            <img src={images[activeImg]} alt={product.title} className="h-full w-full object-cover" />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className="h-16 w-16 overflow-hidden transition-opacity"
                                        style={{ borderRadius: radius, border: `2px solid ${i === activeImg ? theme.primaryColor : borderColor}`, opacity: i === activeImg ? 1 : 0.6 }}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div data-testid="product-info" className="space-y-5">
                        {product.badge && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: theme.secondaryColor, borderRadius: '999px' }}>
                                {product.badge}
                            </span>
                        )}
                        <h1 className="text-3xl font-semibold">{product.title}</h1>
                        <p className="text-2xl font-bold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</p>

                        {product.rating !== undefined && cfg.showReviews && (
                            <div className="flex items-center gap-2">
                                <Stars rating={product.rating} />
                                <span className="text-sm" style={{ color: mutedText }}>{product.reviewCount} reviews</span>
                            </div>
                        )}

                        {product.description && (
                            <p className="text-sm leading-relaxed" style={{ color: mutedText }}>{product.description}</p>
                        )}

                        <div className="flex items-center gap-3 border-t pt-5" style={{ borderColor }}>
                            <span className="text-sm font-medium">Qty</span>
                            <div className="flex items-center overflow-hidden rounded-md border" style={{ borderColor }}>
                                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center hover:bg-muted/20">
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                                <button onClick={() => setQty((q) => q + 1)} className="flex h-9 w-9 items-center justify-center hover:bg-muted/20">
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <button
                            data-testid="add-to-cart-button"
                            onClick={handleAddToCart}
                            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: added ? theme.secondaryColor : theme.primaryColor, borderRadius: radius }}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            {added ? 'Added to Cart!' : 'Add to Cart'}
                        </button>

                        <p className="text-center text-xs" style={{ color: mutedText }}>Free shipping on orders over $100</p>
                    </div>
                </div>

                {/* Related products */}
                {cfg.showRelated && related.length > 0 && (
                    <section data-testid="related-products" className="mt-16">
                        <h2 className="mb-6 text-xl font-semibold" style={{ color: theme.primaryColor }}>You might also like</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {related.map((p) => (
                                <a key={p.id} href={`/products/${p.id}`} data-testid={`related-product-${p.id}`} className="group block overflow-hidden" style={{ borderRadius: radius, border: `1px solid ${borderColor}` }}>
                                    <div className="aspect-square overflow-hidden" style={{ backgroundColor: bgMuted }}>
                                        <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium">{p.title}</p>
                                        <p className="mt-0.5 text-sm font-semibold" style={{ color: theme.primaryColor }}>${p.price.toFixed(2)}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

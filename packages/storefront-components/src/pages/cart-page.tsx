'use client'

import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'
import type { CartItem, CartPageConfig, NavConfig, ThemeConfig } from '@ai-storefront/types'
import { StorefrontNavbar } from '../navbar'

interface CartPageProps {
    theme: ThemeConfig
    navConfig?: NavConfig
    cartItems?: CartItem[]
    pagesConfig?: Partial<CartPageConfig>
    onUpdateQty?: (productId: string, qty: number) => void
    onRemove?: (productId: string) => void
    showNav?: boolean
}

export function CartPage({ theme, navConfig, cartItems = [], pagesConfig, onUpdateQty, onRemove, showNav = true }: CartPageProps) {
    const cfg: CartPageConfig = {
        emptyMessage: 'Your cart is empty. Start shopping!',
        checkoutButtonText: 'Proceed to Checkout',
        ...pagesConfig,
    }

    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const bg = isDark ? '#0a0a0a' : '#ffffff'
    const bgMuted = isDark ? '#1a1a1a' : '#f5f5f5'
    const text = isDark ? '#f5f5f5' : '#0a0a0a'
    const mutedText = isDark ? '#a3a3a3' : '#737373'
    const cardBg = isDark ? '#1a1a1a' : '#ffffff'
    const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'

    const FONT_FAMILIES: Record<string, string> = {
        'modern-sans': 'system-ui, -apple-system, "Segoe UI", sans-serif',
        'editorial-serif': 'Georgia, "Times New Roman", serif',
        'mono-tech': '"SF Mono", "Roboto Mono", "Courier New", monospace',
    }
    const fontFamily = FONT_FAMILIES[theme.fontStyle ?? 'modern-sans'] ?? 'system-ui, sans-serif'
    const radiusMap: Record<string, string> = { none: '0px', sm: '4px', md: '8px', lg: '16px', xl: '24px', full: '9999px' }
    const radius = radiusMap[theme.borderRadius] ?? '8px'

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
    const shipping = subtotal > 100 ? 0 : 9.99
    const total = subtotal + shipping

    return (
        <div
            data-testid="cart-page"
            className={`min-h-screen ${theme.navStyle === 'transparent' ? 'relative' : ''}`}
            style={{ backgroundColor: bg, color: text, fontFamily, ['--storefront-radius' as string]: radius }}
        >
            {showNav && <StorefrontNavbar theme={theme} navConfig={navConfig} cartCount={cartCount} />}

            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <h1 className="text-3xl font-semibold" style={{ color: theme.primaryColor }}>Your Cart</h1>
                <p className="mt-1 text-sm" style={{ color: mutedText }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</p>

                {cartItems.length === 0 ? (
                    <div data-testid="cart-empty" className="mt-16 flex flex-col items-center gap-4 text-center">
                        <ShoppingBag className="h-16 w-16 opacity-20" />
                        <p className="text-lg" style={{ color: mutedText }}>{cfg.emptyMessage}</p>
                        <a
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white"
                            style={{ backgroundColor: theme.primaryColor, borderRadius: radius }}
                        >
                            Browse Products <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-8 lg:grid-cols-3">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
                            {cartItems.map((item) => (
                                <div
                                    key={item.productId}
                                    data-testid={`cart-item-${item.productId}`}
                                    className="flex gap-4 rounded-lg p-4"
                                    style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: radius }}
                                >
                                    <a href={`/products/${item.productId}`}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-20 w-20 object-cover flex-shrink-0"
                                            style={{ borderRadius: radius }}
                                        />
                                    </a>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <a href={`/products/${item.productId}`} className="text-sm font-medium">{item.title}</a>
                                                <p className="mt-0.5 text-sm font-semibold" style={{ color: theme.primaryColor }}>${item.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                data-testid={`remove-${item.productId}`}
                                                onClick={() => onRemove?.(item.productId)}
                                                className="p-1 transition-opacity hover:opacity-60"
                                                style={{ color: mutedText }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center overflow-hidden rounded-md border" style={{ borderColor }}>
                                                <button onClick={() => { const newQty = item.qty - 1; if (newQty <= 0) onRemove?.(item.productId); else onUpdateQty?.(item.productId, newQty) }} className="flex h-8 w-8 items-center justify-center hover:bg-muted/20">
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm">{item.qty}</span>
                                                <button onClick={() => onUpdateQty?.(item.productId, item.qty + 1)} className="flex h-8 w-8 items-center justify-center hover:bg-muted/20">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <span className="text-sm" style={{ color: mutedText }}>= ${(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div data-testid="cart-summary" className="h-fit space-y-4 rounded-lg p-5" style={{ backgroundColor: bgMuted, borderRadius: radius }}>
                            <h2 className="font-semibold">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: mutedText }}>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: mutedText }}>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                {shipping === 0 && <p className="text-xs" style={{ color: theme.secondaryColor }}>🎉 Free shipping applied!</p>}
                            </div>
                            <div className="border-t pt-3" style={{ borderColor }}>
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span style={{ color: theme.primaryColor }}>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <a
                                href="/checkout"
                                data-testid="checkout-button"
                                className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: theme.primaryColor, borderRadius: radius }}
                            >
                                {cfg.checkoutButtonText} <ArrowRight className="h-4 w-4" />
                            </a>
                            <a href="/products" className="block text-center text-sm" style={{ color: mutedText }}>
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

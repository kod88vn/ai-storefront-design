'use client'

import { StorefrontNavbar, StorefrontFooter } from '@ai-storefront/storefront-components'
import { useCart } from '../../lib/cart-context'
import { useConfig } from '../../lib/use-config'

export default function CheckoutPage() {
    const config = useConfig()
    const { count } = useCart()

    if (!config) return null

    return (
        <div className="min-h-screen" style={{ backgroundColor: (config.theme.colorScheme ?? 'light') === 'dark' ? '#0a0a0a' : '#ffffff', color: (config.theme.colorScheme ?? 'light') === 'dark' ? '#f5f5f5' : '#0a0a0a' }}>
            <StorefrontNavbar theme={config.theme} navConfig={config.nav} cartCount={count} />
            <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <div className="max-w-md space-y-4">
                    <div className="text-6xl">🚧</div>
                    <h1 className="text-3xl font-semibold" style={{ color: config.theme.primaryColor }}>
                        Checkout Coming Soon
                    </h1>
                    <p className="text-sm opacity-60">
                        We&apos;re working on a secure checkout experience. Check back soon!
                    </p>
                    <a
                        href="/cart"
                        className="inline-block rounded-md px-6 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: config.theme.primaryColor }}
                    >
                        Back to Cart
                    </a>
                </div>
            </main>
            <StorefrontFooter theme={config.theme} />
        </div>
    )
}

'use client'

import { StorefrontPreview } from '@ai-storefront/storefront-components'
import type { LayoutSection } from '@ai-storefront/types'
import { useCart } from '../../lib/cart-context'
import { useConfig } from '../../lib/use-config'

const DEFAULT_SECTIONS: LayoutSection[] = [
    { id: 'products-listing', type: 'products-listing', enabled: true, order: 0 },
    { id: 'footer', type: 'footer', enabled: true, order: 1 },
]

export default function ProductsListPage() {
    const config = useConfig()
    const { items, addToCart } = useCart()

    if (!config) return null

    const pageConfig = { ...config, sections: config.pagesSections?.products ?? DEFAULT_SECTIONS }

    return (
        <StorefrontPreview
            config={pageConfig}
            cartItems={items}
            onAddToCart={addToCart}
            cartCount={items.reduce((n, i) => n + i.qty, 0)}
        />
    )
}
